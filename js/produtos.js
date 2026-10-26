import { formatarPreco, precoParaApi } from './utils.js';
import { buscarImoveisApi } from './api.js';
import { criarCardImovel } from './card-imovel.js';
import { iniciarSelectsLocalizacao } from './localizacao.js';

const ITENS_POR_PAGINA = 9;

// ========== Abrir/fechar o filtro lateral (mobile) ==========
const $filtro = $('.filtro');
const $formLateral = $('.form-lateral');
$filtro.click(function () {
    $formLateral.toggleClass('_open');
    $filtro.toggleClass('_open');
});

// ========== Elementos ==========
const opCompra = document.getElementById('opcoes-compras');
const opAlugar = document.getElementById('opcoes-alugar');
const selectTipo = document.getElementById('tipo-imovel');
const selectEstado = document.getElementById('estado-imovel');
const selectCidade = document.getElementById('cidade-imovel');
const selectBairro = document.getElementById('bairro-imovel');
const inputPrecoMin = document.getElementById('preco-min');
const inputPrecoMax = document.getElementById('preco-max');
const inputAreaMin = document.getElementById('area-min');
const inputAreaMax = document.getElementById('area-max');
const selectOrdenacao = document.getElementById('ordenacao-resultados');
const btnBuscar = document.getElementById('btn-buscar');
const resultadoImoveis = document.getElementById('show-imoveis-filtrados');
const totalImoveis = document.getElementById('resultado-total-imoveis');

// ========== Estado inicial vindo da URL ==========
// A URL é a "fonte da verdade": dá para compartilhar o link de uma busca e o botão voltar funciona.
const paramsUrl = new URLSearchParams(window.location.search);

let finalidadeImovel = paramsUrl.get('finalidadeImovel') || 'VENDA';
const quantidades = {
    quartos: paramsUrl.get('quartos') || '',
    banheiros: paramsUrl.get('banheiros') || '',
    garagem: paramsUrl.get('garagem') || '',
};

function marcarFinalidade(finalidade) {
    finalidadeImovel = finalidade;
    opCompra.classList.toggle('btn-active', finalidade === 'VENDA');
    opAlugar.classList.toggle('btn-active', finalidade === 'LOCACAO');
}

marcarFinalidade(finalidadeImovel);
selectTipo.value = paramsUrl.get('tipoDeImovel') || 'Selecione';
selectOrdenacao.value = paramsUrl.get('ordenacao') || 'destaques';
inputPrecoMin.value = formatarPreco({ value: paramsUrl.get('precoVendaMin') || paramsUrl.get('precoLocacaoMin') || '' });
inputPrecoMax.value = formatarPreco({ value: paramsUrl.get('precoVendaMax') || paramsUrl.get('precoLocacaoMax') || '' });
inputAreaMin.value = paramsUrl.get('areaMin') || '';
inputAreaMax.value = paramsUrl.get('areaMax') || '';

iniciarSelectsLocalizacao(
    { estado: selectEstado, cidade: selectCidade, bairro: selectBairro },
    { estado: paramsUrl.get('estado'), cidade: paramsUrl.get('cidade'), bairro: paramsUrl.get('bairro') }
);

// ========== Quartos / banheiros / vagas ==========
// Cada grupo (#quartos, #banheiro, #vagas) tem botões 1, 2, 3, 4 e +5. A API interpreta como "no mínimo".
// Clicar no botão já selecionado desmarca o filtro.
function iniciarGrupoQuantidade(containerId, chave) {
    const opcoes = document.querySelectorAll(`#${containerId} .gtd-op`);

    function pintar() {
        opcoes.forEach(opcao => {
            const valor = opcao.innerText.replace('+', '').trim();
            opcao.style.backgroundColor = valor === String(quantidades[chave]) ? '#877b7b' : 'transparent';
        });
    }

    opcoes.forEach(opcao => opcao.addEventListener('click', () => {
        const valor = opcao.innerText.replace('+', '').trim();
        quantidades[chave] = quantidades[chave] === valor ? '' : valor;
        pintar();
    }));

    pintar();
}

iniciarGrupoQuantidade('quartos', 'quartos');
iniciarGrupoQuantidade('banheiro', 'banheiros');
iniciarGrupoQuantidade('vagas', 'garagem');

// ========== Preço e área ==========
inputPrecoMin.addEventListener('input', event => { event.target.value = formatarPreco(event.target); });
inputPrecoMax.addEventListener('input', event => { event.target.value = formatarPreco(event.target); });

function areaValida(input, seletorErro) {
    const valor = input.value.trim();
    const valido = valor === '' || (/^\d+$/.test(valor) && Number(valor) >= 1);
    document.querySelector(seletorErro).style.display = valido ? 'none' : 'block';
    return valido;
}

inputAreaMin.addEventListener('input', () => areaValida(inputAreaMin, '.erro-msg-area-min'));
inputAreaMax.addEventListener('input', () => areaValida(inputAreaMax, '.erro-msg-area-max'));

// ========== Busca ==========
// Lê todos os filtros direto dos campos no momento da busca
function montarFiltros(pagina) {
    const params = new URLSearchParams({ finalidadeImovel, page: pagina, size: ITENS_POR_PAGINA });

    if (selectTipo.value && selectTipo.value !== 'Selecione') params.append('tipoDeImovel', selectTipo.value);
    if (selectEstado.value) params.append('estado', selectEstado.value);
    if (selectCidade.value) params.append('cidade', selectCidade.value);
    if (selectBairro.value) params.append('bairro', selectBairro.value);
    Object.entries(quantidades).forEach(([chave, valor]) => { if (valor) params.append(chave, valor); });

    const sufixoPreco = finalidadeImovel === 'LOCACAO' ? 'Locacao' : 'Venda';
    if (inputPrecoMin.value) params.append(`preco${sufixoPreco}Min`, precoParaApi(inputPrecoMin.value));
    if (inputPrecoMax.value) params.append(`preco${sufixoPreco}Max`, precoParaApi(inputPrecoMax.value));

    if (inputAreaMin.value && areaValida(inputAreaMin, '.erro-msg-area-min')) params.append('areaMin', inputAreaMin.value.trim());
    if (inputAreaMax.value && areaValida(inputAreaMax, '.erro-msg-area-max')) params.append('areaMax', inputAreaMax.value.trim());

    if (selectOrdenacao.value) params.append('ordenacao', selectOrdenacao.value);

    return params;
}

// Na primeira carga usa os parâmetros da URL como vieram (os selects de localização ainda estão carregando)
async function buscar(params, atualizarUrl = true) {
    if (atualizarUrl) {
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    }

    totalImoveis.innerHTML = '<p>Buscando imóveis...</p>';
    // A API gratuita "dorme" quando ninguém acessa; se a primeira resposta demorar, avisamos em vez de parecer travado
    const avisoLento = setTimeout(() => {
        totalImoveis.innerHTML = '<p>Buscando imóveis... o servidor está acordando, pode levar alguns segundos.</p>';
    }, 4000);
    const pagina = await buscarImoveisApi(`${API_BASE_URL}/imovel/filtros/avancados?${params.toString()}`);
    clearTimeout(avisoLento);

    if (pagina.erro) {
        mostrarErro(params);
        return;
    }

    if (pagina.totalElements === 0) {
        mostrarSugestoes();
        return;
    }

    totalImoveis.innerHTML = `<p><b>${pagina.totalElements}</b> ${pagina.totalElements === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</p>`;
    resultadoImoveis.innerHTML = '';
    pagina.content.forEach(imovel => resultadoImoveis.appendChild(criarCardImovel(imovel, 'resultado')));
    atualizarPaginacao(pagina.number, pagina.totalPages);
}

function realizarBusca(pagina = 0) {
    buscar(montarFiltros(pagina));
}

function mostrarErro(params) {
    totalImoveis.innerHTML = '';
    document.querySelector('#paginacao').innerHTML = '';
    resultadoImoveis.innerHTML = `
        <div class="msg-info" style="display: flex;">
            <h3>Não foi possível carregar os imóveis agora.</h3>
            <br>
            <p>Verifique sua conexão e tente novamente.</p>
            <br>
            <button type="button" class="btn" id="tentar-novamente">Tentar novamente</button>
        </div>`;
    document.getElementById('tentar-novamente').addEventListener('click', () => buscar(params, false));
}

async function mostrarSugestoes() {
    totalImoveis.innerHTML = '<p style="font-size: 25px;"><b>Nenhum imóvel encontrado!</b></p>';
    resultadoImoveis.innerHTML = `
        <div class="msg-info" style="display: flex;">
            <h1><b>Oops!</b></h1>
            <br>
            <h3>Sua busca não retornou nenhum resultado.</h3>
            <br>
            <p>Veja algumas sugestões =></p>
        </div>`;
    document.querySelector('#paginacao').innerHTML = '';

    const sugestoes = await buscarImoveisApi(`${API_BASE_URL}/imovel?size=5`);
    sugestoes.content.forEach(imovel => resultadoImoveis.appendChild(criarCardImovel(imovel, 'resultado')));
}

// ========== Paginação (feita pela API) ==========
// Lista de páginas a exibir: primeira, última, a atual e vizinhas, com "..." nos intervalos
function gerarPaginasVisiveis(atual, total) {
    const janela = 1;
    const inicio = Math.max(0, atual - janela);
    const fim = Math.min(total - 1, atual + janela);

    const paginas = [0];
    if (inicio > 1) paginas.push('...');
    for (let i = inicio; i <= fim; i++) {
        if (i !== 0 && i !== total - 1) paginas.push(i);
    }
    if (fim < total - 2) paginas.push('...');
    paginas.push(total - 1);

    return paginas;
}

function criarBotao(texto, classes, aoClicar, rotulo) {
    const botao = document.createElement('button');
    botao.classList.add(...classes);
    botao.innerHTML = texto;
    if (rotulo) botao.setAttribute('aria-label', rotulo);
    botao.addEventListener('click', () => {
        window.scrollTo(0, 0);
        aoClicar();
    });
    return botao;
}

function atualizarPaginacao(paginaAtual, totalPaginas) {
    const paginacao = document.querySelector('#paginacao');
    paginacao.innerHTML = '';
    if (totalPaginas <= 1) return;

    if (paginaAtual > 0) {
        paginacao.appendChild(criarBotao('&lsaquo;', ['pagina-btn', 'pagina-nav'], () => realizarBusca(paginaAtual - 1), 'Página anterior'));
    }

    gerarPaginasVisiveis(paginaAtual, totalPaginas).forEach(pagina => {
        if (pagina === '...') {
            const reticencias = document.createElement('span');
            reticencias.classList.add('reticencias');
            reticencias.innerText = '...';
            paginacao.appendChild(reticencias);
            return;
        }
        const classe = paginaAtual === pagina ? 'ativo' : 'inativo';
        paginacao.appendChild(criarBotao(String(pagina + 1), ['pagina-btn', classe], () => realizarBusca(pagina)));
    });

    if (paginaAtual < totalPaginas - 1) {
        paginacao.appendChild(criarBotao('&rsaquo;', ['pagina-btn', 'pagina-nav'], () => realizarBusca(paginaAtual + 1), 'Próxima página'));
    }
}

// ========== Eventos ==========
opCompra.addEventListener('click', () => marcarFinalidade('VENDA'));
opAlugar.addEventListener('click', () => marcarFinalidade('LOCACAO'));

// Reordena na hora e volta para a primeira página
selectOrdenacao.addEventListener('change', () => realizarBusca(0));

btnBuscar.addEventListener('click', () => {
    document.querySelector('.filtro').classList.remove('_open');
    document.querySelector('.form-lateral').classList.remove('_open');
    window.scrollTo(0, 0);
    realizarBusca(0);
});

// Botão voltar/avançar do navegador: refaz a busca da URL
window.addEventListener('popstate', () => window.location.reload());

// ========== Primeira busca ==========
const paramsIniciais = new URLSearchParams(paramsUrl);
paramsIniciais.delete('suites'); // filtro antigo, não existe na API
paramsIniciais.set('size', ITENS_POR_PAGINA);
if (!paramsIniciais.get('finalidadeImovel')) paramsIniciais.set('finalidadeImovel', finalidadeImovel);
buscar(paramsIniciais, false);

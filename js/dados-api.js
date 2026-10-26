import { buscarImoveisApi } from './api.js';
import { criarCardImovel } from './card-imovel.js';
import { iniciarSelectsLocalizacao } from './localizacao.js';

// ========== Vitrines da home ==========
const containerDestaques = document.getElementById('show-container-imoveis');
const containerOportunidades = document.getElementById('ofertas-destaques-carousel'); // Contêiner do carrossel

const URL_BUSCA = `${API_BASE_URL}/imovel/filtros/avancados`;

// Busca com filtro; se não houver resultado, cai para a listagem geral (assim a vitrine nunca fica vazia)
async function buscarComReserva(filtro, quantidade) {
    const pagina = await buscarImoveisApi(`${URL_BUSCA}?${filtro}&size=${quantidade}`);
    if (pagina.content.length > 0) return pagina.content;
    return (await buscarImoveisApi(`${API_BASE_URL}/imovel?size=${quantidade}`)).content;
}

function renderizar(imoveis, container, variante) {
    container.innerHTML = '';
    if (imoveis.length === 0) {
        container.innerHTML = '<p class="msg-info" style="display:block; text-align:center; padding:30px 0;">Não foi possível carregar os imóveis agora. Atualize a página em instantes.</p>';
        return;
    }
    imoveis.forEach(imovel => container.appendChild(criarCardImovel(imovel, variante)));
}

containerDestaques.innerHTML = containerOportunidades.innerHTML = '<p class="msg-info" style="display:block; text-align:center; padding:30px 0;">Carregando imóveis...</p>';

// Carrossel principal = destaques; Oportunidades = os demais (sem repetir)
buscarComReserva('imovelDestaque=true', 4).then(imoveis => renderizar(imoveis, containerDestaques, 'home'));
buscarComReserva('imovelDestaque=false', 3).then(imoveis => renderizar(imoveis, containerOportunidades, 'oportunidade'));

// ========== Pesquisa da home ==========
const selectTipo = document.getElementById('tipo-imovel');
const selectEstado = document.getElementById('estado-imovel');
const selectCidade = document.getElementById('cidade-imovel');
const selectBairro = document.getElementById('bairro-imovel');
const btnBuscar = document.getElementById('buscar');
const btnComprar = document.getElementById('btn-comprar');
const btnAlugar = document.getElementById('btn-alugar');

let finalidadeImovel = 'VENDA'; // Por padrão começamos com VENDA

function marcarFinalidade(finalidade) {
    finalidadeImovel = finalidade;
    btnComprar.classList.toggle('active', finalidade === 'VENDA');
    btnAlugar.classList.toggle('active', finalidade === 'LOCACAO');
}

marcarFinalidade('VENDA');
iniciarSelectsLocalizacao({ estado: selectEstado, cidade: selectCidade, bairro: selectBairro });

btnComprar.addEventListener('click', () => marcarFinalidade('VENDA'));
btnAlugar.addEventListener('click', () => marcarFinalidade('LOCACAO'));

// Lê os valores direto dos campos no momento do clique e leva para a página de resultados
btnBuscar.addEventListener('click', () => {
    const params = new URLSearchParams({ finalidadeImovel });

    if (selectTipo.value && selectTipo.value !== 'Selecione') params.append('tipoDeImovel', selectTipo.value);
    if (selectEstado.value) params.append('estado', selectEstado.value);
    if (selectCidade.value) params.append('cidade', selectCidade.value);
    if (selectBairro.value) params.append('bairro', selectBairro.value);

    window.location.href = `produtos.html?${params.toString()}`;
});

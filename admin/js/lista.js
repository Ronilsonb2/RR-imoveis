import { api, avisar, exigirLogin, iniciarMenu, ROTULOS } from './api-admin.js';
import { escaparHtml, formatarMoeda, urlImagem } from '../../js/utils.js';

exigirLogin();
iniciarMenu();

const TAMANHO_PAGINA = 20;
const filtros = document.getElementById('filtros');
const corpo = document.getElementById('lista-imoveis');
const total = document.getElementById('total');
const anterior = document.getElementById('pagina-anterior');
const proxima = document.getElementById('pagina-proxima');
let pagina = 0;

// Preço exibido conforme a finalidade (aluguel mostra o valor mensal)
function precoDoImovel(imovel) {
    if (imovel.finalidadeImovel === 'LOCACAO') {
        return imovel.precoLocacao ? `R$ ${formatarMoeda(imovel.precoLocacao)}/mês` : '—';
    }
    return imovel.precoVenda ? `R$ ${formatarMoeda(imovel.precoVenda)}` : '—';
}

function opcoesDeStatus(atual) {
    return Object.entries(ROTULOS.status)
        .map(([valor, texto]) => `<option value="${valor}" ${valor === atual ? 'selected' : ''}>${texto}</option>`)
        .join('');
}

function linha(imovel) {
    const capa = imovel.imagens?.length ? urlImagem(imovel.imagens[0]) : '../img/sem-foto.jpeg';
    const endereco = imovel.endereco || {};
    const linkSite = imovel.status === 'ATIVO'
        ? `<a class="btn btn-sm btn-outline-secondary" href="../detalhes-imoveis.html?idImovel=${imovel.idImovel}" target="_blank" rel="noopener">Ver no site</a>`
        : '';

    return `
        <tr data-id="${imovel.idImovel}">
            <td><img class="miniatura" src="${escaparHtml(capa)}" alt="" loading="lazy"></td>
            <td>
                <div class="titulo-imovel fw-bold">${escaparHtml(imovel.titulo)}</div>
                <small class="text-muted">
                    #${imovel.idImovel} · ${ROTULOS.tipo[imovel.tipoDeImovel] || ''} · ${ROTULOS.finalidade[imovel.finalidadeImovel] || ''}
                    ${imovel.imovelDestaque ? '<span class="badge bg-warning text-dark ms-1">Destaque</span>' : ''}
                </small>
            </td>
            <td><small>${escaparHtml(endereco.bairro)}<br>${escaparHtml(endereco.cidade)}/${escaparHtml(endereco.estado)}</small></td>
            <td class="text-end text-nowrap">${precoDoImovel(imovel)}</td>
            <td>
                <select class="form-select form-select-sm select-status" aria-label="Status do imóvel ${imovel.idImovel}">
                    ${opcoesDeStatus(imovel.status)}
                </select>
            </td>
            <td class="text-end text-nowrap">
                ${linkSite}
                <a class="btn btn-sm btn-outline-primary" href="imovel.html?id=${imovel.idImovel}">Editar</a>
                <button class="btn btn-sm btn-outline-danger btn-excluir">Excluir</button>
            </td>
        </tr>`;
}

async function carregar() {
    const params = new URLSearchParams({ page: pagina, size: TAMANHO_PAGINA });
    new FormData(filtros).forEach((valor, campo) => {
        if (valor.trim()) params.append(campo, valor.trim());
    });

    try {
        const resposta = await api(`/admin/imoveis?${params}`);
        const { totalElements, totalPages } = resposta.page;

        corpo.innerHTML = resposta.content.length
            ? resposta.content.map(linha).join('')
            : '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum imóvel encontrado.</td></tr>';

        total.textContent = `${totalElements} imóve${totalElements === 1 ? 'l' : 'is'} · página ${pagina + 1} de ${Math.max(totalPages, 1)}`;
        anterior.disabled = pagina === 0;
        proxima.disabled = pagina + 1 >= totalPages;
    } catch (e) {
        corpo.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4"></td></tr>';
        corpo.querySelector('td').textContent = e.message;
    }
}

// Um único listener na tabela atende todas as linhas (inclusive as recriadas a cada carga)
corpo.addEventListener('change', async (evento) => {
    if (!evento.target.matches('.select-status')) return;
    const select = evento.target;
    const id = select.closest('tr').dataset.id;
    select.disabled = true;
    try {
        await api(`/imovel/${id}/status`, { metodo: 'PATCH', corpo: { status: select.value } });
        avisar(`Imóvel #${id} agora está ${ROTULOS.status[select.value].toLowerCase()}.`);
        await carregar(); // o botão "Ver no site" depende do status; e o filtro pode esconder a linha
    } catch (e) {
        avisar(e.message, 'danger');
        await carregar();
    }
});

corpo.addEventListener('click', async (evento) => {
    if (!evento.target.matches('.btn-excluir')) return;
    const tr = evento.target.closest('tr');
    const titulo = tr.querySelector(".titulo-imovel").textContent;
    if (!confirm(`Excluir definitivamente "${titulo}" e todas as fotos?\n\nPara só tirar do site, mude o status para Inativo.`)) return;

    try {
        await api(`/imovel/${tr.dataset.id}`, { metodo: 'DELETE' });
        avisar('Imóvel excluído.');
        await carregar();
    } catch (e) {
        avisar(e.message, 'danger');
    }
});

// Filtros: selects buscam na hora; o campo cidade espera o usuário parar de digitar
let espera;
filtros.addEventListener('input', (evento) => {
    clearTimeout(espera);
    espera = setTimeout(() => {
        pagina = 0;
        carregar();
    }, evento.target.tagName === 'INPUT' ? 400 : 0);
});
filtros.addEventListener('submit', (evento) => evento.preventDefault());

anterior.addEventListener('click', () => { pagina--; carregar(); });
proxima.addEventListener('click', () => { pagina++; carregar(); });

carregar();

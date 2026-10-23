// Acesso à API pelo painel: guarda o token do login e o envia em todas as chamadas.
// API_BASE_URL vem do ../js/config.js, carregado antes dos módulos.

const CHAVE_TOKEN = 'rr-admin-token';

// sessionStorage: o token some ao fechar a aba (mais seguro num computador compartilhado)
export function salvarSessao(tokenDTO) {
    sessionStorage.setItem(CHAVE_TOKEN, JSON.stringify(tokenDTO));
}

function tokenValido() {
    try {
        const sessao = JSON.parse(sessionStorage.getItem(CHAVE_TOKEN));
        // expiraEm vem da API; sem essa checagem, a primeira chamada daria 401 do mesmo jeito
        return sessao && new Date(sessao.expiraEm) > new Date() ? sessao.token : null;
    } catch {
        return null;
    }
}

// E-mail de quem está logado (campo "sub" do JWT), para destacar "você" na lista de usuários
export function emailLogado() {
    const token = tokenValido();
    if (!token) return null;
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(payload)).sub;
    } catch {
        return null;
    }
}

// Chamada no topo de cada página do painel: sem login válido, volta para a tela de login
export function exigirLogin() {
    if (!tokenValido()) irParaLogin();
}

export function sair() {
    sessionStorage.removeItem(CHAVE_TOKEN);
    window.location.href = 'login.html';
}

function irParaLogin() {
    sessionStorage.removeItem(CHAVE_TOKEN);
    // Guarda a página atual para voltar a ela depois do login
    const voltar = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
    window.location.href = `login.html?voltar=${voltar}`;
}

// Erro da API no formato ErroResponse { status, message, campos }
export class ErroApi extends Error {
    constructor(status, corpo) {
        super(corpo?.message || `Erro ${status} na comunicação com a API`);
        this.status = status;
        this.campos = corpo?.campos || {};
    }
}

// fetch com token. corpo: objeto (vira JSON) ou FormData (upload). Devolve o JSON da resposta ou null (204).
export async function api(caminho, { metodo = 'GET', corpo } = {}) {
    const headers = {};
    const token = tokenValido();
    if (token) headers.Authorization = `Bearer ${token}`;

    let body = corpo;
    if (corpo && !(corpo instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(corpo);
    }

    let resposta;
    try {
        resposta = await fetch(`${API_BASE_URL}${caminho}`, { method: metodo, headers, body });
    } catch {
        throw new ErroApi(0, { message: 'Não foi possível falar com a API. Ela está no ar?' });
    }

    if (resposta.status === 401 && caminho !== '/auth/login') {
        irParaLogin();
        throw new ErroApi(401, { message: 'Sessão expirada' });
    }

    const json = resposta.status === 204 ? null : await resposta.json().catch(() => null);
    if (!resposta.ok) throw new ErroApi(resposta.status, json);
    return json;
}

// Mensagem rápida no canto da tela (sucesso ou erro)
export function avisar(mensagem, tipo = 'success') {
    let area = document.getElementById('avisos');
    if (!area) {
        area = document.createElement('div');
        area.id = 'avisos';
        area.className = 'avisos';
        area.setAttribute('aria-live', 'polite');
        document.body.appendChild(area);
    }
    const aviso = document.createElement('div');
    aviso.className = `alert alert-${tipo} shadow-sm mb-2`;
    aviso.textContent = mensagem; // textContent: mensagem da API nunca vira HTML
    area.appendChild(aviso);
    setTimeout(() => aviso.remove(), tipo === 'success' ? 3000 : 6000);
}

// Liga o botão "Sair" presente no menu de todas as páginas
export function iniciarMenu() {
    document.getElementById('btn-sair')?.addEventListener('click', sair);
}

// Status que aparecem no site (mesma regra de StatusImovel.VISIVEIS_NO_SITE na API)
export const VISIVEIS_NO_SITE = ['ATIVO', 'RESERVADO'];

// Textos exibidos para os valores dos enums da API
export const ROTULOS = {
    status: { ATIVO: 'Ativo', RESERVADO: 'Reservado', INATIVO: 'Inativo', VENDIDO: 'Vendido', ALUGADO: 'Alugado' },
    finalidade: { VENDA: 'Venda', LOCACAO: 'Locação', PERMUTA: 'Permuta' },
    tipo: { CASA: 'Casa', APARTAMENTO: 'Apartamento', TERRENO: 'Terreno' },
};

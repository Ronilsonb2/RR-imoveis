import { api, avisar, exigirLogin, iniciarMenu } from './api-admin.js';
import { escaparHtml } from '../../js/utils.js';

exigirLogin();
iniciarMenu();

const TAMANHO_PAGINA = 20;
const form = document.getElementById('form-proprietario');
const erroForm = document.getElementById('erro-form');
const tituloForm = document.getElementById('titulo-form');
const cancelar = document.getElementById('btn-cancelar');
const corpo = document.getElementById('lista-proprietarios');
const total = document.getElementById('total');
const anterior = document.getElementById('pagina-anterior');
const proxima = document.getElementById('pagina-proxima');

let pagina = 0;
let emEdicao = null; // id do proprietário sendo editado; null = cadastro novo
let paginaAtual = [];

// 12345678901 -> 123.456.789-01
const formatarCpf = cpf => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
// 11987654321 -> (11) 98765-4321
const formatarTelefone = tel => tel.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

function linha(p) {
    return `
        <tr data-id="${p.id}">
            <td>${escaparHtml(p.nome)}</td>
            <td class="text-nowrap">${escaparHtml(formatarCpf(p.cpf))}</td>
            <td class="text-nowrap">${escaparHtml(formatarTelefone(p.telefone))}</td>
            <td>${escaparHtml(p.email)}</td>
            <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-outline-primary" data-acao="editar">Editar</button>
                <button class="btn btn-sm btn-outline-danger" data-acao="excluir">Excluir</button>
            </td>
        </tr>`;
}

async function carregar() {
    try {
        const resposta = await api(`/proprietario?page=${pagina}&size=${TAMANHO_PAGINA}`);
        const { totalElements, totalPages } = resposta.page;
        paginaAtual = resposta.content;

        corpo.innerHTML = paginaAtual.length
            ? paginaAtual.map(linha).join('')
            : '<tr><td colspan="5" class="text-center text-muted py-4">Nenhum proprietário cadastrado.</td></tr>';

        total.textContent = `${totalElements} proprietário(s) · página ${pagina + 1} de ${Math.max(totalPages, 1)}`;
        anterior.disabled = pagina === 0;
        proxima.disabled = pagina + 1 >= totalPages;
    } catch (e) {
        corpo.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4"></td></tr>';
        corpo.querySelector('td').textContent = e.message;
    }
}

function limparForm() {
    emEdicao = null;
    form.reset();
    form.classList.remove('was-validated');
    erroForm.classList.add('d-none');
    tituloForm.textContent = 'Novo proprietário';
    cancelar.classList.add('d-none');
}

function editar(proprietario) {
    limparForm();
    emEdicao = proprietario.id;
    ['nome', 'cpf', 'telefone', 'email'].forEach(campo => { form.elements[campo].value = proprietario[campo]; });
    tituloForm.textContent = `Editar ${proprietario.nome}`;
    cancelar.classList.remove('d-none');
    form.scrollIntoView({ behavior: 'smooth' });
    form.elements.nome.focus();
}

corpo.addEventListener('click', async (evento) => {
    const acao = evento.target.dataset.acao;
    if (!acao) return;
    const id = Number(evento.target.closest('tr').dataset.id);
    const proprietario = paginaAtual.find(p => p.id === id);

    if (acao === 'editar') editar(proprietario);

    if (acao === 'excluir') {
        if (!confirm(`Excluir ${proprietario.nome}?`)) return;
        try {
            await api(`/proprietario/${id}`, { metodo: 'DELETE' });
            avisar('Proprietário excluído.');
            if (emEdicao === id) limparForm();
            await carregar();
        } catch (e) {
            // 409: a API não deixa excluir quem ainda tem imóveis
            avisar(e.message, 'danger');
        }
    }
});

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroForm.classList.add('d-none');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const json = Object.fromEntries(['nome', 'cpf', 'telefone', 'email'].map(campo => [campo, form.elements[campo].value.trim()]));
    try {
        if (emEdicao) {
            await api(`/proprietario/${emEdicao}`, { metodo: 'PUT', corpo: json });
            avisar('Proprietário atualizado.');
        } else {
            await api('/proprietario', { metodo: 'POST', corpo: json });
            avisar('Proprietário cadastrado.');
        }
        limparForm();
        await carregar();
    } catch (e) {
        const detalhes = Object.entries(e.campos || {}).map(([campo, msg]) => `${campo}: ${msg}`);
        erroForm.textContent = [e.message, ...detalhes].join(' · ');
        erroForm.classList.remove('d-none');
    }
});

cancelar.addEventListener('click', limparForm);
anterior.addEventListener('click', () => { pagina--; carregar(); });
proxima.addEventListener('click', () => { pagina++; carregar(); });

carregar();

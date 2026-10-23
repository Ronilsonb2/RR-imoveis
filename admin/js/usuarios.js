import { api, avisar, emailLogado, exigirLogin, iniciarMenu, salvarSessao } from './api-admin.js';
import { escaparHtml } from '../../js/utils.js';

exigirLogin();
iniciarMenu();

const formSenha = document.getElementById('form-senha');
const erroSenha = document.getElementById('erro-senha');
const form = document.getElementById('form-usuario');
const erroForm = document.getElementById('erro-form');
const tituloForm = document.getElementById('titulo-form');
const grupoSenha = document.getElementById('grupo-senha');
const cancelar = document.getElementById('btn-cancelar');
const corpo = document.getElementById('lista-usuarios');

let emEdicao = null; // id do usuário sendo editado; null = cadastro novo
let usuarios = [];

function mostrarErro(elemento, e) {
    // As mensagens da API já dizem o campo ("A senha deve ter de 8 a 72 caracteres")
    elemento.textContent = [e.message, ...Object.values(e.campos || {})].join(' · ');
    elemento.classList.remove('d-none');
}

function linha(u) {
    const eu = u.email.toLowerCase() === (emailLogado() || '').toLowerCase();
    return `
        <tr data-id="${u.id}">
            <td>${escaparHtml(u.nome)}${eu ? ' <span class="badge bg-secondary">você</span>' : ''}</td>
            <td>${escaparHtml(u.email)}</td>
            <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-outline-primary" data-acao="editar">Editar</button>
                ${eu ? '' : `
                <button class="btn btn-sm btn-outline-secondary" data-acao="senha">Redefinir senha</button>
                <button class="btn btn-sm btn-outline-danger" data-acao="excluir">Excluir</button>`}
            </td>
        </tr>`;
}

async function carregar() {
    try {
        usuarios = await api('/usuarios');
        corpo.innerHTML = usuarios.map(linha).join('');
    } catch (e) {
        corpo.innerHTML = '<tr><td colspan="3" class="text-center text-danger py-4"></td></tr>';
        corpo.querySelector('td').textContent = e.message;
    }
}

function limparForm() {
    emEdicao = null;
    form.reset();
    form.classList.remove('was-validated');
    erroForm.classList.add('d-none');
    tituloForm.textContent = 'Novo usuário';
    // Na edição não há senha: para isso existe "Redefinir senha"
    grupoSenha.classList.remove('d-none');
    form.elements.senha.required = true;
    cancelar.classList.add('d-none');
}

function editar(usuario) {
    limparForm();
    emEdicao = usuario.id;
    form.elements.nome.value = usuario.nome;
    form.elements.email.value = usuario.email;
    grupoSenha.classList.add('d-none');
    form.elements.senha.required = false;
    tituloForm.textContent = `Editar ${usuario.nome}`;
    cancelar.classList.remove('d-none');
    form.scrollIntoView({ behavior: 'smooth' });
    form.elements.nome.focus();
}

corpo.addEventListener('click', async (evento) => {
    const acao = evento.target.dataset.acao;
    if (!acao) return;
    const id = Number(evento.target.closest('tr').dataset.id);
    const usuario = usuarios.find(u => u.id === id);

    if (acao === 'editar') editar(usuario);

    if (acao === 'senha') {
        const novaSenha = prompt(`Nova senha para ${usuario.nome} (de 8 a 72 caracteres):`);
        if (novaSenha === null) return;
        try {
            await api(`/usuarios/${id}/senha`, { metodo: 'PUT', corpo: { novaSenha } });
            avisar(`Senha de ${usuario.nome} redefinida. Ela precisa entrar de novo.`);
        } catch (e) {
            avisar([e.message, ...Object.values(e.campos || {})].join(' · '), 'danger');
        }
    }

    if (acao === 'excluir') {
        if (!confirm(`Excluir ${usuario.nome}? Esta pessoa perde o acesso ao painel na hora.`)) return;
        try {
            await api(`/usuarios/${id}`, { metodo: 'DELETE' });
            avisar('Usuário excluído.');
            if (emEdicao === id) limparForm();
            await carregar();
        } catch (e) {
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

    const json = { nome: form.elements.nome.value.trim(), email: form.elements.email.value.trim() };
    try {
        if (emEdicao) {
            const editandoEu = usuarios.find(u => u.id === emEdicao).email.toLowerCase() === (emailLogado() || '').toLowerCase();
            await api(`/usuarios/${emEdicao}`, { metodo: 'PUT', corpo: json });
            avisar('Usuário atualizado.');
            // Trocar o próprio e-mail invalida o token atual: a próxima chamada leva ao login
            if (editandoEu && json.email.toLowerCase() !== emailLogado().toLowerCase()) {
                avisar('E-mail alterado: entre novamente.', 'warning');
            }
        } else {
            await api('/usuarios', { metodo: 'POST', corpo: { ...json, senha: form.elements.senha.value } });
            avisar('Usuário cadastrado.');
        }
        limparForm();
        await carregar();
    } catch (e) {
        mostrarErro(erroForm, e);
    }
});

formSenha.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroSenha.classList.add('d-none');

    const confirmar = document.getElementById('confirmar-senha');
    confirmar.setCustomValidity(confirmar.value === formSenha.elements.novaSenha.value ? '' : 'As senhas não conferem');
    if (!formSenha.checkValidity()) {
        formSenha.classList.add('was-validated');
        return;
    }

    try {
        // A API devolve um token novo: o antigo deixa de valer assim que a senha muda
        const token = await api('/auth/senha', {
            metodo: 'PUT',
            corpo: { senhaAtual: formSenha.elements.senhaAtual.value, novaSenha: formSenha.elements.novaSenha.value },
        });
        salvarSessao(token);
        formSenha.reset();
        formSenha.classList.remove('was-validated');
        avisar('Senha alterada.');
    } catch (e) {
        mostrarErro(erroSenha, e);
    }
});

cancelar.addEventListener('click', limparForm);

carregar();

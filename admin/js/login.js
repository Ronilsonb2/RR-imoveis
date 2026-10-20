import { api, salvarSessao } from './api-admin.js';

const form = document.getElementById('form-login');
const erro = document.getElementById('erro-login');
const botao = form.querySelector('button');

// Só aceita voltar para uma página do próprio painel (evita redirecionar para outro site)
function destinoAposLogin() {
    const voltar = new URLSearchParams(window.location.search).get('voltar');
    return voltar && /^[\w-]+\.html(\?[\w=&-]*)?$/.test(voltar) ? voltar : 'index.html';
}

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erro.classList.add('d-none');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    botao.disabled = true;
    try {
        const token = await api('/auth/login', {
            metodo: 'POST',
            corpo: { email: form.email.value.trim(), senha: form.senha.value },
        });
        salvarSessao(token);
        window.location.href = destinoAposLogin();
    } catch (e) {
        erro.textContent = e.status === 401 ? 'E-mail ou senha incorretos.' : e.message;
        erro.classList.remove('d-none');
        botao.disabled = false;
    }
});

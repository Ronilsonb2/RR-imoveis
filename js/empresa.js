// Aplica os dados da imobiliária (js/config.js) nas páginas: nome, logo, contatos, CRECI,
// redes sociais e "Quem somos". O HTML só tem marcadores (data-empresa-*, data-contato, data-rede),
// assim o mesmo site serve para qualquer imobiliária.
// Script comum (não módulo), carregado logo depois do config.js, inclusive nas páginas do painel.
(function () {
    // Os caminhos do config são relativos à raiz do site; este arquivo fica em /js/, então a raiz é "../" dele.
    // Assim o logo funciona tanto em /index.html quanto em /admin/login.html.
    const raiz = new URL('../', document.currentScript.src);
    const urlDaRaiz = caminho => new URL(caminho, raiz).href;
    const cidade = CONTACT_ADDRESS.split(' - ')[0];
    const todos = (seletor, acao) => document.querySelectorAll(seletor).forEach(acao);

    // Nome e logo
    todos('[data-empresa-nome]', el => { el.textContent = EMPRESA_NOME; });
    // Se o arquivo do logo não existir, mostra o nome da empresa em texto no lugar da imagem quebrada
    todos('img[data-empresa-logo]', img => {
        img.addEventListener('error', () => {
            const texto = document.createElement('span');
            texto.className = 'logo-texto';
            texto.textContent = EMPRESA_NOME;
            img.replaceWith(texto);
        }, { once: true });
        img.src = urlDaRaiz(EMPRESA_LOGO);
        img.alt = EMPRESA_NOME;
    });

    // Título da aba: "Imóveis disponíveis — Nome da Imobiliária"
    if (!document.title.includes(EMPRESA_NOME)) {
        document.title = document.title ? `${document.title} — ${EMPRESA_NOME}` : EMPRESA_NOME;
    }
    document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', EMPRESA_NOME);

    // "Quem somos": um <p> por item de EMPRESA_SOBRE (textContent: o texto nunca vira HTML)
    todos('[data-empresa-sobre]', caixa => {
        caixa.replaceChildren(...EMPRESA_SOBRE.map(texto => {
            const p = document.createElement('p');
            p.textContent = texto;
            return p;
        }));
    });

    // Contatos do rodapé
    todos('[data-contato="endereco"]', el => { el.textContent = CONTACT_ADDRESS; });
    todos('a[data-contato="email"]', a => { a.href = `mailto:${CONTACT_EMAIL}`; a.textContent = CONTACT_EMAIL; });
    todos('a[data-contato="telefone"]', a => {
        a.href = `https://wa.me/${CONTACT_WHATSAPP_NUMBER}`;
        a.textContent = CONTACT_PHONE_DISPLAY;
    });

    // CRECI: só aparece quando preenchido
    if (CRECI_NUMBER) {
        todos('[data-creci]', el => { el.textContent = `CRECI: ${CRECI_NUMBER}`; el.hidden = false; });
    }

    // Redes sociais: link configurado fica ativo; sem link, o ícone fica apagado e não navega
    todos('a[data-rede]', a => {
        const link = SOCIAL_LINKS[a.dataset.rede];
        if (link) {
            a.href = link;
            a.target = '_blank';
            a.rel = 'noopener';
        } else {
            a.classList.add('rede-pendente');
            a.title = 'Link ainda não configurado';
            a.addEventListener('click', evento => evento.preventDefault());
        }
    });

    // Exemplos dos formulários com a cidade da empresa
    todos('[data-placeholder-cidade]', campo => { campo.placeholder = `Ex.: Centro, ${cidade}`; });
})();

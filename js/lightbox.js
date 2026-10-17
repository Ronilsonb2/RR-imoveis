// Lightbox de fotos, reaproveitado em index.html, produtos.html e detalhes-imoveis.html.
// Funciona por delegação de evento, então cobre imagens que ainda nem existem
// no DOM no momento em que este script carrega (ex.: cards vindos da API).
(function () {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox-fechar" aria-label="Fechar">&times;</button>
        <button class="lightbox-anterior" aria-label="Foto anterior">&lsaquo;</button>
        <img class="lightbox-imagem" src="" alt="Foto do imóvel ampliada">
        <button class="lightbox-proxima" aria-label="Próxima foto">&rsaquo;</button>
    `;
    document.body.appendChild(overlay);

    const imagemAtual = overlay.querySelector('.lightbox-imagem');
    const btnFechar = overlay.querySelector('.lightbox-fechar');
    const btnAnterior = overlay.querySelector('.lightbox-anterior');
    const btnProxima = overlay.querySelector('.lightbox-proxima');

    let imagens = [];
    let indiceAtual = 0;

    function coletarImagens(container) {
        // Ignora clones do Slick (usados no modo "infinite"), senão a mesma foto entra duplicada
        return Array.from(container.querySelectorAll('img'))
            .filter(img => !img.closest('.slick-cloned'))
            .map(img => img.src);
    }

    function mostrarImagem(indice) {
        indiceAtual = (indice + imagens.length) % imagens.length;
        imagemAtual.src = imagens[indiceAtual];

        const temVarias = imagens.length > 1;
        btnAnterior.style.display = temVarias ? '' : 'none';
        btnProxima.style.display = temVarias ? '' : 'none';
    }

    function abrir(container, imagemClicada) {
        imagens = coletarImagens(container);
        const indiceInicial = imagens.indexOf(imagemClicada.src);
        mostrarImagem(indiceInicial === -1 ? 0 : indiceInicial);

        overlay.classList.add('_open');
        document.body.style.overflow = 'hidden';
    }

    function fechar() {
        overlay.classList.remove('_open');
        document.body.style.overflow = '';
    }

    btnFechar.addEventListener('click', fechar);
    btnAnterior.addEventListener('click', () => mostrarImagem(indiceAtual - 1));
    btnProxima.addEventListener('click', () => mostrarImagem(indiceAtual + 1));

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) fechar();
    });

    document.addEventListener('keydown', function (event) {
        if (!overlay.classList.contains('_open')) return;
        if (event.key === 'Escape') fechar();
        if (event.key === 'ArrowLeft') mostrarImagem(indiceAtual - 1);
        if (event.key === 'ArrowRight') mostrarImagem(indiceAtual + 1);
    });

    document.addEventListener('click', function (event) {
        const img = event.target.closest('.imagens-imovel img');
        if (!img) return;

        const container = img.closest('.imagens-imovel');
        abrir(container, img);
    });
})();

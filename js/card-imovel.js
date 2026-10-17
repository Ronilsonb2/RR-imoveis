import { escaparHtml, formatarMoeda, textoPuro, truncateText, urlImagem } from './utils.js';

let contadorCarrossel = 0; // Garante um ID único para cada carrossel da página

// Monta o card de um imóvel. Usado na home (destaques e oportunidades) e na página de resultados.
// variante: "home" | "oportunidade" | "resultado" — muda só a estrutura que o CSS de cada seção espera.
export function criarCardImovel(imovel, variante = 'resultado') {
    contadorCarrossel++;
    const carouselId = `imagens-imovel-${variante}-${contadorCarrossel}`;

    const imagens = imovel.imagens?.length ? imovel.imagens : [null];
    const imagensHTML = imagens.map((imagem, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${escaparHtml(urlImagem(imagem))}" class="d-block w-100" alt="Foto do imóvel ${escaparHtml(imovel.titulo)}">
        </div>`).join('');

    // No card a descrição vira uma linha só (sem quebras nem HTML) e é cortada em 65 caracteres
    const descricaoResumida = escaparHtml(truncateText(textoPuro(imovel.descricao).replace(/\s+/g, ' ').trim(), 65));

    const preco = imovel.precoVenda != null
        ? `Venda<br> <span> ${formatarMoeda(imovel.precoVenda)}</span>`
        : `Locação<br> <span> ${formatarMoeda(imovel.precoLocacao)}</span>`;

    const link = `<a ${variante === 'resultado' ? 'target="_blank" rel="noopener"' : ''} href="detalhes-imoveis.html?idImovel=${encodeURIComponent(imovel.idImovel)}" class="btn-2">Mais detalhes</a>`;

    const precoELink = variante === 'oportunidade'
        ? `<div class="price-cta">
               <p class="price-imovel">${preco}</p>
               <div class="text-xs-center">${link}</div>
           </div>`
        : `<p class="price-imovel">${preco}</p>
           <div class="text-xs-center">${link}</div>`;

    const descricao = `
        <div class="desc-oferta ${variante === 'resultado' ? '' : 'desc-oferta-carousel'}">
            <div>
                <h2>${escaparHtml(imovel.titulo)}</h2>
                <h3>${escaparHtml(imovel.endereco?.bairro)}, ${escaparHtml(imovel.endereco?.cidade)}</h3>
            </div>
            <p class="descricao-curta">${descricaoResumida}</p>
            <div class="icons-config">
                <div class="icons metragem">${escaparHtml(imovel.areaConstruida ?? '-')}</div>
                <div class="icons quarto">${escaparHtml(imovel.quartos)}</div>
                <div class="icons banheiro">${escaparHtml(imovel.banheiros)}</div>
                <div class="icons garagem">${escaparHtml(imovel.garagem)}</div>
            </div>
            ${precoELink}
        </div>`;

    const slide = document.createElement('div');
    slide.classList.add('slide');
    slide.innerHTML = `
        <div class="box-produto">
            <div id="${carouselId}" class="imagens-imovel carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">${imagensHTML}</div>
                <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Anterior</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Próxima</span>
                </button>
            </div>
            ${variante === 'resultado' ? `<div class="desc-oferta-container">${descricao}</div>` : descricao}
        </div>`;

    return slide;
}

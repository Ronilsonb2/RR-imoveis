import { escaparHtml, precoExibicao, textoPuro, urlImagem, usarFotoPadraoSeFalhar } from './utils.js';

let contadorCarrossel = 0; // Garante um ID único para cada carrossel da página

// Monta o card de um imóvel. Usado na home (destaques e oportunidades) e na página de resultados.
// variante: "home" (horizontal, destaques da home) | "oportunidade" | "resultado" (verticais; o resultado da busca
// abre o imóvel em outra aba para não perder a pesquisa).
export function criarCardImovel(imovel, variante = 'resultado') {
    contadorCarrossel++;
    const carouselId = `imagens-imovel-${variante}-${contadorCarrossel}`;

    const imagens = imovel.imagens?.length ? imovel.imagens : [null];
    const imagensHTML = imagens.map((imagem, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${escaparHtml(urlImagem(imagem))}" class="d-block w-100" alt="Foto do imóvel ${escaparHtml(imovel.titulo)}">
        </div>`).join('');

    // No card a descrição vira uma linha só (sem quebras nem HTML); o CSS mostra 2 linhas e corta em palavra inteira
    const descricaoResumida = escaparHtml(resumo(textoPuro(imovel.descricao)));

    // O preço mostrado segue a finalidade: aluguel mostra o valor mensal
    const ehLocacao = imovel.finalidadeImovel === 'LOCACAO';
    const valor = ehLocacao ? imovel.precoLocacao : imovel.precoVenda;
    const preco = valor != null
        ? `${ehLocacao ? 'Aluguel' : 'Venda'}<br> <span>${precoExibicao(valor)}${ehLocacao ? '<small>/mês</small>' : ''}</span>`
        : `${ehLocacao ? 'Aluguel' : 'Venda'}<br> <span>Consulte</span>`;

    // Reservado continua no site (no fim da busca), com selo sobre as fotos
    const seloReservado = imovel.status === 'RESERVADO'
        ? '<span class="selo-reservado">Reservado</span>'
        : '';

    // stretched-link (Bootstrap): uma camada invisível do link cobre o card inteiro, então clicar na foto
    // ou no título também abre o imóvel. As setas do carrossel ficam acima dela (CSS .card-imovel).
    const link = `<a ${variante === 'resultado' ? 'target="_blank" rel="noopener"' : ''} href="detalhes-imoveis.html?idImovel=${encodeURIComponent(imovel.idImovel)}" class="btn-2 stretched-link">Mais detalhes</a>`;

    const precoELink = variante !== 'home'
        ? `<div class="price-cta">
               <p class="price-imovel">${preco}</p>
               <div class="text-xs-center">${link}</div>
           </div>`
        : `<p class="price-imovel">${preco}</p>
           <div class="text-xs-center">${link}</div>`;

    const descricao = `
        <div class="desc-oferta desc-oferta-carousel">
            <div>
                <h2>${escaparHtml(imovel.titulo)}</h2>
                <h3>${escaparHtml(imovel.endereco?.bairro)}, ${escaparHtml(imovel.endereco?.cidade)}</h3>
            </div>
            <p class="descricao-curta">${descricaoResumida}</p>
            <ul class="icons-config">
                ${caracteristica('metragem', imovel.areaConstruida, 'área', 'área')}
                ${caracteristica('quarto', imovel.quartos, 'quarto', 'quartos')}
                ${caracteristica('banheiro', imovel.banheiros, 'banheiro', 'banheiros')}
                ${caracteristica('garagem', imovel.garagem, 'vaga', 'vagas')}
            </ul>
            ${precoELink}
        </div>`;

    const slide = document.createElement('div');
    slide.classList.add('slide', 'card-imovel');
    slide.innerHTML = `
        <div class="box-produto">
            <div id="${carouselId}" class="imagens-imovel carousel slide" data-bs-ride="carousel">
                ${seloReservado}
                <div class="carousel-inner">${imagensHTML}</div>
                ${imagens.length > 1 ? `
                <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Anterior</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Próxima</span>
                </button>` : ''}
            </div>
            ${descricao}
        </div>`;

    usarFotoPadraoSeFalhar(slide);
    return slide;
}

// Até ~180 caracteres, sem cortar palavra (o CSS limita a 2 linhas na tela)
function resumo(texto, limite = 180) {
    const limpo = texto.replace(/\s+/g, ' ').trim();
    if (limpo.length <= limite) return limpo;
    return limpo.slice(0, limpo.lastIndexOf(' ', limite)) + '…';
}

// Ícone + número + legenda ("3 quartos"): só o ícone não deixava claro o que era cada número
function caracteristica(classe, quantidade, singular, plural) {
    const legenda = quantidade === 1 ? singular : plural;
    const numero = quantidade ?? '-';
    return `<li class="icons ${classe}" title="${escaparHtml(`${numero} ${legenda}`)}">
                <span class="numero">${escaparHtml(numero)}</span>
                <span class="legenda">${legenda}</span>
            </li>`;
}

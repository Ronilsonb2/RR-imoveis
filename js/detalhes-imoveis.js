import { escaparHtml, formatarMoeda, precoExibicao, textoPuro, truncateText, urlImagem, usarFotoPadraoSeFalhar } from './utils.js';

const resultImovel = document.getElementById('show-imovel');
usarFotoPadraoSeFalhar(resultImovel);
const idImovel = new URLSearchParams(window.location.search).get('idImovel');

function mostrarMensagem(texto) {
    resultImovel.innerHTML = `<p class="msg-info" style="display:block; text-align:center; padding:40px 0;">${escaparHtml(texto)}</p>`;
}

function plural(quantidade, palavra) {
    return `${escaparHtml(quantidade)} ${palavra}${quantidade > 1 ? 's' : ''}`;
}

async function carregarImovel() {
    if (!idImovel) {
        mostrarMensagem('Imóvel não informado.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/imovel/${encodeURIComponent(idImovel)}`);
        if (response.status === 404) {
            mostrarMensagem('Este imóvel não existe ou não está mais disponível.');
            return;
        }
        if (!response.ok) {
            mostrarMensagem('Não foi possível carregar o imóvel. Tente novamente mais tarde.');
            return;
        }
        renderizar(await response.json());
    } catch (error) {
        console.error('Erro ao buscar imóvel:', error);
        mostrarMensagem('Não foi possível carregar o imóvel. Verifique sua conexão.');
    }
}

function renderizar(imovel) {
    // Título da aba com o nome do imóvel (não muda o preview de link no WhatsApp/redes, que não executa JS)
    document.title = `${imovel.titulo} — R&R Imóveis`;
    document.getElementById('detalhes-description')
        ?.setAttribute('content', truncateText(textoPuro(imovel.descricao).replace(/\s+/g, ' '), 150));

    const imagens = imovel.imagens?.length ? imovel.imagens : [null];
    const imagensHTML = imagens
        .map(imagem => `<img src="${escaparHtml(urlImagem(imagem))}" alt="Foto do imóvel ${escaparHtml(imovel.titulo)}">`)
        .join('');

    const ehVenda = imovel.finalidadeImovel !== 'LOCACAO'; // venda e permuta usam o preço de venda
    const endereco = imovel.endereco || {};

    // A descrição é texto puro com quebras de linha: escapada aqui e exibida com
    // "white-space: pre-line" no CSS, que mostra os parágrafos e listas como foram digitados.
    resultImovel.innerHTML = `
        <div class="slide">
            <div class="imagens-imovel">${imagensHTML}</div>

            <div class="container-detalhes-imovel">
                ${imovel.status === 'RESERVADO'
                    ? '<p class="aviso-reservado"><strong>Imóvel reservado.</strong> Já há uma proposta em andamento, mas o negócio ainda pode não se concretizar. Fale com a gente para ser avisado.</p>'
                    : ''}
                <div class="info-price">
                    <div class="price">
                        <p>${ehVenda ? 'Venda' : 'Aluguel'}</p>
                        <span>${precoExibicao(ehVenda ? imovel.precoVenda : imovel.precoLocacao)}
                            ${imovel.finalidadeImovel === 'LOCACAO' ? '<span class="dinamica">/mês</span>' : ''}</span>
                    </div>
                    <div class="info-condominio">
                        <p>Condomínio</p>
                        <span>R$ ${formatarMoeda(imovel.taxaCondominio)}</span>
                    </div>
                    <div class="info-iptu">
                        <p>IPTU</p>
                        <span>R$ ${formatarMoeda(imovel.valorIptu)}</span>
                    </div>
                </div>
                <div class="info-detalhes-imovel">
                    <div class="qtd-metros"><span>✅ ${escaparHtml(imovel.areaConstruida ?? '-')} m²</span></div>
                    <div class="qtd-quartos"><span>✅ ${plural(imovel.quartos, 'quarto')}</span></div>
                    <div class="info-banheiros"><span>✅ ${plural(imovel.banheiros, 'banheiro')}</span></div>
                    <div class="info-garagem"><span>✅ ${plural(imovel.garagem, 'vaga')}</span></div>
                </div>

                <div class="info-endereco">
                    <p>Endereço</p>
                    <span>${escaparHtml(endereco.rua)}, ${escaparHtml(endereco.bairro)} - ${escaparHtml(endereco.cidade)} ${escaparHtml(endereco.estado)}</span>
                </div>

                <div class="line">&nbsp;</div>

                <div class="descricao-imovel">
                    <h1 class="titulo-imovel">${escaparHtml(imovel.titulo)}</h1>
                    <p class="descricao">${escaparHtml(imovel.descricao)}</p>
                </div>

                <div class="info-contado">${escaparHtml(CONTACT_PHONE_DISPLAY)} · ${escaparHtml(CONTACT_EMAIL)}</div>
            </div>
        </div>`;

    // O Slick só pode ser iniciado depois que as imagens já estão no DOM
    const variasFotos = imovel.imagens?.length > 1;
    $('.imagens-imovel').slick({
        dots: variasFotos,
        arrows: variasFotos,
        infinite: variasFotos,
        speed: 500,
        cssEase: 'linear',
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [{ breakpoint: 1000, settings: { slidesToShow: 1, slidesToScroll: 1 } }],
    });
}

// Botão de WhatsApp com o link deste imóvel
const mensagem =
    `Olá! Tenho interesse neste imóvel.\n\n` +
    `Link do imóvel: ${window.location.href}\n\n` +
    `Poderia me passar mais informações, por favor?`;
document.getElementById('btn-whatsapp')
    ?.setAttribute('href', `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`);

carregarImovel();

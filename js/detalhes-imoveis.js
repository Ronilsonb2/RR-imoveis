import { buscarImoveisApi } from './api.js';
import { criarCardImovel } from './card-imovel.js';
import { escaparHtml, formatarMoeda, precoExibicao, textoPuro, truncateText, urlImagem, usarFotoPadraoSeFalhar } from './utils.js';

const resultImovel = document.getElementById('show-imovel');
usarFotoPadraoSeFalhar(resultImovel);
const idImovel = new URLSearchParams(window.location.search).get('idImovel');

function mostrarMensagem(texto) {
    resultImovel.innerHTML = `<p class="msg-info" style="display:block; text-align:center; padding:40px 0;">${escaparHtml(texto)}</p>`;
}

// Link do WhatsApp com mensagem pronta; o código (Ref.) deixa a imobiliária achar o imóvel no painel na hora
function linkWhatsapp(mensagem) {
    return `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
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
    document.title = `${imovel.titulo} — ${EMPRESA_NOME}`;
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
                    ${imovel.taxaCondominio != null ? `
                    <div class="info-condominio">
                        <p>Condomínio</p>
                        <span>R$ ${formatarMoeda(imovel.taxaCondominio)}</span>
                    </div>` : ''}
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

                <div class="acoes-imovel">
                    <a class="btn-agendar" target="_blank" rel="noopener" href="${escaparHtml(linkWhatsapp(
                        `Olá! Gostaria de agendar uma visita ao imóvel Ref. ${imovel.idImovel} - ${imovel.titulo}.\n\n${window.location.href}`))}">
                        Agendar visita
                    </a>
                    <span class="ref-imovel">Ref. ${escaparHtml(imovel.idImovel)}</span>
                </div>

                <!-- Só bairro e cidade: rua e número são passados no atendimento (protege o proprietário) -->
                <div class="info-endereco">
                    <p>Localização</p>
                    <span>${escaparHtml(endereco.bairro)} - ${escaparHtml(endereco.cidade)}/${escaparHtml(endereco.estado)}</span>
                </div>

                <div class="line">&nbsp;</div>

                <div class="descricao-imovel">
                    <h1 class="titulo-imovel">${escaparHtml(imovel.titulo)}</h1>
                    <p class="descricao">${escaparHtml(imovel.descricao)}</p>
                </div>

                ${mapaDaRegiao(endereco)}

                <!-- No lugar do formulário de contato: as duas ações que importam nesta página -->
                <div class="interesse-imovel">
                    <h2>Ficou interessado?</h2>
                    <p>Fale direto com a gente pelo WhatsApp. A mensagem já vai com o código do imóvel.</p>
                    <div class="interesse-botoes">
                        <a class="btn-agendar" target="_blank" rel="noopener" href="${escaparHtml(linkWhatsapp(
                            `Olá! Gostaria de agendar uma visita ao imóvel Ref. ${imovel.idImovel} - ${imovel.titulo}.\n\n${window.location.href}`))}">Agendar visita</a>
                        <a class="btn-duvida" target="_blank" rel="noopener" href="${escaparHtml(linkWhatsapp(
                            `Olá! Tenho uma dúvida sobre o imóvel Ref. ${imovel.idImovel} - ${imovel.titulo}.\n\n${window.location.href}`))}">Tirar dúvidas no WhatsApp</a>
                    </div>
                </div>

                <div class="info-contado">${escaparHtml(CONTACT_PHONE_DISPLAY)} · ${escaparHtml(CONTACT_EMAIL)}</div>
            </div>
        </div>`;

    // Botão flutuante passa a citar o imóvel (antes da carga ele leva só o link)
    document.getElementById('btn-whatsapp')?.setAttribute('href', linkWhatsapp(
        `Olá! Tenho interesse no imóvel Ref. ${imovel.idImovel} - ${imovel.titulo}.\n\n${window.location.href}\n\nPoderia me passar mais informações, por favor?`));

    carregarSemelhantes(imovel);

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

// Mapa pela região (bairro e cidade), nunca pelo endereço exato: protege o proprietário.
// O embed do Google Maps por busca dispensa chave de API.
function mapaDaRegiao(endereco) {
    if (!endereco.cidade) return '';
    const regiao = [endereco.bairro, `${endereco.cidade} - ${endereco.estado}`].filter(Boolean).join(', ');
    const url = `https://www.google.com/maps?q=${encodeURIComponent(regiao)}&output=embed`;
    return `
        <div class="mapa-imovel">
            <h2>Localização</h2>
            <p>${escaparHtml(regiao)} <small>(localização aproximada)</small></p>
            <iframe src="${escaparHtml(url)}" title="Mapa da região do imóvel" loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>`;
}

// Imóveis semelhantes: mesma finalidade, primeiro na mesma cidade; se faltar, completa com outras cidades.
// A API já põe os reservados no fim.
const QTD_SEMELHANTES = 3;

async function carregarSemelhantes(imovel) {
    const secao = document.getElementById('semelhantes');
    const container = document.getElementById('semelhantes-lista');
    if (!secao || !container) return;

    const base = `${API_BASE_URL}/imovel/filtros/avancados?finalidadeImovel=${imovel.finalidadeImovel}&size=${QTD_SEMELHANTES + 1}`;
    const outros = lista => lista.filter(i => i.idImovel !== imovel.idImovel);

    let semelhantes = outros((await buscarImoveisApi(`${base}&cidade=${encodeURIComponent(imovel.endereco?.cidade ?? '')}`)).content);
    if (semelhantes.length < QTD_SEMELHANTES) {
        const ids = new Set(semelhantes.map(i => i.idImovel));
        const complemento = outros((await buscarImoveisApi(`${base}&ordenacao=recentes`)).content).filter(i => !ids.has(i.idImovel));
        semelhantes = [...semelhantes, ...complemento];
    }
    semelhantes = semelhantes.slice(0, QTD_SEMELHANTES);

    if (!semelhantes.length) return; // seção continua escondida
    container.innerHTML = '';
    semelhantes.forEach(i => container.appendChild(criarCardImovel(i, 'oportunidade')));
    secao.hidden = false;
}

// Antes de carregar o imóvel, o botão flutuante já funciona com o link da página
document.getElementById('btn-whatsapp')?.setAttribute('href', linkWhatsapp(
    `Olá! Tenho interesse neste imóvel.\n\n${window.location.href}\n\nPoderia me passar mais informações, por favor?`));

carregarImovel();

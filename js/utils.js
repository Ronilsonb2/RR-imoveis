// Funções utilitárias compartilhadas pelas páginas.
// API_BASE_URL vem do js/config.js, carregado antes dos módulos.

// Encurtador de textos
export function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Escapa caracteres especiais antes de colocar texto vindo da API dentro de innerHTML.
// Sem isso, um "<script>" cadastrado no título rodaria no navegador do visitante (XSS).
export function escaparHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Remove as tags de um HTML e devolve só o texto (a descrição pode ter <b>, <i>...)
export function textoPuro(html) {
    return new DOMParser().parseFromString(html ?? '', 'text/html').body.textContent || '';
}

// Imagem exibida quando o imóvel não tem foto ou a foto não carrega
export const FOTO_PADRAO = 'img/sem-foto.svg';

// A API devolve fotos do upload como caminho relativo ("/imagens/abc.png"),
// que precisa do endereço da API na frente. URLs completas (http...) passam direto.
// Aceita tanto {id, url} quanto a string da URL.
export function urlImagem(imagem) {
    const url = typeof imagem === 'string' ? imagem : imagem?.url;
    if (!url) return FOTO_PADRAO;
    return url.startsWith('http') ? url : API_BASE_URL + url;
}

// Foto com link quebrado (arquivo apagado, URL externa fora do ar) vira a imagem padrão,
// em vez da caixa preta com o texto alternativo.
// O evento "error" de imagem não sobe pelo DOM, mas passa pela fase de captura (true): um único listener
// no container cobre todas as <img>, inclusive as criadas depois (ex.: clones do carrossel Slick).
export function usarFotoPadraoSeFalhar(container, fotoPadrao = FOTO_PADRAO) {
    container.addEventListener('error', (evento) => {
        const img = evento.target;
        if (img.tagName !== 'IMG' || img.dataset.fotoPadrao) return;
        img.dataset.fotoPadrao = 'sim'; // evita laço se a própria imagem padrão falhar
        img.src = fotoPadrao;
    }, true);
}

// Preço para exibir: 600000 -> "R$ 600.000"; centavos só quando existem (1800.5 -> "R$ 1.800,50")
export function precoExibicao(valor) {
    const numero = Number(valor);
    const centavos = Number.isInteger(numero) ? 0 : 2;
    return 'R$ ' + numero.toLocaleString('pt-BR', { minimumFractionDigits: centavos, maximumFractionDigits: centavos });
}

// 450000 -> "450.000,00"
export function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Máscara do campo de preço, sem centavos: digitar 400000 mostra "400.000"
export function formatarPreco(input) {
    const digitos = input.value.replace(/\D/g, '');
    return digitos ? Number(digitos).toLocaleString('pt-BR') : '';
}

// "400.000" -> "400000" (formato que a API espera)
export function precoParaApi(precoFormatado) {
    return precoFormatado.replace(/\D/g, '');
}

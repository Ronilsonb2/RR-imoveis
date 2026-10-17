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

// A API devolve fotos do upload como caminho relativo ("/imagens/abc.png"),
// que precisa do endereço da API na frente. URLs completas (http...) passam direto.
// Aceita tanto {id, url} quanto a string da URL.
export function urlImagem(imagem) {
    const url = typeof imagem === 'string' ? imagem : imagem?.url;
    if (!url) return 'img/sem-foto.jpeg';
    return url.startsWith('http') ? url : API_BASE_URL + url;
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

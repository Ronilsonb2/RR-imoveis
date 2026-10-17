

// Encurtador da descrição Strings
export function truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    } else {
      return text;
    }
}

// Fomatador de preco
export function formatarPreco(input) {
    let rawValue = input.value.replace(/\D/g, "");
    let preco = Number(rawValue) / 100;
    return preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

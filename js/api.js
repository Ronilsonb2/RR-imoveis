const PAGINA_VAZIA = { content: [], totalElements: 0, totalPages: 0, number: 0 };
const PAGINA_COM_ERRO = { ...PAGINA_VAZIA, erro: true }; // a API falhou (diferente de "busca sem resultado")

// Busca uma página de imóveis na API. Em caso de erro (rede ou status 4xx/5xx), devolve uma página vazia com erro: true.
// A API responde { content, page: { size, number, totalElements, totalPages } };
// aqui "achatamos" para { content, totalElements, totalPages, number }, formato usado pelas páginas.
export async function buscarImoveisApi(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Erro ${response.status} ao buscar imóveis`, await response.json().catch(() => null));
            return PAGINA_COM_ERRO;
        }
        const data = await response.json();
        return data.content ? { content: data.content, ...data.page } : PAGINA_VAZIA;
    } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        return PAGINA_COM_ERRO;
    }
}

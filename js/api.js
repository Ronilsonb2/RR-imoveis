const PAGINA_VAZIA = { content: [], totalElements: 0, totalPages: 0 };

// Busca uma página de imóveis na API. Em caso de erro (rede ou status 4xx/5xx), devolve uma página vazia.
export async function buscarImoveisApi(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Erro ${response.status} ao buscar imóveis`, await response.json().catch(() => null));
            return PAGINA_VAZIA;
        }
        const data = await response.json();
        return data.content ? data : PAGINA_VAZIA;
    } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        return PAGINA_VAZIA;
    }
}

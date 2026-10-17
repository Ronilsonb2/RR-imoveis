
// Função para buscar imóveis na API
export async function buscarImoveisApi(url) {
  try {
      const response = await fetch(url);
      const data = await response.json();

      return data.content && data.totalElements > 0 ? data : { content: [], totalElements: 0 };
  } catch (error) {
      console.error('Erro ao buscar imóveis:', error);
      return { content: [], totalElements: 0 };
  }
}



// Selects encadeados Estado -> Cidade -> Bairro, alimentados pela API.
// Cada carregamento devolve uma Promise, então dá para esperar um terminar
// antes de selecionar o valor do próximo (sem setTimeout "no chute").

async function buscarLista(caminho) {
    const response = await fetch(`${API_BASE_URL}${caminho}`);
    if (!response.ok) throw new Error(`Erro ${response.status} em ${caminho}`);
    return response.json();
}

function preencher(select, itens, textoPadrao) {
    select.innerHTML = '';
    select.appendChild(new Option(textoPadrao, ''));
    itens.forEach(item => select.appendChild(new Option(item, item))); // Option() escapa o texto sozinho
    select.disabled = false;
}

function resetar(select, texto) {
    select.innerHTML = '';
    select.appendChild(new Option(texto, ''));
    select.disabled = true;
}

function selecionar(select, valor) {
    if (valor && [...select.options].some(option => option.value === valor)) {
        select.value = valor;
        return true;
    }
    return false;
}

async function carregarCidades(cidadeSelect, bairroSelect, estado) {
    resetar(bairroSelect, 'Selecione uma cidade primeiro');
    if (!estado) return resetar(cidadeSelect, 'Selecione um estado primeiro');

    resetar(cidadeSelect, 'Carregando cidades...');
    const cidades = await buscarLista(`/cidades?estado=${encodeURIComponent(estado)}`);
    preencher(cidadeSelect, cidades, 'Selecione uma cidade');
}

async function carregarBairros(bairroSelect, cidade) {
    if (!cidade) return resetar(bairroSelect, 'Selecione uma cidade primeiro');

    resetar(bairroSelect, 'Carregando bairros...');
    const bairros = await buscarLista(`/bairros?cidade=${encodeURIComponent(cidade)}`);
    preencher(bairroSelect, bairros, 'Selecione um bairro');
}

// Liga os três selects e, se vierem valores iniciais (ex.: da URL), restaura em ordem.
export async function iniciarSelectsLocalizacao({ estado, cidade, bairro }, valoresIniciais = {}) {
    estado.addEventListener('change', () =>
        carregarCidades(cidade, bairro, estado.value).catch(console.error));
    cidade.addEventListener('change', () =>
        carregarBairros(bairro, cidade.value).catch(console.error));

    try {
        const estados = await buscarLista('/estados');
        preencher(estado, estados, 'Selecione um estado');
        resetar(cidade, 'Selecione um estado primeiro');
        resetar(bairro, 'Selecione uma cidade primeiro');

        if (selecionar(estado, valoresIniciais.estado)) {
            await carregarCidades(cidade, bairro, estado.value);
            if (selecionar(cidade, valoresIniciais.cidade)) {
                await carregarBairros(bairro, cidade.value);
                selecionar(bairro, valoresIniciais.bairro);
            }
        }
    } catch (erro) {
        console.error('Erro ao carregar localizações:', erro);
        resetar(estado, 'Não foi possível carregar');
    }
}

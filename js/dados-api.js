import { truncateText } from './utils.js';

const containerImoveisHome = document.getElementById('show-container-imoveis');
const oportunidadesImoveis = document.getElementById('ofertas-destaques-carousel'); // Contêiner do carrossel

document.addEventListener("DOMContentLoaded", function () {
    const url = `${API_BASE_URL}/imovel`;

    // Função para buscar os imóveis da API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const imoveis = data.content; // Array com os imóveis

            // A API ainda não tem um jeito de filtrar por destaque direto na consulta,
            // então separamos aqui: carrossel principal = destaques, Oportunidades = os demais
            // (evita repetir os mesmos imóveis nas duas seções).
            const destaques = imoveis.filter(imovel => imovel.imovelDestaque);
            const outrosImoveis = imoveis.filter(imovel => !imovel.imovelDestaque);

            mostrarImoveisHome(destaques.length > 0 ? destaques : imoveis, containerImoveisHome);
            mostrarImoveisOportunidades(outrosImoveis.length > 0 ? outrosImoveis : imoveis, oportunidadesImoveis);
        })
        .catch(error => console.error('Erro ao carregar imóveis:', error));
});

let carrosselIndex = 1; // Variável global para controlar os IDs dos carrosséis

function mostrarImoveisHome(todosImoveis, containerImoveis) {
        const imoveis = todosImoveis.slice(0, 4); // Array com os imóveis (Limitando a exibição a 4 imóveis)

        // Limpa o resultado anterior
        containerImoveis.innerHTML = '';

        // Exibe os imóveis no DOM (simples exemplo)
        imoveis.forEach(imovel => {
            const slideElement = document.createElement('div');
            slideElement.classList.add('slide');

            let imagensHTML = "";
            if (imovel.imagens.length > 0) {
                imagensHTML = imovel.imagens.map((img, index) => 
                    `<div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <img src="${img.url}" class="d-block w-100" alt="...">
                    </div>`
                ).join("");
            } else {
                imagensHTML = `<div class="carousel-item active">
                                  <img src="img/sem-foto.jpeg" class="d-block w-100" alt="Imagem padrão">
                               </div>`;
            }

            let descricaoCompleta = imovel.descricao;
            let descricaoResumida = truncateText(descricaoCompleta, 65);

            let precoVendaFormat = Number(imovel.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '');
            let precoLocacaoFormat = Number(imovel.precoLocacao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '');

            // Criando um ID único para cada carrossel
            const carouselId = `imagens-imovel-carrossell${carrosselIndex}`;

            // Gerar o HTML do slide
            slideElement.innerHTML = `
                <div class="box-produto">
                    <div id="${carouselId}" class="imagens-imovel carousel slide" data-bs-ride="carousel">
                        <div class="carousel-inner">
                            ${imagensHTML}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                    <div class="desc-oferta desc-oferta-carousel">
                        <div>
                            <h2>${imovel.titulo}</h2>
                            <h3>${imovel.endereco.bairro}, ${imovel.endereco.cidade}</h3>
                        </div>
                        

                        <p class="descricao-curta">${descricaoResumida}</p>
            
                        <div class="icons-config">
                            <div class="icons metragem">${imovel.areaConstruida}</div>
                            <div class="icons quarto">${imovel.quartos}</div>
                            <div class="icons banheiro">${imovel.banheiros}</div>
                            <div class="icons garagem">${imovel.garagem}</div>
                        </div>
                        
                         
                        <p class="price-imovel">${imovel.precoVenda !== null
                            ? `Venda<br> <span> ${precoVendaFormat}</span>`
                            : `Locação<br> <span> ${precoLocacaoFormat}</span>`
                        }
                        </p>

                        <div class="text-xs-center">
                            <a href="/detalhes-imoveis.html?idImovel=${imovel.idImovel}" class="btn-2">Mais detalhes</a>
                        </div>
                    </div>
                </div>

            `;
        
            carrosselIndex++;
            // Adicionar o slide ao contêiner do carrossel
            containerImoveis.appendChild(slideElement);
        });
}

function mostrarImoveisOportunidades(imoveis, oportunidadesImoveis){

    const imoveisFiltrados = imoveis.slice(0, 3); // Array com os imóveis (Limitando a exibição a 4 imóveis)

    // Iterar sobre os imóveis e gerar os slides dinâmicos
    imoveisFiltrados.forEach(imovel => {
        const slideElement = document.createElement('div');
        slideElement.classList.add('slide');

        let imagensHTML = "";
        if (imovel.imagens.length > 0) {
            imagensHTML = imovel.imagens.map((img, index) => 
                `<div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${img.url}" class="d-block w-100" alt="...">
                </div>`
            ).join("");
        } else {
            imagensHTML = `<div class="carousel-item active">
                              <img src="img/sem-foto.jpeg" class="d-block w-100" alt="Imagem padrão">
                           </div>`;
        }

        const descricaoResumida = truncateText(imovel.descricao, 65);
        let precoVendaFormat = Number(imovel.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '');
        let precoLocacaoFormat = Number(imovel.precoLocacao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '');

        // Criando um ID único para cada carrossel
        const carouselId = `imagens-imovel-carrossell-oportunidades${carrosselIndex}`;

        // Gerar o HTML do slide
        slideElement.innerHTML = `
            <div class="box-produto">
                <div id="${carouselId}" class="imagens-imovel carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${imagensHTML}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
                <div class="desc-oferta desc-oferta-carousel">
                    <div>
                        <h2>${imovel.titulo}</h2>
                        <h3>${imovel.endereco.bairro}, ${imovel.endereco.cidade}</h3>
                    </div>
                    

                    <p class="descricao-curta">${descricaoResumida}</p>
        
                    <div class="icons-config">
                        <div class="icons metragem">${imovel.areaConstruida}</div>
                        <div class="icons quarto">${imovel.quartos}</div>
                        <div class="icons banheiro">${imovel.banheiros}</div>
                        <div class="icons garagem">${imovel.garagem}</div>
                    </div>

                    <div class="price-cta">
                        <p class="price-imovel">${imovel.precoVenda !== null
                            ? `Venda<br> <span> ${precoVendaFormat}</span>`
                            : `Locação<br> <span> ${precoLocacaoFormat}</span>`
                        }
                        </p>

                        <div class="text-xs-center">
                            <a href="/detalhes-imoveis.html?idImovel=${imovel.idImovel}" class="btn-2">Mais detalhes</a>
                        </div>
                    </div>
                </div>
            </div>

        `;
        
        carrosselIndex++;
        // Adicionar o slide ao contêiner do carrossel
        oportunidadesImoveis.appendChild(slideElement);
    });
}

// Pesquisa pelas opcoes HOME PRINCIPAL
const selectImovel = document.getElementById('tipo-imovel');
const selectEstadoImovel = document.getElementById('estado-imovel');
const selectCidadeImovel = document.getElementById('cidade-imovel');
const selectBairroImovel = document.getElementById('bairro-imovel');
const btnBuscar = document.getElementById('buscar');
const btnComprar = document.getElementById('btn-comprar');
const btnAlugar = document.getElementById('btn-alugar');
const showResultadoImoveis = document.getElementById('show-container-imoveis');

let finalidadeImovel = 'VENDA'; // Por default começamos com VENDA
let tipoImovel = '';
let estadoImovel = '';
let cidadeImovel = '';
let bairroImovel = '';

// Manter como default Finalidade como VENDA
document.addEventListener("DOMContentLoaded", function () {
    if (finalidadeImovel === "VENDA") {
        btnComprar.classList.add("active");
        btnAlugar.classList.remove("active");
    }
});

selectImovel.addEventListener('change', function(){
    tipoImovel = selectImovel.value;
});

selectEstadoImovel.addEventListener('change', function(){
    estadoImovel = selectEstadoImovel.value;
});

selectCidadeImovel.addEventListener('change', function(){
    cidadeImovel = selectCidadeImovel.value;
});

selectBairroImovel.addEventListener('change', function(){
    bairroImovel = selectBairroImovel.value;
});

btnComprar.addEventListener('click', function(){
    finalidadeImovel = "VENDA";
    btnComprar.classList.add("active");
    btnAlugar.classList.remove("active");
});

btnAlugar.addEventListener('click', function(){
    finalidadeImovel = "LOCACAO";
    btnAlugar.classList.add("active");
    btnComprar.classList.remove("active");
});

btnBuscar.addEventListener('click', function(){
    // Atualiza as variáveis antes de buscar
    tipoImovel = selectImovel.value;
    realizarBusca();
});


let paginaAtual = 0;
const itensPorPagina = 10;

function realizarBusca(pagina = 0) {
    paginaAtual = pagina;
    let params = new URLSearchParams();

    // Define os parâmetros da URL apenas se tiverem valor
    params.append("page", pagina);
    params.append("size", itensPorPagina);
    params.append("finalidadeImovel", finalidadeImovel || "VENDA"); // sempre mantém a finalidade correta

    if (tipoImovel && tipoImovel !== "Selecione") params.append("tipoDeImovel", tipoImovel);
    if (estadoImovel) params.append("estado", estadoImovel);
    if (cidadeImovel) params.append("cidade", cidadeImovel);
    if (bairroImovel) params.append("bairro", bairroImovel);

    let url = `/produtos.html?${params.toString()}`;

    console.log("URL gerada:", url);
    window.location.href = url;
}













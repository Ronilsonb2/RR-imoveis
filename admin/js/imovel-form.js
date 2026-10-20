import { api, avisar, exigirLogin, iniciarMenu, ROTULOS } from './api-admin.js';

const COR_STATUS = { ATIVO: 'bg-success', RESERVADO: 'bg-warning text-dark' };
import { iniciarFotos } from './fotos.js';

exigirLogin();
iniciarMenu();

const params = new URLSearchParams(window.location.search);
const idImovel = params.get('id');

const form = document.getElementById('form-imovel');
const tipo = document.getElementById('tipoDeImovel');
const descricao = document.getElementById('descricao');
const selectProprietario = document.getElementById('proprietario-existente');
const blocoNovoProprietario = document.getElementById('novo-proprietario');
const erroGeral = document.getElementById('erro-geral');
const botaoSalvar = document.getElementById('btn-salvar');

// Proprietários carregados no select, por id: o escolhido vai inteiro no JSON do imóvel
const proprietarios = new Map();

// ---------- Campos que dependem do tipo ----------

// Campos escondidos ficam desabilitados: o navegador não valida nem envia campo desabilitado
function mostrarCamposDoTipo() {
    const ehCasa = tipo.value === 'CASA';
    document.querySelectorAll('.so-casa').forEach(bloco => alternar(bloco, ehCasa));
    document.querySelectorAll('.so-apartamento').forEach(bloco => alternar(bloco, !ehCasa));
}

function alternar(bloco, visivel) {
    bloco.classList.toggle('d-none', !visivel);
    bloco.querySelectorAll('input, select').forEach(campo => { campo.disabled = !visivel; });
}

tipo.addEventListener('change', mostrarCamposDoTipo);

// ---------- Contador da descrição ----------

function atualizarContador() {
    document.getElementById('contador-descricao').textContent = descricao.value.length;
}
descricao.addEventListener('input', atualizarContador);

// ---------- CEP (ViaCEP) ----------

const campoCep = document.getElementById('cep');
const infoCep = document.getElementById('info-cep');

campoCep.addEventListener('blur', async () => {
    const digitos = campoCep.value.replace(/\D/g, '');
    if (digitos.length !== 8) return;
    campoCep.value = `${digitos.slice(0, 5)}-${digitos.slice(5)}`;

    infoCep.textContent = 'Buscando endereço…';
    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
        const dados = await resposta.json();
        if (dados.erro) {
            infoCep.textContent = 'CEP não encontrado. Preencha o endereço à mão.';
            return;
        }
        form.elements['endereco.rua'].value = dados.logradouro || '';
        form.elements['endereco.bairro'].value = dados.bairro || '';
        form.elements['endereco.cidade'].value = dados.localidade || '';
        form.elements['endereco.estado'].value = dados.uf || '';
        infoCep.textContent = '';
        form.elements['endereco.numero'].focus();
    } catch {
        infoCep.textContent = 'Não foi possível consultar o CEP. Preencha o endereço à mão.';
    }
});

// ---------- Proprietário ----------

async function carregarProprietarios() {
    // O select comporta a carteira de uma imobiliária pequena; para milhares, trocar por busca
    const pagina = await api('/proprietario?size=200&page=0');
    pagina.content.forEach(adicionarOpcaoProprietario);
}

function adicionarOpcaoProprietario(proprietario) {
    if (proprietarios.has(String(proprietario.id))) return;
    proprietarios.set(String(proprietario.id), proprietario);
    selectProprietario.appendChild(new Option(`${proprietario.nome} — CPF ${proprietario.cpf}`, proprietario.id));
}

function mostrarNovoProprietario() {
    alternar(blocoNovoProprietario, selectProprietario.value === '');
}
selectProprietario.addEventListener('change', mostrarNovoProprietario);

// ---------- Preencher (edição) e montar o JSON ----------

function preencher(imovel) {
    Object.entries(imovel).forEach(([campo, valor]) => {
        const input = form.elements[campo];
        if (!input || valor === null || typeof valor === 'object') return;
        if (input.type === 'checkbox') input.checked = Boolean(valor);
        else input.value = valor;
    });
    Object.entries(imovel.endereco || {}).forEach(([campo, valor]) => {
        const input = form.elements[`endereco.${campo}`];
        if (input) input.value = valor ?? '';
    });
    // Seed antigo grava "não"/"sim" minúsculo; o select só conhece "Não"/"Sim"
    ['jardim', 'piscina'].forEach(campo => {
        if (imovel[campo]) form.elements[campo].value = /^s/i.test(imovel[campo]) ? 'Sim' : 'Não';
    });
}

// Campo vazio vira null; números saem como número (a API espera Integer/BigDecimal)
function valor(nome) {
    const input = form.elements[nome];
    if (!input || input.disabled) return null;
    if (input.type === 'checkbox') return input.checked;
    const texto = input.value.trim();
    if (texto === '') return null;
    return input.type === 'number' ? Number(texto) : texto;
}

function montarJson() {
    const ehCasa = tipo.value === 'CASA';
    const json = {
        type: ehCasa ? 'casa' : 'apartamento', // a API escolhe CasaDTO ou ApartamentoDTO por este campo
        tipoDeImovel: tipo.value,
        imovelDestaque: valor('imovelDestaque'),
        titulo: valor('titulo'),
        descricao: valor('descricao'),
        finalidadeImovel: valor('finalidadeImovel'),
        valorIptu: valor('valorIptu'),
        precoVenda: valor('precoVenda'),
        precoLocacao: valor('precoLocacao'),
        areaTotal: valor('areaTotal'),
        areaConstruida: valor('areaConstruida'),
        quartos: valor('quartos'),
        banheiros: valor('banheiros'),
        garagem: valor('garagem'),
        zoneamento: valor('zoneamento'),
        endereco: {
            cep: valor('endereco.cep'),
            rua: valor('endereco.rua'),
            numero: valor('endereco.numero'),
            bairro: valor('endereco.bairro'),
            cidade: valor('endereco.cidade'),
            estado: valor('endereco.estado')?.toUpperCase(),
            pais: valor('endereco.pais'),
        },
        proprietario: selectProprietario.value
            ? proprietarios.get(selectProprietario.value)
            : {
                nome: valor('proprietario.nome'),
                cpf: valor('proprietario.cpf'),
                telefone: valor('proprietario.telefone'),
                email: valor('proprietario.email'),
            },
    };

    if (ehCasa) {
        Object.assign(json, { jardim: valor('jardim'), piscina: valor('piscina'), andares: valor('andares') });
    } else {
        Object.assign(json, { numeroApto: valor('numeroApto'), andar: valor('andar'), taxaCondominio: valor('taxaCondominio') });
    }
    return json;
}

// ---------- Erros de validação ----------

function limparErros() {
    erroGeral.classList.add('d-none');
    form.querySelectorAll('.is-invalid').forEach(campo => campo.classList.remove('is-invalid'));
}

// A API devolve campos como { "endereco.cep": "mensagem" }: os names do formulário seguem o mesmo caminho
function mostrarErros(erro) {
    const semCampo = [];
    Object.entries(erro.campos || {}).forEach(([campo, mensagem]) => {
        const input = form.elements[campo];
        if (input && !input.disabled) {
            input.classList.add('is-invalid');
            const feedback = input.parentElement.querySelector('.invalid-feedback');
            if (feedback) feedback.textContent = mensagem;
        } else {
            semCampo.push(`${campo}: ${mensagem}`);
        }
    });

    erroGeral.textContent = [erro.message, ...semCampo].join(' · ');
    erroGeral.classList.remove('d-none');
    (form.querySelector('.is-invalid') || erroGeral).scrollIntoView({ behavior: 'smooth', block: 'center' });
}

form.addEventListener('input', (evento) => evento.target.classList.remove('is-invalid'));

// ---------- Salvar ----------

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limparErros();

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        form.querySelector(':invalid')?.focus();
        return;
    }
    form.classList.remove('was-validated');

    botaoSalvar.disabled = true;
    try {
        const json = montarJson();
        if (idImovel) {
            await api(`/imovel/${idImovel}`, { metodo: 'PUT', corpo: json });
            avisar('Alterações salvas.');
        } else {
            const criado = await api(`/imovel/${json.type}`, { metodo: 'POST', corpo: json });
            // Recarrega em modo edição: a seção de fotos precisa do ID do imóvel
            window.location.href = `imovel.html?id=${criado.idImovel}&novo=1`;
            return;
        }
    } catch (e) {
        mostrarErros(e);
    }
    botaoSalvar.disabled = false;
});

// ---------- Início ----------

async function iniciar() {
    try {
        await carregarProprietarios();

        if (idImovel) {
            const [imovel, dono] = await Promise.all([
                api(`/admin/imoveis/${idImovel}`),
                api(`/admin/imoveis/${idImovel}/proprietario`),
            ]);

            document.getElementById('titulo-pagina').textContent = `Editar imóvel #${idImovel}`;
            document.getElementById('status-atual').innerHTML =
                `<span class="badge ${COR_STATUS[imovel.status] || 'bg-secondary'}">${ROTULOS.status[imovel.status]}</span>`;

            preencher(imovel);
            // A API não converte casa em apartamento: o tipo fica travado na edição
            tipo.disabled = true;
            document.getElementById('aviso-tipo').textContent = 'O tipo não muda depois do cadastro.';

            adicionarOpcaoProprietario(dono);
            selectProprietario.value = dono.id;

            iniciarFotos(idImovel, imovel.imagens || []);
            document.getElementById('dica-fotos').classList.add('d-none');

            if (params.get('novo')) avisar('Imóvel cadastrado! Agora envie as fotos.');
        }
    } catch (e) {
        erroGeral.textContent = e.message;
        erroGeral.classList.remove('d-none');
    }

    mostrarCamposDoTipo();
    mostrarNovoProprietario();
    atualizarContador();
}

iniciar();

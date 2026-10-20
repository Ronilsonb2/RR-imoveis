// Fotos do imóvel: envio, exclusão e ordem (a primeira é a capa).
// Reordenar: arrastar com o mouse ou usar as setas (o arraste do HTML5 não funciona no celular).
import { api, avisar } from './api-admin.js';
import { urlImagem } from '../../js/utils.js';

const LIMITE_ARQUIVO = 5 * 1024 * 1024;   // spring.servlet.multipart.max-file-size
const LIMITE_ENVIO = 25 * 1024 * 1024;    // spring.servlet.multipart.max-request-size

let idImovel;
let fotos = []; // [{ id, url }] na ordem atual
let arrastada = null;

const secao = document.getElementById('secao-fotos');
const grade = document.getElementById('grade-fotos');
const inputFotos = document.getElementById('input-fotos');

export function iniciarFotos(id, imagens) {
    idImovel = id;
    fotos = imagens;
    secao.classList.remove('d-none');
    desenhar();
}

function desenhar() {
    if (!fotos.length) {
        grade.innerHTML = '<p class="text-muted small mb-0">Nenhuma foto ainda. Imóvel sem foto aparece no site com a imagem padrão.</p>';
        return;
    }

    grade.innerHTML = '';
    fotos.forEach((foto, indice) => {
        const card = document.createElement('div');
        card.className = 'foto';
        card.draggable = true;
        card.dataset.id = foto.id;
        card.innerHTML = `
            ${indice === 0 ? '<span class="badge bg-success selo-capa">Capa</span>' : ''}
            <img alt="Foto ${indice + 1}">
            <div class="acoes">
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-light" data-mover="-1" ${indice === 0 ? 'disabled' : ''} aria-label="Mover para a esquerda">◀</button>
                    <button type="button" class="btn btn-light" data-mover="1" ${indice === fotos.length - 1 ? 'disabled' : ''} aria-label="Mover para a direita">▶</button>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" data-excluir aria-label="Excluir foto">Excluir</button>
            </div>`;
        card.querySelector('img').src = urlImagem(foto);
        grade.appendChild(card);
    });
}

// Envia a nova ordem; a API responde com as fotos já ordenadas
async function salvarOrdem(novaOrdem) {
    const anterior = fotos;
    fotos = novaOrdem;
    desenhar(); // mostra na hora; se a API recusar, volta como estava
    try {
        fotos = await api(`/imovel/${idImovel}/imagens/ordem`, { metodo: 'PUT', corpo: novaOrdem.map(f => f.id) });
        desenhar();
    } catch (e) {
        fotos = anterior;
        desenhar();
        avisar(e.message, 'danger');
    }
}

// ---------- Botões (mover e excluir) ----------

grade.addEventListener('click', async (evento) => {
    const botao = evento.target.closest('button');
    if (!botao) return;
    const id = Number(botao.closest('.foto').dataset.id);
    const indice = fotos.findIndex(f => f.id === id);

    if (botao.dataset.mover) {
        const destino = indice + Number(botao.dataset.mover);
        const novaOrdem = [...fotos];
        [novaOrdem[indice], novaOrdem[destino]] = [novaOrdem[destino], novaOrdem[indice]];
        salvarOrdem(novaOrdem);
    }

    if (botao.hasAttribute('data-excluir')) {
        if (!confirm('Excluir esta foto?')) return;
        try {
            await api(`/imovel/${idImovel}/imagens/${id}`, { metodo: 'DELETE' });
            fotos = fotos.filter(f => f.id !== id);
            desenhar();
            avisar('Foto excluída.');
        } catch (e) {
            avisar(e.message, 'danger');
        }
    }
});

// ---------- Arrastar e soltar ----------

grade.addEventListener('dragstart', (evento) => {
    arrastada = evento.target.closest('.foto');
    arrastada?.classList.add('arrastando');
    evento.dataTransfer.effectAllowed = 'move';
});

grade.addEventListener('dragover', (evento) => {
    const alvo = evento.target.closest('.foto');
    if (!arrastada || !alvo) return;
    evento.preventDefault(); // sem isso o navegador não permite soltar aqui
    grade.querySelectorAll('.alvo').forEach(card => card.classList.remove('alvo'));
    if (alvo !== arrastada) alvo.classList.add('alvo');
});

grade.addEventListener('drop', (evento) => {
    evento.preventDefault();
    const alvo = evento.target.closest('.foto');
    if (!arrastada || !alvo || alvo === arrastada) return;

    const de = fotos.findIndex(f => f.id === Number(arrastada.dataset.id));
    const para = fotos.findIndex(f => f.id === Number(alvo.dataset.id));
    const novaOrdem = [...fotos];
    const [movida] = novaOrdem.splice(de, 1);
    novaOrdem.splice(para, 0, movida); // ocupa o lugar do card onde foi solta
    salvarOrdem(novaOrdem);
});

grade.addEventListener('dragend', () => {
    arrastada = null;
    grade.querySelectorAll('.arrastando, .alvo').forEach(card => card.classList.remove('arrastando', 'alvo'));
});

// ---------- Envio ----------

inputFotos.addEventListener('change', async () => {
    const arquivos = [...inputFotos.files];
    inputFotos.value = ''; // permite escolher o mesmo arquivo de novo depois
    if (!arquivos.length) return;

    // Confere os limites antes de enviar: evita esperar um upload grande só para receber 413
    const grande = arquivos.find(arquivo => arquivo.size > LIMITE_ARQUIVO);
    if (grande) {
        avisar(`"${grande.name}" passa de 5 MB. Reduza a foto e tente de novo.`, 'danger');
        return;
    }
    if (arquivos.reduce((soma, arquivo) => soma + arquivo.size, 0) > LIMITE_ENVIO) {
        avisar('Envio acima de 25 MB. Mande as fotos em partes.', 'danger');
        return;
    }

    const dados = new FormData();
    arquivos.forEach(arquivo => dados.append('files', arquivo)); // "files" = @RequestPart da API

    avisar(`Enviando ${arquivos.length} foto(s)…`, 'info');
    try {
        const criadas = await api(`/imovel/${idImovel}/imagens`, { metodo: 'POST', corpo: dados });
        fotos = [...fotos, ...criadas];
        desenhar();
        avisar(`${criadas.length} foto(s) adicionada(s).`);
    } catch (e) {
        avisar(e.message, 'danger');
    }
});

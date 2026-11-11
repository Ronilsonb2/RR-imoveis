// Prepara as fotos no navegador antes do envio: reduz o peso mantendo a maior qualidade possível.
// A API guarda a foto em no máximo 1600 px (ImagemProcessador.LADO_MAXIMO), então mandar o original de 12 MB só
// gasta internet e estoura o limite de 5 MB por arquivo. Reduzindo aqui para o mesmo tamanho, nada que apareça no
// site se perde.

export const LADO_MAXIMO = 1600;           // igual ao ImagemProcessador da API
export const LIMITE_ARQUIVO = 5 * 1024 * 1024;  // spring.servlet.multipart.max-file-size
export const LIMITE_LOTE = 20 * 1024 * 1024;    // abaixo de spring.servlet.multipart.max-request-size (25 MB)

// Foto que já cabe (JPG até 1 MB e até 1600 px) segue como está: regravar só pioraria a qualidade
const TAMANHO_QUE_DISPENSA = 1024 * 1024;
// Maior qualidade primeiro; só desce se o arquivo ainda passar do alvo (raro em 1600 px)
const QUALIDADES = [0.92, 0.88, 0.84, 0.8, 0.75, 0.7, 0.6];
const ALVO = 3 * 1024 * 1024; // folga em relação ao limite de 5 MB

// Devolve um File pronto para enviar (JPG). Lança erro se não conseguir ler a imagem ou se não couber no limite.
export async function prepararFoto(arquivo) {
    if (arquivo.type === 'image/gif') return conferirLimite(arquivo); // o canvas perderia a animação

    let imagem;
    try {
        imagem = await createImageBitmap(arquivo); // já aplica a orientação (EXIF) do celular
    } catch {
        throw new Error(`Não foi possível ler "${arquivo.name}". Envie em JPG ou PNG.`);
    }

    try {
        const maior = Math.max(imagem.width, imagem.height);
        if (arquivo.type === 'image/jpeg' && arquivo.size <= TAMANHO_QUE_DISPENSA && maior <= LADO_MAXIMO) {
            return arquivo;
        }

        const escala = Math.min(1, LADO_MAXIMO / maior); // nunca amplia
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(imagem.width * escala));
        canvas.height = Math.max(1, Math.round(imagem.height * escala));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; // JPG não tem transparência
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);

        let blob = null;
        for (const qualidade of QUALIDADES) {
            blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', qualidade));
            if (!blob) break;
            if (blob.size <= ALVO) break;
        }
        if (!blob) throw new Error(`Não foi possível converter "${arquivo.name}". Envie em JPG ou PNG.`);

        const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.jpg';
        return conferirLimite(new File([blob], nome, { type: 'image/jpeg' }));
    } finally {
        imagem.close();
    }
}

function conferirLimite(arquivo) {
    if (arquivo.size > LIMITE_ARQUIVO) {
        throw new Error(`"${arquivo.name}" passa de 5 MB mesmo reduzida. Reduza a foto e tente de novo.`);
    }
    return arquivo;
}

// Divide as fotos em lotes que cabem no limite de uma requisição, mantendo a ordem escolhida
export function dividirEmLotes(arquivos) {
    const lotes = [];
    let atual = [];
    let tamanho = 0;
    for (const arquivo of arquivos) {
        if (atual.length && tamanho + arquivo.size > LIMITE_LOTE) {
            lotes.push(atual);
            atual = [];
            tamanho = 0;
        }
        atual.push(arquivo);
        tamanho += arquivo.size;
    }
    if (atual.length) lotes.push(atual);
    return lotes;
}

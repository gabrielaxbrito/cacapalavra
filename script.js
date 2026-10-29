
const grade = document.getElementById("grade");
const listaPalavras = document.getElementById("lista-palavras");
const mensagem = document.getElementById("mensagem");

const bancoPalavras = [
    "PAUSA", "CALMA", "FOCO", "RESPIRO", "CUIDADO",
    "TEMPO", "EQUILIBRIO", "DESCANSO", "PRESENCA", "ALEGRIA",
    "HARMONIA", "LEVEZA", "GRATIDAO", "ENERGIA", "SAUDE",
    "SONO", "LAZER", "SILENCIO", "NATUREZA", "AMIZADE",
    "AFETO", "CARINHO", "EMPATIA", "ESCUTA", "PACIENCIA",
    "RESILIENCIA", "CORAGEM", "CONFIANCA", "ESPERANCA", "SERENIDADE",
    "RELAXAR", "MEDITAR", "RESPIRAR", "MOVIMENTO", "CAMINHADA",
    "ALONGAR", "HIDRATAR", "ALIMENTACAO", "BEMESTAR", "SORRISO",
    "LIBERDADE", "CRIATIVIDADE", "APRENDIZADO", "REFLEXAO", "CONEXAO",
    "PROPOSITO", "OTIMISMO", "RENOVACAO", "SUPERACAO", "AUTOCUIDADO",
    "FOLEGO", "VITALIDADE", "ACOLHIMENTO", "GENEROSIDADE", "BONDADE",
    "AMOR", "FELICIDADE", "PENSAMENTO", "MOTIVACAO", "INSPIRACAO"
];

let palavras = [];

const tamanho = 12;

let matriz = [];
let palavrasEncontradas = new Set();

let inicioSelecao = null;
let celulasSelecionadas = [];
let selecionando = false;

// Direções em que as palavras podem ser posicionadas.
const direcoes = [
    [0, 1],   // Horizontal: esquerda → direita
    [1, 0],   // Vertical: cima → baixo
    [1, 1]    // Diagonal: esquerda → direita, descendo
];

// Cria uma matriz vazia.
function criarMatriz() {
    matriz = Array.from(
        { length: tamanho },
        () => Array(tamanho).fill("")
    );
}

// Verifica se uma palavra cabe em determinada posição.
function podePosicionar(palavra, linha, coluna, dl, dc) {
    for (let i = 0; i < palavra.length; i++) {
        const l = linha + i * dl;
        const c = coluna + i * dc;

        if (l < 0 || l >= tamanho || c < 0 || c >= tamanho) {
            return false;
        }

        const letraExistente = matriz[l][c];

        if (letraExistente !== "" && letraExistente !== palavra[i]) {
            return false;
        }
    }

    return true;
}

// Posiciona uma palavra na matriz.
function posicionarPalavra(palavra) {
    for (let tentativa = 0; tentativa < 1000; tentativa++) {
        const linha = Math.floor(Math.random() * tamanho);
        const coluna = Math.floor(Math.random() * tamanho);

        const [dl, dc] =
            direcoes[Math.floor(Math.random() * direcoes.length)];

        if (podePosicionar(palavra, linha, coluna, dl, dc)) {
            for (let i = 0; i < palavra.length; i++) {
                const l = linha + i * dl;
                const c = coluna + i * dc;

                matriz[l][c] = palavra[i];
            }

            return true;
        }
    }

    return false;
}

// Preenche os espaços vazios com letras aleatórias.
function preencherEspacos() {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let linha = 0; linha < tamanho; linha++) {
        for (let coluna = 0; coluna < tamanho; coluna++) {
            if (matriz[linha][coluna] === "") {
                const indice = Math.floor(Math.random() * letras.length);

                matriz[linha][coluna] = letras[indice];
            }
        }
    }
}

// Desenha a matriz no HTML.
function desenharGrade() {
    grade.innerHTML = "";

    grade.style.gridTemplateColumns = `repeat(${tamanho}, minmax(0, 1fr))`;

    for (let linha = 0; linha < tamanho; linha++) {
        for (let coluna = 0; coluna < tamanho; coluna++) {
            const celula = document.createElement("div");

            celula.classList.add("celula");
            celula.textContent = matriz[linha][coluna];

            celula.dataset.linha = linha;
            celula.dataset.coluna = coluna;

            grade.appendChild(celula);
        }
    }
}

// Obtém uma célula a partir de um elemento HTML.
function obterCelula(elemento) {
    if (!(elemento instanceof Element)) {
        return null;
    }

    const celula = elemento.closest(".celula");

    if (!celula || !grade.contains(celula)) {
        return null;
    }

    return celula;
}

// Calcula as células em linha reta entre dois pontos.
function calcularSelecao(inicio, fim) {
    const dl = fim.linha - inicio.linha;
    const dc = fim.coluna - inicio.coluna;

    // Só permite linhas horizontais, verticais ou diagonais.
    if (dl !== 0 && dc !== 0 && Math.abs(dl) !== Math.abs(dc)) {
        return [];
    }

    const passos = Math.max(Math.abs(dl), Math.abs(dc));

    const passoLinha = Math.sign(dl);
    const passoColuna = Math.sign(dc);

    const resultado = [];

    for (let i = 0; i <= passos; i++) {
        const linha = inicio.linha + i * passoLinha;
        const coluna = inicio.coluna + i * passoColuna;

        const celula = grade.querySelector(
            `[data-linha="${linha}"][data-coluna="${coluna}"]`
        );

        if (celula) {
            resultado.push(celula);
        }
    }

    return resultado;
}

// Atualiza o destaque visual da seleção.
function atualizarSelecao(celulas) {
    grade.querySelectorAll(".celula.selecionada").forEach(celula => {
        celula.classList.remove("selecionada");
    });

    celulasSelecionadas = celulas;

    celulas.forEach(celula => {
        if (!celula.classList.contains("encontrada")) {
            celula.classList.add("selecionada");
        }
    });
}

// Lê as letras selecionadas.
function lerPalavra(celulas) {
    return celulas.map(celula => celula.textContent).join("");
}

// Verifica se a sequência corresponde a uma palavra.
function verificarPalavra() {
    const palavra = lerPalavra(celulasSelecionadas);
    const palavraInvertida = palavra.split("").reverse().join("");

    const encontrada = palavras.find(item =>
        item === palavra || item === palavraInvertida
    );

    if (encontrada && !palavrasEncontradas.has(encontrada)) {
        palavrasEncontradas.add(encontrada);

        celulasSelecionadas.forEach(celula => {
            celula.classList.remove("selecionada");
            celula.classList.add("encontrada");
        });

        atualizarLista();

        mensagem.textContent = `Boa! Você encontrou ${encontrada}.`;

        if (palavrasEncontradas.size === palavras.length) {
            mensagem.textContent =
                "Parabéns! Você encontrou todas as palavras! 🌿";
        }
    } else if (encontrada) {
        mensagem.textContent = `Você já encontrou ${encontrada}.`;
    } else {
        mensagem.textContent = "Continue tentando! Procure outra palavra.";
    }
}

// Atualiza a lista de palavras. Cria 6 elementos li a partir das palavras sorteadas

function atualizarLista() {
    listaPalavras.innerHTML = "";

    palavras.forEach(palavra => {
        const item = document.createElement("li");

        item.textContent = palavra;

        if (palavrasEncontradas.has(palavra)) {
            item.classList.add("encontrada");
        }

        listaPalavras.appendChild(item);
    });
}


// Inicia a seleção com mouse ou toque.
grade.addEventListener("pointerdown", evento => {
    const celula = obterCelula(evento.target);

    if (!celula || evento.button === 2) {
        return;
    }

    evento.preventDefault();

    selecionando = true;

    inicioSelecao = {
        linha: Number(celula.dataset.linha),
        coluna: Number(celula.dataset.coluna)
    };

    atualizarSelecao([celula]);
});

// Acompanha o movimento do ponteiro.
document.addEventListener("pointermove", evento => {
    if (!selecionando || !inicioSelecao) {
        return;
    }

    const elemento = document.elementFromPoint(
        evento.clientX,
        evento.clientY
    );

    const celula = obterCelula(elemento);

    if (!celula) {
        return;
    }

    const fim = {
        linha: Number(celula.dataset.linha),
        coluna: Number(celula.dataset.coluna)
    };

    atualizarSelecao(calcularSelecao(inicioSelecao, fim));
});

// Finaliza a seleção.
document.addEventListener("pointerup", () => {
    if (!selecionando) {
        return;
    }

    selecionando = false;

    if (celulasSelecionadas.length > 0) {
        verificarPalavra();
    }

    inicioSelecao = null;

    celulasSelecionadas.forEach(celula => {
        celula.classList.remove("selecionada");
    });

    celulasSelecionadas = [];
});


function sortearPalavras() {
    const copia = [...bancoPalavras];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia.slice(0, 6);
}

// Gera o jogo.

function iniciarJogo() {
    palavras = sortearPalavras();
    palavrasEncontradas.clear();

    criarMatriz();

    let sucesso = true;

    const palavrasOrdenadas = [...palavras].sort(
        (a, b) => b.length - a.length
    );

    for (const palavra of palavrasOrdenadas) {
        if (!posicionarPalavra(palavra)) {
            sucesso = false;
            break;
        }
    }

    if (!sucesso) {
        iniciarJogo();
        return;
    }

    preencherEspacos();
    desenharGrade();
    atualizarLista();

    mensagem.textContent = "Encontre as seis palavras escondidas!";
}


document.getElementById("novo-jogo").addEventListener(
    "click",
    iniciarJogo
);

iniciarJogo();


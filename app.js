// Variables del juego
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverScreen = document.querySelector('.game-over');
const recordsList = document.getElementById('records-list');
const bgMusic = document.getElementById('bg-music');
const audioBtn = document.getElementById('audio-btn');

let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 150;
let score = 0;
let gameInterval;
let isGameRunning = false;
let audioEnabled = true;

// Configurar volumen inicial
bgMusic.volume = 0.3;

// Función para generar comida
function generateFood() {
    let newFoodPosition;
    while (!newFoodPosition || snake.some(segment =>
        segment.x === newFoodPosition.x && segment.y === newFoodPosition.y)) {
        newFoodPosition = {
            x: Math.floor(Math.random() * 20) + 1,
            y: Math.floor(Math.random() * 20) + 1
        };
    }
    return newFoodPosition;
}

// Dibujar el juego
function drawGame() {
    gameBoard.innerHTML = '';

    // Dibujar serpiente
    snake.forEach(segment => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y;
        snakeElement.style.gridColumnStart = segment.x;
        snakeElement.classList.add('snake');
        gameBoard.appendChild(snakeElement);
    });

    // Dibujar comida
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food');
    gameBoard.appendChild(foodElement);
}

// Mover la serpiente
function moveSnake() {
    const head = { ...snake[0] };
    direction = nextDirection;

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Verificar colisiones
    if (
        head.x < 1 || head.x > 20 ||
        head.y < 1 || head.y > 20 ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Comer comida
    if (head.x === food.x && head.y === food.y) {
        if (audioEnabled) document.getElementById('eat-sound').play();
        score += 10;
        scoreDisplay.textContent = score;
        food = generateFood();

        // Aumentar dificultad
        if (score % 50 === 0) {
            clearInterval(gameInterval);
            gameSpeed = Math.max(50, gameSpeed - 10);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

// Game over
function gameOver() {
    const records = getRecords();
    const isNewRecord = score > 0 && (records.length < 5 || score > records[records.length - 1]);

    if (isNewRecord) {
        if (audioEnabled) {
            document.getElementById('highscore-sound').play();
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }
        saveRecord(score);
        updateRecordsDisplay();
        finalScoreDisplay.textContent = `¡Nuevo Récord! ${score} puntos`;
    } else {
        if (audioEnabled) {
            document.getElementById('gameover-sound').play();
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }
        finalScoreDisplay.textContent = `Puntuación: ${score} puntos`;
    }

    clearInterval(gameInterval);
    isGameRunning = false;
    gameOverScreen.style.display = 'flex';
    startBtn.textContent = "Iniciar";
    startBtn.style.opacity = "1";
}

// Reiniciar juego
function restartGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreDisplay.textContent = score;
    gameSpeed = 150;
    food = generateFood();
    gameOverScreen.style.display = 'none';
    startGame();
}

// Bucle principal del juego
function gameLoop() {
    moveSnake();
    drawGame();
}

// Iniciar juego
function startGame() {
    if (isGameRunning) return;

    isGameRunning = true;
    gameInterval = setInterval(gameLoop, gameSpeed);
    startBtn.textContent = "En Juego...";
    startBtn.style.opacity = "0.7";

    if (audioEnabled) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => {
            console.log("Error al reproducir:", e);
            if (e.name === "NotAllowedError") {
                alert("Haz clic en 'Iniciar' nuevamente para activar el audio. Los navegadores requieren interacción del usuario para reproducir sonidos.");
            }
        });
    }
}

// Sistema de récords
function getRecords() {
    return JSON.parse(localStorage.getItem('snakeRecords')) || [];
}

function saveRecord(score) {
    const records = getRecords();
    records.push(score);
    records.sort((a, b) => b - a);
    const topRecords = records.slice(0, 5);
    localStorage.setItem('snakeRecords', JSON.stringify(topRecords));
    return topRecords;
}

function updateRecordsDisplay() {
    const records = getRecords();
    recordsList.innerHTML = '';

    if (records.length === 0) {
        recordsList.innerHTML = '<li>No hay récords aún</li>';
        return;
    }

    records.forEach((record, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${record} puntos</span>`;
        recordsList.appendChild(li);
    });
}

// Control de audio
function toggleAudio() {
    audioEnabled = !audioEnabled;

    if (audioEnabled) {
        audioBtn.textContent = "🔊";
        if (isGameRunning) {
            bgMusic.play().catch(e => console.log("Error al reanudar:", e));
        }
    } else {
        audioBtn.textContent = "🔇";
        bgMusic.pause();
    }
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
audioBtn.addEventListener('click', toggleAudio);

// Controles
document.addEventListener('keydown', e => {
    if (!isGameRunning && (e.key === ' ' || e.key === 'Enter')) {
        startGame();
    }

    switch (e.key) {
        case 'ArrowUp': if (direction !== 'down') nextDirection = 'up'; break;
        case 'ArrowDown': if (direction !== 'up') nextDirection = 'down'; break;
        case 'ArrowLeft': if (direction !== 'right') nextDirection = 'left'; break;
        case 'ArrowRight': if (direction !== 'left') nextDirection = 'right'; break;
    }
});

// Inicializar
updateRecordsDisplay();
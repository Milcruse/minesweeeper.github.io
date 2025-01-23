const boardElement = document.querySelector('.board');
const startButton = document.querySelector('.start-btn');
const settingsButton = document.querySelector('.settings-btn');
const saveSettingsButton = document.querySelector('.save-settings-btn');
const difficultySelect = document.querySelector('#difficulty');
const bombCountInput = document.querySelector('#bomb-count');
const popup = document.querySelector('.popup');
const popupCloseButton = document.querySelector('.popup-close-btn');
const resultElement = document.createElement('div');
resultElement.classList.add('result');
document.querySelector('.game-area').appendChild(resultElement);

let board = [];
let rows = 8;
let cols = 8;
let bombCount = 10;

// Event Listeners
startButton.addEventListener('click', startGame);
settingsButton.addEventListener('click', toggleSettings);
saveSettingsButton.addEventListener('click', saveSettings);
popupCloseButton.addEventListener('click', closePopup);

function startGame(reset = false) {
    if (reset) {
        boardElement.innerHTML = '';
        resultElement.innerHTML = '';
    }
    
    // Установка параметров игры
    rows = difficultySelect.value === 'easy' ? 8 : 16;
    cols = difficultySelect.value === 'easy' ? 8 : 16;
    bombCount = parseInt(bombCountInput.value);
    
    // Создание и отображение игрового поля
    board = createBoard(rows, cols, bombCount);
    renderBoard(board);
}

function toggleSettings() {
    document.querySelector('.options').classList.toggle('hide');
}

function saveSettings() {
    startGame(true);
    toggleSettings();
}

function createBoard(rows, cols, bombCount) {
    const newBoard = Array(rows).fill(null).map(() => Array(cols).fill(0));
    placeBombs(newBoard, bombCount);
    calculateNumbers(newBoard);
    return newBoard;
}

function placeBombs(board, count) {
    let placed = 0;
    while (placed < count) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (board[row][col] !== 'B') {
            board[row][col] = 'B';
            placed++;
        }
    }
}

function calculateNumbers(board) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] !== 'B') {
                let count = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (x === 0 && y === 0) continue;
                        const newRow = i + x;
                        const newCol = j + y;
                        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                            if (board[newRow][newCol] === 'B') count++;
                        }
                    }
                }
                board[i][j] = count;
            }
        }
    }
}

function renderBoard(board) {
    boardElement.innerHTML = '';
    board.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.setAttribute('data-row', i);
            cellElement.setAttribute('data-col', j);
            cellElement.addEventListener('click', () => revealCell(i, j));
            cellElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(cellElement);
            });
            boardElement.appendChild(cellElement);
        });
    });
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

function revealCell(i, j) {
    const cellElement = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
    if (cellElement.classList.contains('revealed')) return;

    if (board[i][j] === 'B') {
        cellElement.classList.add('bomb');
        cellElement.innerHTML = '💣';
        endGame(false);
    } else {
        cellElement.innerHTML = board[i][j] === 0 ? '' : board[i][j];
        cellElement.classList.add('revealed');

        if (board[i][j] === 0) {
            revealAdjacentCells(i, j);
        }
        
        if (checkWin()) {
            endGame(true);
        }
    }
}

function revealAdjacentCells(i, j) {
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) continue;
            const newRow = i + x;
            const newCol = j + y;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                revealCell(newRow, newCol);
            }
        }
    }
}

function toggleFlag(cellElement) {
    cellElement.classList.toggle('flag');
    cellElement.innerHTML = cellElement.classList.contains('flag') ? '🚩' : '';
}

function endGame(won) {
    resultElement.innerHTML = won ? 'Поздравляем! Вы выиграли!' : 'Вы проиграли!';
}

function checkWin() {
    return [...document.querySelectorAll('.cell')].every(cell => {
        const row = cell.getAttribute('data-row');
        const col = cell.getAttribute('data-col');
        return board[row][col] === 'B' || cell.classList.contains('revealed');
    });
}

function closePopup() {
    popup.classList.add('hide');
}

// Показать попап с инструкцией при загрузке страницы
window.onload = () => {
    popup.classList.remove('hide');
}

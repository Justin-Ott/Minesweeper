const board = document.getElementById("gameBoard");
var width = 10;
var height = 10;
var difficulty=0.1;
var mineCount = Math.ceil((width * height) *difficulty); // Creates a 10x10 board with 20 mines by default
var flagsRemaining = mineCount;

const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationInterval;
let animationId;

let cells = []; // Stores cell information such as bombs and surrounding mine counts

cells.forEach(cellData => {
    cellData.element.addEventListener("contextmenu", e => {
        e.preventDefault();
        toggleFlage(cellData);
    })
})

let gameStarted = false; // Track if game has started

function createBoard(firstClickIndex = null, protect3x3 = false) {
    clearBoard();
    mineCount = Math.ceil((width * height) * difficulty);
    board.style.gridTemplateColumns = `repeat(${width}, 30px)`;
    board.style.gridTemplateRows = `repeat(${height}, 30px)`;
    flagsRemaining = mineCount;

    // Arrays of empty spaces and mines
    const mineArray = Array(mineCount).fill("mine");
    const emptyArray = Array(width * height - mineCount).fill("empty");
    let gameArray = emptyArray.concat(mineArray);

    // Randomize the mines
    let shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    // If this is the first click, ensure that cell is not a mine
    if (firstClickIndex !== null && protect3x3) {
    const protectedCells = get3x3Indices(firstClickIndex);

    protectedCells.forEach(idx => {
        if (shuffledArray[idx] === "mine") {
            // find an empty spot to move this mine TO
            for (let i = 0; i < shuffledArray.length; i++) {
                if (!protectedCells.includes(i) && shuffledArray[i] === "empty") {
                    shuffledArray[i] = "mine";
                    shuffledArray[idx] = "empty";
                    break;
                }
            }
        }
    });
    }

    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i; // This index is each cells cords 
        // console.log(cell.dataset.index);
        board.appendChild(cell);

        // Store cell info
        const type = shuffledArray[i];
        cells.push({
            type: type, // Mine or empty
            revealed: false, 
            flagged: false,
            element: cell
        })
    cell.addEventListener("click", () => handleClick(i));

    cell.addEventListener("contextmenu", e => {
        e.preventDefault();
        toggleFlag(cells[i]);
        })
    }
    calculateAdjacentMines();
    flagsLeft();

}

function calculateAdjacentMines() {
    console.log("Adjacent count started");
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].type === "mine") continue;
            let total = 0;
            const isLeftEdge = i % width === 0;
            const isRightEdge = (i + 1) % width ===0;

            if (i > 0 && !isLeftEdge && cells[i-1].type === "mine") total++;                                      // Left
            if (i < width * height - 1 && !isRightEdge && cells [i + 1].type === "mine") total++;                // Right
            if (i >= width && cells[i - width].type ==="mine") total ++;                                        // Top
            if (i < width * (height - 1) && cells[i + width].type === "mine") total++;                         // Bottom
            if (i >= width && !isRightEdge && cells[i - width + 1].type === "mine") total++;              // Top-Right
            if (i >= width && !isLeftEdge && cells[i - width - 1].type === "mine") total++;                  // Top-Left
            if (i < width * (height -1) && !isLeftEdge && cells[i + width - 1].type === "mine") total++;    // Bottom-Left
            if (i < width * (height -1) && !isRightEdge && cells[i + width + 1].type === "mine") total++;  // Bottom-Right
        
            cells[i].number = total;
        if (cells[i].number === 1) cells[i].element.style.color = "blue";
        if (cells[i].number === 2) cells[i].element.style.color = "green";
        if (cells[i].number === 3) cells[i].element.style.color = "red";
        if (cells[i].number === 4) cells[i].element.style.color = "darkpurple";
        if (cells[i].number === 5) cells[i].element.style.color = "maroon";
        if (cells[i].number === 6) cells[i].element.style.color = "cyan";
        if (cells[i].number === 7) cells[i].element.style.color = "black";
        if (cells[i].number === 8) cells[i].element.style.color = "gray"; 
        }
    }

function revealCell(index) {
    const cellData = cells[index];
    if (cellData.revealed) return;

    cellData.revealed = true;
    const cellE1 = cellData.element;

    cellE1.style.backgroundColor = "#dda";

    if (cellData.number > 0) {
        cellE1.textContent = cellData.number;
    } else {
        const isLeftEdge = index % width === 0;
        const isRightEdge = (index + 1) % width === 0;

        const neighbors = [];
    if (!isLeftEdge && index - 1 >= 0) neighbors.push(index - 1);                                // Left
    if (!isRightEdge && index + 1 < width * height) neighbors.push(index + 1);                   // Right
    if (index - width >= 0) neighbors.push(index - width);                                       // Top
    if (index + width < width * height) neighbors.push(index + width);                           // Bottom
    if (!isRightEdge && index - width + 1 >= 0) neighbors.push(index - width + 1);               // Top-Right
    if (!isLeftEdge && index - width - 1 >= 0) neighbors.push(index - width - 1);                // Top-Left
    if (!isLeftEdge && index + width - 1 < width * height) neighbors.push(index + width - 1);    // Bottom-Left
    if (!isRightEdge && index + width + 1 < width * height) neighbors.push(index + width + 1);   // Bottom-Right

        neighbors.forEach(n => revealCell(n));
    }
}

function toggleFlag(cellData) {
    if (cellData.revealed || flagsRemaining==0 && cellData.flagged != true) return;
    if (cellData.flagged) {
        cellData.flagged = false;
        cellData.element.textContent = "";
        flagsRemaining++;
    } else {
        cellData.flagged = true;
        cellData.element.textContent = "🚩";
        flagsRemaining--;
    }
    flagsLeft();
}

function flagsLeft() {
    const remainingFlags = document.getElementById('flagsRemaining');
    if (remainingFlags) remainingFlags.textContent = flagsRemaining; // Changes only the text content
}

function setDifficultyEasy() {
    difficulty=0.1;
    createBoard();
    flagsLeft();
    gameStarted = false; 
}

function setDifficultyMedium() {
    difficulty=0.15;
    createBoard();
    flagsLeft();
    gameStarted = false; 
}

function setDifficultyHard() {
    difficulty=0.3;
    createBoard();
    flagsLeft();
    gameStarted = false; 
}

let timerId = null;
let elapsedSeconds = 0;

function startScoreTimer() {
    console.log("Timer started");
    stopScoreTimer();
    elapsedSeconds = 0;
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.textContent = elapsedSeconds;
    timerId = setInterval(() => {
        elapsedSeconds += 1;
        scoreDisplay.textContent = elapsedSeconds;
    }, 1000);
}

function stopScoreTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

function resetScoreTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
    elapsedSeconds = 0;
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) scoreDisplay.textContent = elapsedSeconds;
}

function checkWin() {
    let revealedCount = 0;
    
    cells.forEach(cellData => {
        if (cellData.revealed && cellData.type !== "mine") {
            revealedCount++;
        }
    });

    if (revealedCount === width * height - mineCount) {
        stopScoreTimer();
        const scoreDisplay = document.getElementById('WinScoreDisplay');
        scoreDisplay.textContent = elapsedSeconds;
        const remainingFlags = document.getElementById('winFlagsTotal');
        if (remainingFlags) remainingFlags.textContent = mineCount; 
        var audio = document.getElementById("winGameAudio");
        audio.play();
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        startFireworks()

        document.getElementById("winScreen").style.display = "flex";
        // Disable further clicks
        //cells.forEach(cellData => cellData.element.removeEventListener("click", handleClick));  
    }
}

function gameOver() {
    cells.forEach(cellData => {
        if (cellData.type === "mine") {
            cellData.element.textContent = "💣";
            cellData.element.style.backgroundColor = "red";
        }
        if (cellData.type === "empty") {
            cellData.element.style.backgroundColor = "#dda";
            if (cellData.number > 0) {
                cellData.element.textContent = cellData.number;
            }
        }
    });

    setTimeout(function() {
        stopScoreTimer();
        const scoreDisplay = document.getElementById('lossScoreDisplay');
        scoreDisplay.textContent = elapsedSeconds;
        const remainingFlags = document.getElementById('lossFlagsRemaining');
        if (remainingFlags) remainingFlags.textContent = flagsRemaining;
        var audio = document.getElementById("loseGameAudio");
        audio.play();
        document.getElementById("gameOverScreen").style.display = "flex";
    }, 30);
}

function restartGame() {
    stopFireworks();
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("winScreen").style.display = "none";
    resetScoreTimer();
    gameStarted = false; // Reset game started flag
    flagsRemaining = mineCount;
    createBoard();
}

function handleClick(index) {
    // On first click, generate board with mines but not in a 3x3 area around clicked cell
    if (!gameStarted) {
    gameStarted = true;
    createBoard(index, true);   // pass flag to indicate first click
    reveal3x3(index);           // reveal 3×3 safe area
    }

    const cellData = cells[index];
    if (elapsedSeconds === 0 && timerId === null) {
        startScoreTimer();
    }

    if (cellData.revealed) return;
    
    const CellE1 = cellData.element;

    if (cellData.revealed || cellData.flagged) return;

    if (cellData.type === "mine") {
        CellE1.textContent = "💣";
        CellE1.style.backgroundColor = "red";
        gameOver();
    } else {
        CellE1.style.backgroundColor = "#dda";
        if (cellData.number > 0) {
            CellE1.textContent = cellData.number;
        } else {
            revealCell(index);
        }
    }
    cellData.revealed = true;
    checkWin();
}

function get3x3Indices(center) {
    const indices = [];
    const row = Math.floor(center / width);
    const col = center % width;

    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            let newR = row + r;
            let newC = col + c;

            if (newR >= 0 && newR < height && newC >= 0 && newC < width) {
                indices.push(newR * width + newC);
            }
        }
    }
    return indices;
}

function reveal3x3(center) {
    const indices = get3x3Indices(center);
    indices.forEach(i => {
        if (!cells[i].revealed && !cells[i].flagged) {
            if (cells[i].number > 0) {
                cells[i].element.textContent = cells[i].number;
            }
            revealCell(i); 
        }
    });
}

function clearBoard() {
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }
    cells = [];
}

// Increase board size
function decreaseSize() {
    width-- ;
    height-- ;
    mineCount = Math.ceil((width * height) *difficulty);
    //clearBoard();
    createBoard();
    flagsLeft();
    resetScoreTimer();
    gameStarted = false; 
}
function increaseSize() {
    width++ ;
    height++ ;
    mineCount = Math.ceil((width * height) *difficulty);
    //clearBoard();
    createBoard();
    flagsLeft();
    resetScoreTimer();
    gameStarted = false; 
}
function resetSize() {
    width = 10;
    height = 10;
    mineCount = Math.ceil((width * height) *difficulty);
    //clearBoard();
    createBoard();
    flagsLeft();
    resetScoreTimer();
    gameStarted = false; 
    var audio = document.getElementById("changeDifAudio");
    audio.play();
}

// Change initial board creation to empty
function createEmptyBoard() {
    clearBoard();
    mineCount = Math.ceil((width * height) * difficulty);
    board.style.gridTemplateColumns = `repeat(${width}, 30px)`;
    board.style.gridTemplateRows = `repeat(${height}, 30px)`;
    flagsRemaining = mineCount;

    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        board.appendChild(cell);

        cells.push({
            type: "empty",
            revealed: false,
            flagged: false,
            element: cell
        })
        cell.addEventListener("click", () => handleClick(i));
        cell.addEventListener("contextmenu", e => {
            e.preventDefault();
            toggleFlag(cells[i]);
        })
    }
    flagsLeft();
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Set audio volumes
    const loseGameAudio = document.getElementById("loseGameAudio");
    const winGameAudio = document.getElementById("winGameAudio");
    const changeDifAudio = document.getElementById("changeDifAudio");
    
    if (loseGameAudio) loseGameAudio.volume = 0.2;
    if (winGameAudio) winGameAudio.volume = 0.1;
    if (changeDifAudio) changeDifAudio.volume = 0.4;
    
    const easyButton = document.getElementById("easyButton");
    const mediumButton = document.getElementById("mediumButton");
    const hardButton = document.getElementById("hardButton");
    const decreaseSizeButton = document.getElementById("decreaseSizeButton");
    const increaseSizeButton = document.getElementById("increaseSizeButton");
    const resetSizeButton = document.getElementById("resetSizeButton"); 
    const restartButton = document.getElementById("restartButton");
    const restartWinButton = document.getElementById("restartWinButton");
    
    function clearSelected() {
        if (easyButton) easyButton.classList.remove("selected");
        if (mediumButton) mediumButton.classList.remove("selected");
        if (hardButton) hardButton.classList.remove("selected");
    }

    if (easyButton) {
        easyButton.addEventListener("click", () => {
            clearSelected();
            easyButton.classList.add("selected");
            setDifficultyEasy();
            resetScoreTimer();
        });
    }

    if (mediumButton) {
        mediumButton.addEventListener("click", () => {
            clearSelected();
            mediumButton.classList.add("selected");
            setDifficultyMedium();
            resetScoreTimer();
        });
    }

    if (hardButton) {
        hardButton.addEventListener("click", () => {
            clearSelected();
            hardButton.classList.add("selected");
            setDifficultyHard(); 
            resetScoreTimer();
        });
    }

    if (decreaseSizeButton) {
        decreaseSizeButton.addEventListener("click", decreaseSize);
    }

    if (increaseSizeButton) {
        increaseSizeButton.addEventListener("click", increaseSize);
    }

    if (resetSizeButton) {
        resetSizeButton.addEventListener("click", resetSize);
    }

    if (restartButton) {
        restartButton.addEventListener("click", restartGame);

    }
    if (restartWinButton) {
        restartWinButton.addEventListener("click", restartGame);
    }

    const botMoveButton = document.getElementById("botMoveButton");
    if (botMoveButton) {
        botMoveButton.addEventListener("click", makeBotMove);
    }
});

document.addEventListener('keydown', function(event) {
  // Check if the pressed key is the spacebar and that the game is over
  if (event.code === 'Space'&& document.getElementById("gameOverScreen").style.display === "flex" || document.getElementById("winScreen").style.display === "flex") {
    // Prevent the default browser action 
    event.preventDefault(); 
    restartGame();
  }
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5
        };
        this.alpha = 1;
        this.friction = 0.98;
        this.gravity = 0.1;
        this.size = Math.random() * 3 + 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

// Function to create a burst of particles
function createExplosion(x, y) {
    const particleCount = 100;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Animation loop
function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trail effect
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].alpha <= 0 || particles[i].size <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animate);
}

// Function to start the fireworks generation
function startFireworks() {
    // Repeatedly launch new explosions from random locations
    animationInterval = setInterval(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.7; // Aim for the top 70% of the screen
        createExplosion(x, y);
    }, 500); // Create a new explosion every 0.5 seconds

    animate(); // Start the animation loop
}

function stopFireworks() {
    // Stop the function that creates new explosions
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null; // Optional: helps track if interval is active
    }

    // Stop the requestAnimationFrame loop
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null; // Optional: helps track if loop is active
    }

    console.log("Fireworks animation stopped.");
}


// Bot functions
function getNeighbors(index) {
    const neighbors = [];
    const isLeftEdge = index % width === 0;
    const isRightEdge = (index + 1) % width === 0;

    if (index > 0 && !isLeftEdge) neighbors.push(index - 1);                                      // Left
    if (index < width * height - 1 && !isRightEdge) neighbors.push(index + 1);                   // Right
    if (index >= width) neighbors.push(index - width);                                          // Top
    if (index < width * (height - 1)) neighbors.push(index + width);                           // Bottom
    if (index >= width + 1 && !isRightEdge) neighbors.push(index - width + 1);                // Top-Right
    if (index >= width && !isLeftEdge) neighbors.push(index - width - 1);                    // Top-Left
    if (index < width * (height - 1) - 1 && !isLeftEdge) neighbors.push(index + width - 1); // Bottom-Left
    if (index < width * (height - 1) && !isRightEdge) neighbors.push(index + width + 1);   // Bottom-Right

    return neighbors;
}

function findBotMove() {
    // Simple solver: look for cells where flagged neighbors == number, reveal others
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].revealed || cells[i].number === 0) continue;

        const neighbors = getNeighbors(i);
        const flaggedNeighbors = neighbors.filter(n => cells[n].flagged);
        const unrevealedNeighbors = neighbors.filter(n => !cells[n].revealed && !cells[n].flagged);

        if (flaggedNeighbors.length === cells[i].number) {
            // All mines accounted for, reveal the rest
            if (unrevealedNeighbors.length > 0) {
                return { action: 'reveal', index: unrevealedNeighbors[0] };
            }
        } else if (unrevealedNeighbors.length === cells[i].number - flaggedNeighbors.length) {
            // Remaining unrevealed are mines
            if (unrevealedNeighbors.length > 0) {
                return { action: 'flag', index: unrevealedNeighbors[0] };
            }
        }
    }

    // If no logical move, pick a random unrevealed cell
    const unrevealed = cells.map((cell, index) => ({ cell, index })).filter(({ cell }) => !cell.revealed && !cell.flagged);
    if (unrevealed.length > 0) {
        const randomIndex = Math.floor(Math.random() * unrevealed.length);
        return { action: 'reveal', index: unrevealed[randomIndex].index };
    }

    return null; // No moves left
}

function makeBotMove() {
    const move = findBotMove();
    if (move) {
        if (move.action === 'reveal') {
            handleClick(move.index);
        } else if (move.action === 'flag') {
            toggleFlag(cells[move.index]);
        }
    }
}

// createBoard();
createEmptyBoard();

import { squares, width } from './gameBoard.js';
import { isPaused, frameTime } from './app.js';
import { pacDotEaten, powerPelletEaten, scaredGhostEaten } from './scoring.js';
import { gameOver, loseLife } from './gameState.js';
import { ghosts } from './ghosts.js';

export let pacmanCurrentIndex = 490;
squares[pacmanCurrentIndex].classList.add('pac-man');

export let isMoving = false;
let lastTimestamp = 0;
let currentDirection = null;
const speed = 0.4;

let animationFrameId; 

export function movePacman(data) {
    if (isPaused || !isMoving) return;
    const key = data.key;

    const nextIndex = getNextIndex(pacmanCurrentIndex, key)
    
    const ghostAtNextSquare = ghosts.find(ghost => ghost.currentIndex === nextIndex);
    
    if (ghostAtNextSquare) {
       
        if (ghostAtNextSquare.isScared) {
            console.log("Pacman hit a ghost!");
            scaredGhostEaten(ghostAtNextSquare);
        } else {
            loseLife();  // Pac-Man loses a life
            return; // Prevent Pac-Man from moving further until reset
        }
    }
    
    document.querySelectorAll('.pac-man').forEach(square => {
        square.classList.remove('pac-man');
        square.style.backgroundImage = '';
    });
    pacmanCurrentIndex = nextIndex
    squares[pacmanCurrentIndex].classList.add('pac-man');

    updatePacmanDirection(key);
    
    pacDotEaten();
    powerPelletEaten();
    gameOver();
}

// Helper to calculate the next index based on direction
function getNextIndex(currentIndex, key) {
    let nextIndex = currentIndex;
    switch (key) {
        case 'ArrowLeft':
            if (squares[pacmanCurrentIndex-1] === squares[363]) {
                return 391
            } else if (
                pacmanCurrentIndex % width !== 0 &&
                !squares[pacmanCurrentIndex-1].classList.contains('wall') &&
                !squares[pacmanCurrentIndex-1].classList.contains('ghost-lair')
            ) {
                nextIndex = currentIndex - 1;
            }
            break;
        case 'ArrowRight':
            if (squares[pacmanCurrentIndex+1] === squares[392]) {
                return 364
            } else if (
                pacmanCurrentIndex % width < width -1 &&
                !squares[pacmanCurrentIndex+1].classList.contains('wall') &&
                !squares[pacmanCurrentIndex+1].classList.contains('ghost-lair')
            ) {
                nextIndex = pacmanCurrentIndex + 1;
            }
            break;
        case 'ArrowUp':
            if (
                pacmanCurrentIndex - width >= width &&
                !squares[pacmanCurrentIndex-width].classList.contains('wall') &&
                !squares[pacmanCurrentIndex-width].classList.contains('ghost-lair')
            ) {
                nextIndex = pacmanCurrentIndex -width;
            }
            break;
        case 'ArrowDown':
            if (
                pacmanCurrentIndex + width < width * width &&
                !squares[pacmanCurrentIndex+width].classList.contains('wall') &&
                !squares[pacmanCurrentIndex+width].classList.contains('ghost-lair')
            ) {
                nextIndex = pacmanCurrentIndex + width;
            }
            break;
    }
    return nextIndex;
}

function updatePacmanDirection(direction) {
    const pacman = squares[pacmanCurrentIndex]; 
    if (!pacman) return;

    switch (direction) {
        case 'ArrowLeft':
            pacman.style.backgroundImage = "url('images/pacman-left.png')";
            break;
        case 'ArrowRight':
            pacman.style.backgroundImage = "url('images/pacman-right.png')";
            break;
        case 'ArrowUp':
            pacman.style.backgroundImage = "url('images/pacman-up.png')";
            break;
        case 'ArrowDown':
            pacman.style.backgroundImage = "url('images/pacman-down.png')";
            break;
    }
}


export function movePacmanSmoothly(timestamp) {
    if (!isMoving || isPaused) return; 

    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp; // Time since last frame
        
    const moveStep = (deltaTime / frameTime) * speed; // Scale movement speed

    if (moveStep >= 1) {  // Only move when enough step value accumulates
        movePacman({ key: currentDirection });
        lastTimestamp = timestamp;
    }
    animationFrameId = requestAnimationFrame(movePacmanSmoothly); 
}


export function startMoving(e) {
    if (isPaused) return; 
    
    currentDirection = e.key; 
    updatePacmanDirection(currentDirection);

    isMoving = true;
    lastTimestamp = 0; // Reset timestamp
    movePacmanSmoothly(performance.now());
    return
}

export function stopMoving() {
    
    isMoving = false; 
    cancelAnimationFrame(animationFrameId);
}

export function stopAllAnimations() {
    isMoving = false;
    cancelAnimationFrame(animationFrameId);
    ghosts.forEach(ghost => {
        cancelAnimationFrame(ghost.timerID);
    });
}

export function resetPacman() {
    document.querySelectorAll('.pac-man').forEach(square => {
        square.classList.remove('pac-man');
        square.style.backgroundImage = '';
    });    
    pacmanCurrentIndex = 490;
    squares[pacmanCurrentIndex].classList.add('pac-man');
    squares[pacmanCurrentIndex].style.backgroundImage = "url('images/pacman-right.png')"
    isMoving = false;
    currentDirection = null;
}
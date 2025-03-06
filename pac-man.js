import { squares, width } from './gameBoard.js';
import { isPaused } from './app.js';
import { pacDotEaten, powerPelletEaten } from './scoring.js';
import { checkForWin, gameOver } from './gameState.js';
import { ghosts } from './ghosts.js';

export let pacmanCurrentIndex = 490;
squares[pacmanCurrentIndex].classList.add('pac-man');

export let isMoving = false;
let lastMoveTime = 0;
let currentDirection = null;
const moveDelay = 150;

let animationFrameId; 

export function movePacman(data) {
    if (isPaused || !isMoving) return;
    const key = data.key;
    const nextIndex = getNextIndex(pacmanCurrentIndex, key)
    
    const ghostAtNextSquare = ghosts.find(ghost => ghost.currentIndex === nextIndex);
    
    if (ghostAtNextSquare) {
        if (ghostAtNextSquare.isScared) {
            // Pac-Man eats the scared ghost
            scaredGhostEaten(ghostAtNextSquare);
        } else if (gameOver) {
            return; // Prevent Pac-Man from moving
        }
    }
    
    squares[pacmanCurrentIndex].classList.remove('pac-man');
    pacmanCurrentIndex = nextIndex
    squares[pacmanCurrentIndex].classList.add('pac-man');
    
    pacDotEaten()
    powerPelletEaten()
    checkForWin()
}

// Helper to calculate the next index based on direction
function getNextIndex(currentIndex, key) {
    switch (key) {
        case 'ArrowLeft':
            if (squares[pacmanCurrentIndex-1] === squares[363]) {
                return 391
            } else if (
                pacmanCurrentIndex % width !== 0 &&
                !squares[pacmanCurrentIndex-1].classList.contains('wall') &&
                !squares[pacmanCurrentIndex-1].classList.contains('ghost-lair')
            ) {
                return currentIndex - 1;
            }
            break
        case 'ArrowRight':
            if (squares[pacmanCurrentIndex+1] === squares[392]) {
                return 364
            } else if (
                pacmanCurrentIndex % width < width -1 &&
                !squares[pacmanCurrentIndex+1].classList.contains('wall') &&
                !squares[pacmanCurrentIndex+1].classList.contains('ghost-lair')
            ) {
                return pacmanCurrentIndex + 1;
            }
            break;
        case 'ArrowUp':
            if (
                pacmanCurrentIndex - width >= width &&
                !squares[pacmanCurrentIndex-width].classList.contains('wall') &&
                !squares[pacmanCurrentIndex-width].classList.contains('ghost-lair')
            ) {
               return pacmanCurrentIndex -width;
            }
            break;
        case 'ArrowDown':
            if (
                pacmanCurrentIndex + width < width * width &&
                !squares[pacmanCurrentIndex+width].classList.contains('wall') &&
                !squares[pacmanCurrentIndex+width].classList.contains('ghost-lair')
            ) {
                return pacmanCurrentIndex + width;
            }
            break;
    }
    return currentIndex
}

export function movePacmanSmoothly(timestamp) {
    if (!isMoving || isPaused) return; 

    if (timestamp - lastMoveTime >= moveDelay) {
    movePacman({ key: currentDirection }); 
    lastMoveTime = timestamp;
}
animationFrameId = requestAnimationFrame(movePacmanSmoothly); 
}

export function startMoving(e) {
    if (isMoving || isPaused) return; 
    
    currentDirection = e.key; 
    isMoving = true;
    movePacmanSmoothly();
    return
}

export function stopMoving() {
    
    isMoving = false; 
    cancelAnimationFrame(animationFrameId);
}

export function stopAllAnimations() {
    console.log("stopping all animations")
    isMoving = false;
    console.log(`isMoving value ${isMoving}`)
    cancelAnimationFrame(animationFrameId);
    console.log(animationFrameId)
    ghosts.forEach(ghost => {
        cancelAnimationFrame(ghost.timerID);
    });
}
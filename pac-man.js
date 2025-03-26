import { squares, width } from './gameBoard.js';
import { isPaused, frameTime } from './app.js';
import { pacDotEaten, powerPelletEaten, scaredGhostEaten } from './scoring.js';
import { loseLife } from './gameState.js';
import { ghosts } from './ghosts.js';

export let pacmanCurrentIndex = 490;
squares[pacmanCurrentIndex].classList.add('pac-man');

export let isMoving = false;
let lastTimestamp = 0;
let currentDirection = null;
const speed = 0.3;

let animationFrameId; 

export function movePacman(data) {
    if (isPaused || !isMoving) return;
    const key = data.key;

    const nextIndex = getNextIndex(pacmanCurrentIndex, key)
    
    const ghostAtNextSquare = ghosts.find(ghost => ghost.currentIndex === nextIndex);
    
    if (ghostAtNextSquare) {
       
        if (ghostAtNextSquare.isScared) {
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


let directions = [""];
let right = false;
let left = false;
let up = false;
let down = false;

export function startMoving(e) {
    if (isPaused) return;

    // Update current direction to latest key pressed down
    if (
        (e.key == "ArrowLeft" && !left) ||
        (e.key == "ArrowRight" && !right) ||
        (e.key == "ArrowUp" && !up) ||
        (e.key == "ArrowDown" && !down)
    ) {
        // Put latest direction to start of directions array
        directions.unshift(e.key)
        currentDirection = directions[0];
    }    

    if (e.key == "ArrowLeft") left = true;
    if (e.key == "ArrowRight") right = true;
    if (e.key == "ArrowUp") up = true;
    if (e.key == "ArrowDown") down = true;    

    isMoving = true;
    lastTimestamp = 0; // Reset timestamp

    //movePacmanSmoothly(performance.now());
    // requestAnimationFrame runs callback with timestamp anyway
    requestAnimationFrame(movePacmanSmoothly);
    return
}

export function stopMoving(e) {

    // Remove lifted key form array of directions
    if (
        e.key == "ArrowLeft" ||
        e.key == "ArrowRight" ||
        e.key == "ArrowUp" ||
        e.key == "ArrowDown"
    ) {
        // Find index and splice that element out
        const keyIndex = directions.findIndex(ele => ele === e.key);
        directions.splice(keyIndex, 1);
        currentDirection = directions[0];
    }

    if (e.key == "ArrowLeft") left = false;
    if (e.key == "ArrowRight") right = false;
    if (e.key == "ArrowUp") up = false;
    if (e.key == "ArrowDown") down = false;

    if (!currentDirection || currentDirection.length == 0) {
        isMoving = false;
        cancelAnimationFrame(animationFrameId);
    }
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
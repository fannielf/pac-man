import { squares, width } from './gameBoard.js';
import { isPaused } from './app.js';
import { pacDotEaten, powerPelletEaten } from './scoring.js';
import { checkForWin } from './gameState.js';
import { ghosts } from './ghosts.js';

export let pacmanCurrentIndex = 490;
squares[pacmanCurrentIndex].classList.add('pac-man');

export let isMoving = false;
let lastMoveTime = 0;
let currentDirection = null;
const moveDelay = 150;

let animationFrameId; 

export function movePacman(data) {
    if (isPaused) return;
    const key = data.key;
    squares[pacmanCurrentIndex].classList.remove('pac-man');
    switch (key) {
        case 'ArrowLeft' : 
            if (squares[pacmanCurrentIndex-1] === squares[363]) {
                pacmanCurrentIndex = 391
            } else if (
                pacmanCurrentIndex % width !== 0 &&
                !squares[pacmanCurrentIndex-1].classList.contains('wall') &&
                !squares[pacmanCurrentIndex-1].classList.contains('ghost-lair')
            ) {
                pacmanCurrentIndex -=1;
            }
            break;
        case 'ArrowRight' :
            if (squares[pacmanCurrentIndex+1] === squares[392]) {
                pacmanCurrentIndex = 364
            } else if (
                pacmanCurrentIndex % width < width -1 &&
                !squares[pacmanCurrentIndex+1].classList.contains('wall') &&
                !squares[pacmanCurrentIndex+1].classList.contains('ghost-lair')
            ) {
                pacmanCurrentIndex +=1;
            }
            break;
        case 'ArrowUp' : 
            if (
                pacmanCurrentIndex - width >= width &&
                !squares[pacmanCurrentIndex-width].classList.contains('wall') &&
                !squares[pacmanCurrentIndex-width].classList.contains('ghost-lair')
            ) {
                pacmanCurrentIndex -=width;
            }
            break;
        case 'ArrowDown' :
            if (
                pacmanCurrentIndex + width < width * width &&
                !squares[pacmanCurrentIndex+width].classList.contains('wall') &&
                !squares[pacmanCurrentIndex+width].classList.contains('ghost-lair')
            ) {
                pacmanCurrentIndex +=width;
            }
            break;
    }
    squares[pacmanCurrentIndex].classList.add('pac-man');
    
    pacDotEaten()
    powerPelletEaten()
    checkForWin()
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
}

export function stopMoving() {
    
    isMoving = false; 
    cancelAnimationFrame(animationFrameId);
}

export function stopAllAnimations() {
    isMoving = false;
    ghosts.forEach(ghost => {
        cancelAnimationFrame(ghost.timerID);
    });
}
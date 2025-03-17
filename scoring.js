import { squares } from "./gameBoard.js";
import { pacmanCurrentIndex } from "./pac-man.js";
import { ghosts, escapeLair } from "./ghosts.js";
import { gameOver } from "./gameState.js";
import { isPaused, newScareEnd } from "./app.js";

export let score = 0;
const scoreDisplay = document.getElementById('score');

// what happens when pac-man eats a pac-dot
export function pacDotEaten() {
    if (squares[pacmanCurrentIndex].classList.contains('pac-dot')) {
        score++;
        scoreDisplay.innerHTML = score;
        squares[pacmanCurrentIndex].classList.remove('pac-dot');
        gameOver();
    }
}

export let scareTimerId = null;
export let scareEndTime = 0;
let points = 100;

// what happens when pac-man eats a power-pallet
export function powerPelletEaten() {
    if (squares[pacmanCurrentIndex].classList.contains('power-pellet')) {
        points = 100;
        score += 10;
        scoreDisplay.innerHTML = score;
        ghosts.forEach(ghost => {
            ghost.isScared = true;             
        });
        scareEndTime = performance.now() + 10000;

        scareTimerId = requestAnimationFrame(checkUnscare);
        squares[pacmanCurrentIndex].classList.remove('power-pellet');    
        gameOver();
    }
}

export function checkUnscare(time) {
    if (isPaused) {
        scareTimerId = requestAnimationFrame(checkUnscare);
        return
    }
    if (newScareEnd !== 0 && newScareEnd > scareEndTime) {
        scareEndTime = newScareEnd;
    }
    if (time >= scareEndTime) {
        cancelAnimationFrame(scareTimerId);
        unScareGhosts(); 
    } else {
        if ((scareEndTime) - time <= 3000) {
            ghosts.forEach(ghost => {
                if (ghost.isScared) {
                squares[ghost.currentIndex].classList.add('blinking-ghost');
            }
            });
        }
    scareTimerId = requestAnimationFrame(checkUnscare);
    }
}

function unScareGhosts() {
    ghosts.forEach(ghost => {
        squares[ghost.currentIndex].classList.remove('scared-ghost', 'blinking-ghost');
        ghost.isScared = false;
    });
}

export function scaredGhostEaten(ghost) {
    if (pacmanCurrentIndex === ghost.currentIndex && ghost.isScared) {
        squares[ghost.currentIndex].classList.remove(ghost.className, 'scared-ghost', 'ghost', 'blinking-ghost');
        ghost.currentIndex = ghost.startIndex;
        ghost.isScared = false;
        ghost.wanderingTime = 0;
        ghost.timeElapsed = 0;
        ghost.exitDelay = 2;
        points = points * 2;
        score += points;
        scoreDisplay.innerHTML = score;
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
        return true
    }
    return false
}
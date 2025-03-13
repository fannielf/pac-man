import { squares, layout, width } from './gameBoard.js';
import { startMoving, stopAllAnimations, resetPacman } from './pac-man.js';
import { score } from './scoring.js';
import { endMenu, timer, stopTimer } from './app.js';
import { resetGhosts } from './ghosts.js';
import { togglePause } from './app.js';

const endMessage = document.getElementById('end-message');
const finalScore = document.getElementById('final-score');
const finalTime = document.getElementById('final-time');

export let lives = 3;
export let gameIsOver = false;


function updateLives() {
    document.getElementById('lives').textContent = `Lives: ${lives}`;
}

updateLives();

export function loseLife() {
    if (lives > 0) {
        lives--;
        updateLives();

        if (lives <= 0) {
            gameOver();
        } else {
            resetGameAfterLifeLost();
        }
    }
}

function resetGameAfterLifeLost() {
    resetPacman();
    resetGhosts();
    
}


export function gameOver() {
    if (lives > 0) return;
    gameIsOver = true
    stopAllAnimations();
    document.removeEventListener('keydown', startMoving);
    document.removeEventListener("keydown", togglePause);
    stopTimer();

    squares.forEach(square => {
        square.classList.remove('pac-man', 'ghost', 'scared-ghost');
    });
    endMessage.innerHTML = 'Game Over';
    finalScore.innerHTML = score;
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    finalTime.innerHTML = `${minutes}m ${seconds}s`;
    endMenu.classList.remove('hidden');
}

export function checkForWin() {
    if (boardEmpty()) {
        gameIsOver = true;
        stopAllAnimations();
        document.removeEventListener('keydown', startMoving)
        document.removeEventListener("keydown", togglePause);
        stopTimer();

        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'You have WON!!';
        finalScore.innerHTML = score;
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        finalTime.innerHTML = `${minutes}m ${seconds}s`;
        endMenu.classList.remove('hidden');
    }
}

function boardEmpty() {
    let isEmpty = true;

    for (let i = 0; i < layout.length * width; i ++) {
        if (squares[i].classList.contains('pac-dot') || squares[i].classList.contains('pac-pellet')) {
            isEmpty = false;
            break;
        }
    }
    return isEmpty
}
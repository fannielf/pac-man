import { squares, layout, width } from './gameBoard.js';
import { startMoving, stopAllAnimations, resetPacman } from './pac-man.js';
import { score } from './scoring.js';
import { timer, stopTimer } from './app.js';
import { resetGhosts } from './ghosts.js';

const endMenu = document.getElementById('end-menu');
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
    if (gameIsOver) return
    lives--;
    updateLives();
    if (lives > 0) {
        resetPacman();
        resetGhosts();  
    } else {
        gameOver()
    }
}

// Check if the player is out of lives or have won, and render end menu
export function gameOver() {
    if (lives === 0) {
        endMessage.innerHTML = 'GAME OVER';
    } else if (boardEmpty()) {
        endMessage.innerHTML = 'You have WON!!';
    } else {
        return
    }
    gameIsOver = true
    stopAllAnimations();
    document.removeEventListener('keydown', startMoving);
    stopTimer();

    finalScore.innerHTML = score;
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    finalTime.innerHTML = `${minutes}m ${seconds}s`;
    endMenu.classList.remove('hidden');
}

// Check if the board is empty of pac-dots and power-pellets
function boardEmpty() {
    let isEmpty = true;

    for (let i = 0; i < layout.length * width; i ++) {
        if (squares[i].classList.contains('pac-dot') || squares[i].classList.contains('power-pellet')) {
            isEmpty = false;
            break;
        }
    }
    return isEmpty
}
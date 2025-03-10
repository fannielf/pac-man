import { squares } from './gameBoard.js';
import { pacmanCurrentIndex, startMoving, stopAllAnimations } from './pac-man.js';
import { score } from './scoring.js';
import { endMenu, stopTimer, timer } from './app.js';
import { ghosts, resetGhosts } from './ghosts.js';
import { resetPacman } from './pac-man.js';

const endMessage = document.getElementById('end-message');
const finalScore = document.getElementById('final-score');
const finalTime = document.getElementById('final-time');

export let lives = 3;


function updateLives() {
    document.getElementById('lives').textContent = `Lives: ${lives}`;
}

updateLives();

export function loseLife() {
    if (lives > 0) {
        lives--;
        console.log("Lives left:", lives);
        updateLives();

        if (lives <= 0) {
            console.log("Calling gameOver()...");
            gameOver();
        } else {
            resetGameAfterLifeLost();
        }
    }
}



function resetGameAfterLifeLost() {
    resetPacman();
    resetGhosts();
    document.addEventListener('keydown', startMoving);
}


export function gameOver() {
    if (lives > 0) return;
    stopAllAnimations();
    document.removeEventListener('keydown', startMoving);
    stopTimer();
    document.getElementById('pause-button').classList.add('hidden');

    squares.forEach(square => {
        square.classList.remove('pac-man', 'ghost', 'scared-ghost');
    });
    endMessage.innerHTML = 'Game Over';
    finalScore.innerHTML = score;
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    finalTime.innerHTML = `${minutes}m ${seconds}s`;
    endMenu.classList.remove('hidden');
    return true;
}


export function checkForWin() {
    if (score >= 1000) {
        stopAllAnimations();
        document.removeEventListener('keydown', startMoving)
        stopTimer();
        document.getElementById('pause-button').classList.add('hidden');

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
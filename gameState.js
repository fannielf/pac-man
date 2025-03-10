import { squares } from './gameBoard.js';
import { pacmanCurrentIndex, startMoving, stopAllAnimations } from './pac-man.js';
import { score } from './scoring.js';
import { endMenu, stopTimer, timer } from './app.js';

const endMessage = document.getElementById('end-message');
const finalScore = document.getElementById('final-score');
const finalTime = document.getElementById('final-time');

export function gameOver() {
    if (
        squares[pacmanCurrentIndex].classList.contains('ghost') &&
        !squares[pacmanCurrentIndex].classList.contains('scared-ghost')
    ) {
        stopAllAnimations();
        document.removeEventListener('keydown', startMoving)
        stopTimer();
        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'Game Over';
        finalScore.innerHTML = score;
        finalTime.innerHTML = `${timer}s`;
        endMenu.classList.remove('hidden');
        return true
    }
    return false
}

export function checkForWin() {
    if (score >= 1000) {
        stopAllAnimations();
        document.removeEventListener('keydown', startMoving)
        stopTimer();
        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'You have WON!!';
        finalScore.innerHTML = score;
        finalTime.innerHTML = `${timer}s`;
        endMenu.classList.remove('hidden');
    }
}


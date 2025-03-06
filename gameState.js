import { squares } from './gameBoard.js';
import { pacmanCurrentIndex, startMoving, stopMoving, stopAllAnimations } from './pac-man.js';
import { score } from './scoring.js';
import { endMenu } from './app.js';

const endMessage = document.getElementById('end-message');
const finalScore = document.getElementById('final-score');

export function checkForGameOver() {
    if (
        squares[pacmanCurrentIndex].classList.contains('ghost') &&
        !squares[pacmanCurrentIndex].classList.contains('scared-ghost')
    ) {
        stopAllAnimations();
        document.removeEventListener('keyup', stopMoving)
        document.removeEventListener('keydown', startMoving)
        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'Game Over';
        finalScore.innerHTML = score;
        endMenu.classList.remove('hidden');
    }
}

export function checkForWin() {
    if (score >= 50) {
        stopAllAnimations();
        document.removeEventListener('keyup', stopMoving)
        document.removeEventListener('keydown', startMoving)
        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'You have WON!!';
        finalScore.innerHTML = score;
        endMenu.classList.remove('hidden');
    }
}


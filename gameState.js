import { squares } from './gameBoard.js';
import { pacmanCurrentIndex, startMoving, stopAllAnimations } from './pac-man.js';
import { score } from './scoring.js';
import { endMenu } from './app.js';

const endMessage = document.getElementById('end-message');
const finalScore = document.getElementById('final-score');

export function gameOver() {
    if (
        squares[pacmanCurrentIndex].classList.contains('ghost') &&
        !squares[pacmanCurrentIndex].classList.contains('scared-ghost')
    ) {
        stopAllAnimations();
        console.log("removing event listeners")
        document.removeEventListener('keydown', startMoving)
        console.log("removing classes from classList")
        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'Game Over';
        finalScore.innerHTML = score;
        endMenu.classList.remove('hidden');
        return true
    }
    return false
}

export function checkForWin() {
    if (score >= 1000) {
        stopAllAnimations();
        document.removeEventListener('keydown', startMoving)
        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'You have WON!!';
        finalScore.innerHTML = score;
        endMenu.classList.remove('hidden');
    }
}


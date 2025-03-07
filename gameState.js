import { squares } from './gameBoard.js';
import { pacmanCurrentIndex, startMoving, stopMoving, stopAllAnimations } from './pac-man.js';
import { score } from './scoring.js';
import { endMenu } from './app.js';

const endMessage = document.getElementById('end-message');
const finalScore = document.getElementById('final-score');
const finalTime = document.getElementById('final-time');

let timer = 0;
let timerInterval;
let isTimerRunning = false;

export function startTimer() {
    if (isTimerRunning) return;

    timer = 0;
    isTimerRunning = true;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timer++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('timer').textContent = `Time: ${minutes}m ${seconds}s`;
}

export function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

export function gameOver() {
    if (
        squares[pacmanCurrentIndex].classList.contains('ghost') &&
        !squares[pacmanCurrentIndex].classList.contains('scared-ghost')
    ) {
        stopAllAnimations();
        console.log("removing event listeners")
        document.removeEventListener('keydown', startMoving)
        stopTimer();
        console.log("removing classes from classList")
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
    if (score >= 50) {
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


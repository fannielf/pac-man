import { stopMoving, startMoving, movePacmanSmoothly, isMoving } from './pac-man.js';
import { gameIsOver } from './gameState.js';
import { scareTimerId } from './scoring.js';

export let isPaused = false;
const targetFPS = 60;
export const frameTime = 800 / targetFPS;
    
export const endMenu = document.getElementById('end-menu');
const pauseMenu = document.getElementById('pause-menu');
const resumeButton = document.getElementById('resume-button');
const restartButton = document.getElementById('restart-button');
const playAgainButton = document.getElementById('play-again-button');

document.addEventListener('DOMContentLoaded', function() {

    startTimer()
    
//creating the event listeners
document.addEventListener('keyup', function(e) {
    if (e.key === ' ') {
        e.preventDefault(); // Prevent default action
        togglePause();
    } else if (e.key === 'r' && isPaused) {
        e.preventDefault();
        location.reload();
    } else if (e.key === 'Enter' && endMenu.classList.contains('hidden') === false) {
        e.preventDefault(); 
        location.reload();
    } else {
        if (!endMenu.classList.contains('hidden')) {
            // Game is over, do nothing (skip stopMoving)
            return;
        }
        stopMoving();    }
    });

    document.addEventListener('keydown', startMoving);

    resumeButton.addEventListener('click', function() {
        if (isPaused) {
            togglePause();
        }
    });
    restartButton.addEventListener('click', function() {
        location.reload();
    });

    playAgainButton.addEventListener('click', function() {
        location.reload();
    });

})

//pausing the game
export function togglePause() {
   if (gameIsOver) return;
    isPaused = !isPaused;
    if (isPaused) {
        stopTimer();
        pauseMenu.classList.remove('hidden');
        cancelAnimationFrame(scareTimerId); // Stop scare timer
    } else {
        pauseMenu.classList.add('hidden');
        if (isMoving) {
            requestAnimationFrame(movePacmanSmoothly);
        }
        if (ghosts.some(ghost => ghost.isScared)) {
            requestAnimationFrame(checkUnscare);
        }
    }
}

export let timer = 0;
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

export function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('timer').textContent = `Time: ${minutes}m ${seconds}s`;
    document.getElementById('final-time').textContent = `${minutes}m ${seconds}s`; 
}

export function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}
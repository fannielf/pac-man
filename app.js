import { stopMoving, startMoving } from './pac-man.js';
import { gameIsOver } from './gameState.js';
import { scareTimerId, checkUnscare, scareEndTime } from './scoring.js';
import { ghosts } from './ghosts.js';

const targetFPS = 60;
export const frameTime = 1000 / targetFPS;
    
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
        } else if (e.key === 'Enter' && gameIsOver) {
            e.preventDefault(); 
            location.reload();
        } else if (e.key === 'i') { 
                e.preventDefault();  
                toggleInfoMenu();
        } else {
            if (gameIsOver) {
                // Game is over, do nothing (skip stopMoving)
                return;
            }
            stopMoving(e);    
        }
    });

    document.addEventListener('keydown', startMoving);

    resumeButton.addEventListener('click', function() {
        togglePause();
    });

    restartButton.addEventListener('click', function() {
        location.reload();
    });

    playAgainButton.addEventListener('click', function() {
        location.reload();
    });

})

function toggleInfoMenu() {
    const infoMenu = document.getElementById('info-menu');
    
    if (!infoMenu.classList.contains('hidden')) {
        infoMenu.classList.add('hidden');
    } else {
        infoMenu.classList.remove('hidden');
    }
}

export let isPaused = false;
export let pauseDuration = 0;
export let newScareEnd = 0;
let pauseStartTime = 0;


//pausing the game
export function togglePause() {
   if (gameIsOver) return;
    isPaused = !isPaused;
    if (isPaused) {
        stopTimer();
        pauseMenu.classList.remove('hidden');
        cancelAnimationFrame(scareTimerId); // Stop scare timer
        pauseStartTime = performance.now();
    } else {
        pauseMenu.classList.add('hidden');
        startTimer();
        if (ghosts.some(ghost => ghost.isScared)) {
            pauseDuration = performance.now() - pauseStartTime;
            newScareEnd = scareEndTime + pauseDuration;
            // requestAnimationFrame(checkUnscare);
            checkUnscare()
        }
    }
}

export let timer = 0;
let timerInterval = 0;
let isTimerRunning = false;

export function startTimer() {
    if (isTimerRunning) return;

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
    //document.getElementById('final-time').textContent = `${minutes}m ${seconds}s`; 
}

export function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}
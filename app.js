import { stopMoving, startMoving, movePacmanSmoothly, isMoving } from './pac-man.js';

export let isPaused = false;
const targetFPS = 60;
export const frameTime = 1000 / targetFPS;
    
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

let timer = 0;
let timerInterval;
let isTimerRunning = false;

function startTimer() {
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

//pausing the game
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        stopTimer();
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
        if (isMoving) {
            requestAnimationFrame(movePacmanSmoothly);
        }
    }
}

// let lastTime = performance.now();
// let frameCount = 0;
// let fps = 0;

// const fpsDisplay = document.createElement("div");
// fpsDisplay.style.position = "fixed";
// fpsDisplay.style.top = "10px";
// fpsDisplay.style.left = "10px";
// fpsDisplay.style.backgroundColor = "black";
// fpsDisplay.style.color = "white";
// fpsDisplay.style.padding = "5px";
// fpsDisplay.style.fontSize = "14px";
// document.body.appendChild(fpsDisplay);

// function updateFPS() {
//     const now = performance.now();
//     frameCount++;

//     if (now - lastTime >= 1000) {
//         fps = frameCount;
//         frameCount = 0;
//         lastTime = now;
//         fpsDisplay.innerText = `FPS: ${fps}`;
//     }

//     requestAnimationFrame(updateFPS);
// }

// updateFPS();

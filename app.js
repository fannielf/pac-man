import { stopMoving, startMoving, movePacmanSmoothly, isMoving } from './pac-man.js';

export let isPaused = false;
    
export const endMenu = document.getElementById('end-menu');
const pauseMenu = document.getElementById('pause-menu');
const resumeButton = document.getElementById('resume-button');
const restartButton = document.getElementById('restart-button');
const playAgainButton = document.getElementById('play-again-button');

document.addEventListener('DOMContentLoaded', function() {

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
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
        if (isMoving) {
            requestAnimationFrame(movePacmanSmoothly);
        }
    }
}

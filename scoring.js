import { squares } from "./gameBoard.js";
import { pacmanCurrentIndex } from "./pac-man.js";
import { ghosts } from "./ghosts.js";
import { checkForWin } from "./gameState.js";
import { isPaused, pauseDuration } from "./app.js";

export let score = 0;
export let scareTimerId = null;
let scareEndTime = 0;
let points = 100;
const scoreDisplay = document.getElementById('score');

// what happens when pac-man eats a pac-dot
export function pacDotEaten() {
    if (squares[pacmanCurrentIndex].classList.contains('pac-dot')) {
        score++;
        scoreDisplay.innerHTML = score;
        squares[pacmanCurrentIndex].classList.remove('pac-dot');
        checkForWin
    }
}

// what happens when pac-man eats a power-pallet
export function powerPelletEaten() {
    if (squares[pacmanCurrentIndex].classList.contains('power-pellet')) {
        score += 10;
        scoreDisplay.innerHTML = score;
        ghosts.forEach(ghost => {
            if (!ghost.isScared) {

                ghost.isScared = true;             
            }
        });
        scareEndTime = performance.now() + 10000;
        console.log(typeof scareEndTime, scareEndTime)

        scareTimerId = requestAnimationFrame(checkUnscare);
        squares[pacmanCurrentIndex].classList.remove('power-pellet');
        checkForWin()
    }
}

export function checkUnscare(time) {
    if (isPaused) {
        scareTimerId = requestAnimationFrame(checkUnscare);
        return
    }
    if (time >= scareEndTime+pauseDuration) {
        cancelAnimationFrame(scareTimerId);
        unScareGhosts(); 
    } else {
        if ((scareEndTime+pauseDuration) - time <= 3000) {
            ghosts.forEach(ghost => {
                if (ghost.isScared) {
                squares[ghost.currentIndex].classList.add('blinking-ghost');
            }
            });
    }
    scareTimerId = requestAnimationFrame(checkUnscare);
    }
}

function unScareGhosts() {
    ghosts.forEach(ghost => {
        squares[ghost.currentIndex].classList.remove('scared-ghost', 'blinking-ghost');
        ghost.isScared = false;
    });

    points = 100;
}

export function scaredGhostEaten(ghost) {
    if (ghost.currentIndex === pacmanCurrentIndex  && ghost.isScared) {
        squares[ghost.currentIndex].classList.remove(ghost.className, 'scared-ghost', 'ghost', 'blinking-ghost');
            ghost.currentIndex = ghost.startIndex;
            ghost.isScared = false;
            ghost.wanderingTime = 0;
            ghost.timeElapsed = 0;
            ghost.exitDelay = 2;
            points = points * 2;
            score += points;
            scoreDisplay.innerHTML = score;
            squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            checkForWin()
        return true
    }
    return false;
}
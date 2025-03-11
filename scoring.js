import { squares } from "./gameBoard.js";
import { pacmanCurrentIndex } from "./pac-man.js";
import { ghosts } from "./ghosts.js";
import { checkForWin } from "./gameState.js";

export let score = 0;
let scareEndTime = 0; // Track when scare mode should end
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
        ghosts.forEach(ghost => ghost.isScared = true);
        scareEndTime = performance.now() + 10000;
        function checkUnscare(time) {
            if (time >= scareEndTime) {
                unScareGhosts();
            } else {
                requestAnimationFrame(checkUnscare);
            }
        }
        requestAnimationFrame(checkUnscare);
        squares[pacmanCurrentIndex].classList.remove('power-pellet');
        checkForWin()
    }
}

function unScareGhosts() {
    ghosts.forEach(ghost => ghost.isScared = false);
    points = 100;
}


export function scaredGhostEaten(ghost) {
    if (ghost.currentIndex === pacmanCurrentIndex  && ghost.isScared) {
        squares[ghost.currentIndex].classList.remove(ghost.className, 'scared-ghost', 'ghost');
            ghost.currentIndex = ghost.startIndex;
            ghost.isScared = false;
            ghost.wanderingTime = 0;
            ghost.exitDelay = 50;
            points = points * 2;
            score += points;
            scoreDisplay.innerHTML = score;
            squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            checkForWin()
        return true
    }
    return false;
}
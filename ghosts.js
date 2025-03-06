import { squares, width } from './gameBoard.js';
import { isPaused } from './app.js';
import { scaredGhostEaten } from './scoring.js';
import { checkForGameOver } from './gameState.js';

class Ghost {
    constructor(className, startIndex, speed, exitDelay) {
        this.className = className;
        this.startIndex = startIndex;
        this.speed = speed;
        this.currentIndex = startIndex;
        this.isScared = false;
        this.timerID = null;
        this.exitDelay = exitDelay;
        this.framesElapsed = 0;
        this.lastMoveTime = 0;
    }
}
export const ghosts =  [
    new Ghost ('blinky', 377, 250, 0),
    new Ghost ('pinky', 378, 400, 180),
    new Ghost ('inky', 405, 300, 300),
    new Ghost ('clyde', 406, 500, 420),

]
ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
});

ghosts.forEach(ghost => exitGhostLair(ghost))

function exitGhostLair(ghost) {

    function move(timestamp) {
        if (isPaused) {
            ghost.timerID = requestAnimationFrame(move);
            return;
        }
        if (ghost.framesElapsed < ghost.exitDelay) {
            ghost.framesElapsed++
        } else if (timestamp - ghost.lastMoveTime >= ghost.speed) {
            ghost.lastMoveTime = timestamp;
            
            if (
                !squares[ghost.currentIndex - width].classList.contains('ghost') &&
                !squares[ghost.currentIndex - width].classList.contains('wall')
            ){
                squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost');
                ghost.currentIndex -= width;
                squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            }
            if (!squares[ghost.currentIndex].classList.contains('ghost-lair')){
                moveGhost(ghost);
                return;
            } 
        }
        ghost.timerID = requestAnimationFrame(move);
    }
    ghost.timerID = requestAnimationFrame(move);
}

function checkGhostOnPacDot(ghost) {
    const ghostIndex = ghost.currentIndex;  

    if (squares[ghostIndex].classList.contains("pac-dot")) {
        squares[ghostIndex].classList.remove("pac-dot");

        
        setTimeout(() => {
            squares[ghostIndex].classList.add("pac-dot");
        }, 20);
    }

    if (squares[ghostIndex].classList.contains("power-pellet")) {
        squares[ghostIndex].classList.remove("power-pellet");

        setTimeout(() => {
            squares[ghostIndex].classList.add("power-pellet");
        }, 20); 
    }
}


function moveGhost(ghost) {

    const directions = [-1, width, 1, -width];
    let direction = directions[Math.floor(Math.random() * directions.length)];


    function move(timestamp) {
        if (isPaused) {
            ghost.timerID = requestAnimationFrame(move);
            return;
        }

        checkGhostOnPacDot(ghost);
        // Check if enough time has passed to move the ghost based on speed
        if (timestamp - ghost.lastMoveTime >= ghost.speed) {
            ghost.lastMoveTime = timestamp;
            if (scaredGhostEaten(ghost)) {
                exitGhostLair(ghost);
                return;
            }

            // can move if the next index is not a wall nor have another ghost in it, no returning to the ghost-lair
            if (
                !squares[ghost.currentIndex + direction].classList.contains('ghost') &&
                !squares[ghost.currentIndex + direction].classList.contains('wall') &&
                !squares[ghost.currentIndex + direction].classList.contains('ghost-lair')
            ) {
                squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost');
                ghost.currentIndex += direction;
                squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            } else {
                direction = directions[Math.floor(Math.random() * directions.length)];
            }

            if (ghost.isScared) {
                squares[ghost.currentIndex].classList.add('scared-ghost');
            }

            if (scaredGhostEaten(ghost)) {
                exitGhostLair(ghost);
                return;
            }
            checkForGameOver();
        }

        // Recursively call move function for the next frame
        ghost.timerID = requestAnimationFrame(move);
    }

    // Start the recursive animation
    ghost.timerID = requestAnimationFrame(move);
}
import { squares, width } from './gameBoard.js';
import { isPaused, frameTime } from './app.js';
import { scaredGhostEaten } from './scoring.js';
import { gameOver } from './gameState.js';

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
    new Ghost ('blinky', 377, 0.15, 0),
    new Ghost ('pinky', 378, 0.1, 180),
    new Ghost ('inky', 405, 0.08, 300),
    new Ghost ('clyde', 406, 0.08, 420),

]
ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
});

ghosts.forEach(ghost => moveGhost(ghost))

function checkGhostOnPacDot(ghost) {

    if (squares[ghost.currentIndex].classList.contains("pac-dot")) {
        squares[ghost.currentIndex].classList.remove("pac-dot");

        
        setTimeout(() => {
            squares[ghost.currentIndex].classList.add("pac-dot");
        }, 20);
    }

    if (squares[ghost.currentIndex].classList.contains("power-pellet")) {
        squares[ghost.currentIndex].classList.remove("power-pellet");

        setTimeout(() => {
            squares[ghost.currentIndex].classList.add("power-pellet");
        }, 20); 
    }
}


function moveGhost(ghost, timestamp) {
    // If paused, skip the move
    if (isPaused) {
        ghost.timerID = requestAnimationFrame(moveGhost.bind(null, ghost));
        return;
    }

    if (!ghost.lastMoveTime) ghost.lastMoveTime = timestamp;
    const deltaTime = timestamp - ghost.lastMoveTime;

    const moveStep = (deltaTime / frameTime) * ghost.speed;

    // If ghost is in the lair and not ready to exit, handle lair exit logic
    if (ghost.framesElapsed < ghost.exitDelay) {
        ghost.framesElapsed++;
    } else if (squares[ghost.currentIndex].classList.contains('ghost-lair')) {
        // Handle the ghost moving out of the lair
        if (moveStep >= 1) {
            ghost.lastMoveTime = timestamp;


            if (
                !squares[ghost.currentIndex - width].classList.contains('ghost') &&
                !squares[ghost.currentIndex - width].classList.contains('wall')
            ) {
                squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost');
                ghost.currentIndex -= width;
                squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            }
        }
    } else {
        // Handle normal movement outside the lair
        const directions = [-1, width, 1, -width];
        let direction = directions[Math.floor(Math.random() * directions.length)];

        if (moveStep >= 1) {
            ghost.lastMoveTime = timestamp;

            checkGhostOnPacDot(ghost);

            if (scaredGhostEaten(ghost)) {
                exitGhostLair(ghost);  // Transition to lair exit if eaten by Pac-Man
                return;
            }

            // Can move if the next index is not a wall nor have another ghost in it
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
        }
    }

    // Recursively call move function for the next frame
    ghost.timerID = requestAnimationFrame(moveGhost.bind(null, ghost));

}

// Call this function when ghosts start moving
ghosts.forEach(ghost => {
    ghost.timerID = requestAnimationFrame((timestamp) => moveGhost(ghost, timestamp));
});

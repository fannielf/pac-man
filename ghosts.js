import { squares, width } from './gameBoard.js';
import { isPaused, frameTime } from './app.js';
import { scaredGhostEaten } from './scoring.js';
import { gameOver } from './gameState.js';
import { pacmanCurrentIndex } from './pac-man.js';
import { loseLife } from './gameState.js';

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
        this.direction = null;
    }
}
export const ghosts =  [
    new Ghost ('blinky', 377, 0.1, 0),
    new Ghost ('pinky', 378, 0.05, 180),
    new Ghost ('inky', 405, 0.01, 300),
    new Ghost ('clyde', 406, 0.03, 420),

]

const directions = [-1, 1, width, -width]; // left, right, up, down

ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
});

// Simple function to get the valid neighboring squares
function getValidNeighbors(index) {
    const neighbors = [];
    directions.forEach(direction => {
        const nextIndex = index + direction;
        if (
            !squares[nextIndex].classList.contains('wall') &&
            !squares[nextIndex].classList.contains('ghost') &&
            !squares[nextIndex].classList.contains('ghost-lair')
        ) {
            neighbors.push(nextIndex);
        }
    });
    return neighbors;
}

function moveGhost(ghost, timestamp) {
    // If paused, skip the move
    if (isPaused) {
        ghost.timerID = requestAnimationFrame((ts) => moveGhost(ghost, ts));
        return;
    }

    if (!ghost.lastMoveTime) ghost.lastMoveTime = timestamp;
    const deltaTime = timestamp - ghost.lastMoveTime;
    const moveStep = (deltaTime / frameTime) * ghost.speed;

    // Check for ghost collision with Pac-Man
    if (pacmanCurrentIndex === ghost.currentIndex && !ghost.isScared) {
        // Pac-Man is caught by a ghost, so lose a life
        loseLife();
        return;
    }

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
                ghost.direction = null;
            }
        }
    } else {
        // Handle normal movement outside the lair
        const validNeighbors = getValidNeighbors(ghost.currentIndex);
        
        if (validNeighbors.length === 0) {
            // If no valid neighbors are available, pick a random direction to escape the jam
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        } else {
            // Scared ghost behavior: Move away from Pac-Man
            const distances = validNeighbors.map(nextIndex => {
                const dx = Math.abs(nextIndex % width - pacmanCurrentIndex % width);
                const dy = Math.abs(Math.floor(nextIndex / width) - Math.floor(pacmanCurrentIndex / width));
                return dx + dy;
            });
            if (ghost.isScared) {

                // Find the neighbor with the largest Manhattan distance (farthest from Pac-Man)
                const bestMove = validNeighbors[distances.indexOf(Math.max(...distances))];

                if (moveStep >= 1) {
                    ghost.lastMoveTime = timestamp;

                    if (scaredGhostEaten(ghost)) {
                        ghost.framesElapsed = 0;
                        ghost.exitDelay = 0;
                        return;
                    }

                    // Can move if the next index is not a wall nor have another ghost in it
                    if (
                        !squares[bestMove].classList.contains('ghost') &&
                        !squares[bestMove].classList.contains('wall') &&
                        !squares[bestMove].classList.contains('ghost-lair')
                    ) {
                        squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost');
                        ghost.currentIndex = bestMove; // Update to bestMove directly
                        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
                    } else {
                        // If it's a wall or another ghost, pick a new direction
                        ghost.direction = directions[Math.floor(Math.random() * directions.length)];
                    }

                    squares[ghost.currentIndex].classList.add('scared-ghost');
                }
            } else {

                // Find the neighbor with the smallest Manhattan distance (closest to Pac-Man)
                const bestMove = validNeighbors[distances.indexOf(Math.min(...distances))];

                if (moveStep >= 1) {
                    ghost.lastMoveTime = timestamp;

                    // Can move if the next index is not a wall nor have another ghost in it
                    if (
                        !squares[bestMove].classList.contains('ghost') &&
                        !squares[bestMove].classList.contains('wall') &&
                        !squares[bestMove].classList.contains('ghost-lair')
                    ) {
                        squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost');
                        ghost.currentIndex = bestMove; // Update to bestMove directly
                        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
                    } else {
                        // If it's a wall or another ghost, pick a new direction
                        ghost.direction = directions[Math.floor(Math.random() * directions.length)];
                    }
                }
                if (gameOver()) return;
            }
        }
    }

    // Recursively call move function for the next frame
    ghost.timerID = requestAnimationFrame((ts) => moveGhost(ghost, ts));
}

// Call this function when ghosts start moving
ghosts.forEach(ghost => {
    ghost.timerID = requestAnimationFrame((timestamp) => moveGhost(ghost, timestamp));
});

export function resetGhosts() {
    ghosts.forEach(ghost => {
        squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost');  
        ghost.currentIndex = ghost.startIndex;
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
        ghost.isScared = false;
        ghost.framesElapsed = 0;
        ghost.lastMoveTime = 0;
        ghost.direction = null; 
    });
    ghosts.forEach(ghost => {
        ghost.timerID = requestAnimationFrame((timestamp) => moveGhost(ghost, timestamp));  
    });
}

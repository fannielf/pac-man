import { squares, width } from './gameBoard.js';
import { isPaused, frameTime } from './app.js';
import { scaredGhostEaten } from './scoring.js';
import { pacmanCurrentIndex } from './pac-man.js';
import { loseLife, gameIsOver } from './gameState.js';

class Ghost {
    constructor(className, startIndex, speed, exitDelay) {
        this.className = className;
        this.startIndex = startIndex;
        this.currentIndex = startIndex;
        this.lastDirection = null;
        this.speed = speed;
        this.isScared = false;
        this.timerID = null;
        this.exitDelay = exitDelay;
        this.timeElapsed = 0;
        this.lastMoveTime = 0;
        this.wanderingTime = 0;
    }
}

export const ghosts = [
    new Ghost('blinky', 377, 0.08, 1), 
    new Ghost('pinky', 378, 0.07, 2.5),
    new Ghost('inky', 405, 0.06, 3),
    new Ghost('clyde', 406, 0.05, 3.5),
];

const directions = [-1, 1, width, -width]; // left, right, up, down

// Initialize all ghosts and begin with escaping the ghost-lair
ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
    escapeLair(ghost); 
});

// Simple function to get the valid neighboring tiles
function getValidNeighbors(index) {
    const neighbors = [];
    directions.forEach(direction => {
        const nextIndex = index + direction;
        if (
            !squares[nextIndex].classList.contains('wall') &&
            !squares[nextIndex].classList.contains('ghost') &&
            !squares[nextIndex].classList.contains('ghost-lair')
        ) {
            neighbors.push({ index: nextIndex, direction });  // Store both index and direction
        }
    });

    if (index === 364) {
        if (!squares[391].classList.contains('ghost')) {
            neighbors.push({ index: 391, direction: 1 });
        }
    }

    if (index === 391) {
        if (!squares[364].classList.contains('ghost')) {
            neighbors.push({ index: 364, direction: -1 });
        }
    }
    return neighbors;
}

function escapeLair(ghost) {

    function move(timestamp) {
        if (gameIsOver) return

        if (isPaused) { // if paused, skip the move
            ghost.timerID = requestAnimationFrame(move);
            return;
        }

        if (!ghost.lastMoveTime) ghost.lastMoveTime = timestamp;
        const deltaTime = timestamp - ghost.lastMoveTime;
        const moveStep = (deltaTime * ghost.speed) / frameTime ;

        if (ghost.timeElapsed < ghost.exitDelay) {
            ghost.timeElapsed += deltaTime/1000;
            ghost.lastMoveTime = timestamp;

        } else  if (squares[ghost.currentIndex].classList.contains('ghost-lair')){
            if (moveStep >= 1) {
                ghost.lastMoveTime = timestamp;
            
                // Ensure the ghost isn't blocked by another ghost or a wall
                if (
                    !squares[ghost.currentIndex - width].classList.contains('ghost') &&
                    !squares[ghost.currentIndex - width].classList.contains('wall')
                ) {
                    squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost');
                    ghost.currentIndex -= width; // Move ghost out of lair
                    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
                }
            }
        } else {
            moveGhost(ghost);
            return;
        }
        // Recursively call move function for the next frame
        ghost.timerID = requestAnimationFrame(move);
    }
    ghost.timerID = requestAnimationFrame(move);
}

function moveGhost(ghost) {

    function move(timestamp) {
        if (gameIsOver) return;

        if (isPaused) {
            ghost.timerID = requestAnimationFrame(move);
            return;
        }
        
        if (!ghost.lastMoveTime) ghost.lastMoveTime = timestamp;
        const deltaTime = timestamp - ghost.lastMoveTime;
        const moveStep = (deltaTime / frameTime) * ghost.speed;
        
        
        // Check for ghost collision with Pac-Man
        if (pacmanCurrentIndex === ghost.currentIndex && !ghost.isScared) {
            loseLife();
            return;
        }
        
        if (scaredGhostEaten(ghost)) {
            escapeLair(ghost);
            return;
        }
        
        if (moveStep >= 1) {
            const bestMove = ghostAI(ghost, deltaTime);
            ghost.lastMoveTime = timestamp;

            if (bestMove && bestMove.index !== undefined && bestMove.direction !== undefined) {
            // Can move if the next index is not a wall nor have another ghost in it
            if (
                ghost.currentIndex !== bestMove.index
            ) {
                squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost', 'blinking-ghost');
                ghost.currentIndex = bestMove.index; // Update to bestMove directly
                ghost.lastDirection = bestMove.direction;
                squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            } else {
                ghost.lastDirection = null; // Reset last direction if the ghost is not moving
            }

            if (ghost.isScared) squares[ghost.currentIndex].classList.add('scared-ghost');
            }
        }

        ghost.timerID = requestAnimationFrame(move);
    }
    ghost.timerID = requestAnimationFrame(move);
}

// Ghost AI that switches between different movement patterns
function ghostAI(ghost, deltaTime) {
    // Increase wandering time in seconds
    ghost.wanderingTime += deltaTime/1000;

    const validNeighbors = getValidNeighbors(ghost.currentIndex);

    if (validNeighbors.length === 0) {
        return { index: ghost.currentIndex, direction: null };

    } else if (ghost.isScared) {
        return escapePacman(ghost, validNeighbors);

    } else if (ghost.wanderingTime <= 3) { 
        return randomMove(ghost.lastDirection, validNeighbors);

    } else {
        return bfsMove(ghost.currentIndex, pacmanCurrentIndex);
    }
}

// when scared, ghosts trying to get as far from pac-man as possible
function escapePacman(ghost, validMoves) {
    // Remove Pac-Man's position from valid moves
    validMoves = validMoves.filter(move => move.index !== pacmanCurrentIndex);

    // If no other moves than moving to pac-man, stay in place
    if (validMoves.length === 0) {
        return { index: ghost.currentIndex, direction: null };
    }

    // Function to calculate Manhattan distance from Pac-Man
    function getDistance(index) {
        const ghostX = index % width;
        const ghostY = Math.floor(index / width);
        const pacmanX = pacmanCurrentIndex % width;
        const pacmanY = Math.floor(pacmanCurrentIndex / width);
        return Math.abs(ghostX - pacmanX) + Math.abs(ghostY - pacmanY);
    }

    // Track last direction to avoid moving in the opposite direction
    let bestMove = null;
    let maxDistance = -Infinity;

    for (let move of validMoves) {
        const distance = getDistance(move.index);

        // Check if the move brings the ghost farther from Pac-Man
        // Additionally, penalize moves that go directly back to the last position
        const isNotGoingBack = (move.direction !== -ghost.lastDirection);

        // Increase the weight of the move if it increases distance and doesn't go back
        if (distance > maxDistance && isNotGoingBack) {
            bestMove = move;
            maxDistance = distance;
        }
    }

    // Find the move that maximizes distance from Pac-Man
    if (!bestMove) {
        bestMove = validMoves.reduce((bestMove, move) => {
            return getDistance(move.index) > getDistance(bestMove.index) ? move : bestMove;
        });
    }

    return bestMove;
}

// Random wandering around the game board
function randomMove(ghostDirection, validNeighbors) {
    if (Object.keys(validNeighbors).length > 1) { // if there are more than one option, remove the opposite direction
        const oppositeDirection = -ghostDirection;
        validNeighbors = validNeighbors.filter(move => move.direction !== oppositeDirection);
    }
    
    const randomMove = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
    return randomMove;
}

// Breath-First-Search algorithm to find the shortest path to Pac-Man
function bfsMove(startIndex, goalIndex) {

    let frontier = [{ index: startIndex, path: [startIndex], direction: null }];
    let explored = new Set();

    while (frontier.length > 0) {
        let currentNode = frontier.shift();

        // If we reached Pac-Man, return the next move in the path
        if (currentNode.index === goalIndex) {
            // Return the next move in the path (or stay if no next move)
            const nextIndex = currentNode.path[1] || currentNode.index;
            const direction = currentNode.path.length > 1
                ? currentNode.path[1] - currentNode.path[0] // Calculate direction based on the current location and next move
                : null;
            return { index: nextIndex, direction: direction };
        }

        explored.add(currentNode.index);
        let neighbors = getValidNeighbors(currentNode.index);

        // Explore the neighbors and add them to the frontier
        for (let neighbor of neighbors) {
            if (explored.has(neighbor.index)) continue;

            let newPath = [...currentNode.path, neighbor.index];
            frontier.push({
                index: neighbor.index,
                path: newPath,
                direction: neighbor.direction // Keep track of the direction
            });
        }
    }
    return { index: startIndex, direction: null };
}

export function resetGhosts() {
    ghosts.forEach(ghost => {
        cancelAnimationFrame(ghost.timerID);
        squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost', 'blinking-ghost');  
        ghost.currentIndex = ghost.startIndex;
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
        ghost.isScared = false;
        ghost.timeElapsed = 0;
        ghost.lastMoveTime = 0;
        ghost.lastDirection = null; 
        ghost.wanderingTime = 0;
        ghost.exitDelay = 2;
        ghost.speed += 0.01
        escapeLair(ghost);
    });
}

import { squares, width } from './gameBoard.js';
import { isPaused, frameTime } from './app.js';
import { scaredGhostEaten } from './scoring.js';
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
        this.wanderingTime = 0;
        this.lastDirection = null;
    }
}

export const ghosts = [
    new Ghost('blinky', 377, 0.1, 0),
    new Ghost('pinky', 378, 0.08, 180),
    new Ghost('inky', 405, 0.07, 300),
    new Ghost('clyde', 406, 0.06, 420),
];

const directions = [-1, 1, width, -width]; // left, right, up, down

// Initialize all ghosts at the start of the game
ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
    escapeLair(ghost); 
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
            neighbors.push({ index: nextIndex, direction });  // Store both index and direction
        }
    });
    return neighbors;
}

export function moveGhost(ghost) {
    function move(timestamp) {
        // If paused, skip the move
        if (isPaused) {
            ghost.timerID = requestAnimationFrame(move);
            return;
        }
        
        if (!ghost.lastMoveTime) ghost.lastMoveTime = timestamp;
        const deltaTime = timestamp - ghost.lastMoveTime;
        const moveStep = (deltaTime / frameTime) * ghost.speed;
    

    // Check for ghost collision with Pac-Man
    if (pacmanCurrentIndex === ghost.currentIndex && !ghost.isScared) {
        // Pac-Man is caught by a ghost, so lose a life
        loseLife();
        ghosts.forEach(ghost => {
            escapeLair(ghost); 
        });
        return; 
    }

        if (scaredGhostEaten(ghost)) {
            escapeLair(ghost);
            return; // Skip current movement logic, restart from the beginning
        }

        const bestMove = ghostAI(ghost);

        if (moveStep >= 1) {
            ghost.lastMoveTime = timestamp;


            // Can move if the next index is not a wall nor have another ghost in it
            if (
                ghost.currentIndex !== bestMove.index
            ) {
                squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost');
                ghost.currentIndex = bestMove.index; // Update to bestMove directly
                ghost.lastDirection = bestMove.direction;
                squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            } else {
                ghost.lastDirection = null; // Reset last direction if no valid move is found
            }

            if (ghost.isScared) squares[ghost.currentIndex].classList.add('scared-ghost');
        }

        // Recursively call move function for the next frame
        ghost.timerID = requestAnimationFrame(move);
    }
    ghost.timerID = requestAnimationFrame(move);
}

function escapeLair(ghost) {

    function move(timestamp) {

        if (isPaused) {
            ghost.timerID = requestAnimationFrame(move);
            return;
        }

        if (!ghost.lastMoveTime) ghost.lastMoveTime = timestamp;
        const deltaTime = timestamp - ghost.lastMoveTime;
        const moveStep = (deltaTime / frameTime) * ghost.speed;

        if (ghost.framesElapsed < ghost.exitDelay) {
            ghost.framesElapsed++;
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


// Ghost AI that switches between different movement patterns
function ghostAI(ghost) {
    // Increase wandering time
    ghost.wanderingTime++;

    const validNeighbors = getValidNeighbors(ghost.currentIndex);

    if (validNeighbors.length === 0) {
        return { index: ghost.currentIndex, direction: null };
    } else if (ghost.isScared) {
        return escapePacman(ghost, validNeighbors);
    } else if (ghost.wanderingTime < 150) {  // Wandering 2sec with the rate of 60FPS
        return randomMove(ghost, validNeighbors);
    } else if (ghost.className === 'inky' || ghost.className === 'clyde') {
        return dfsMove(ghost, pacmanCurrentIndex);
    } else {
        return bfsMove(ghost, pacmanCurrentIndex);
    }
}

// Random wandering in the beginning
function randomMove(ghost, validNeighbors) {
    if (Object.keys(validNeighbors).length > 1) {
        const oppositeDirection = -ghost.lastDirection;
        validNeighbors = validNeighbors.filter(move => move.direction !== oppositeDirection);
    }
    
    const randomMove = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
    return { index: randomMove.index, direction: randomMove.direction };
}

// Depth-First-Search algorithm to pathfinding towards Pac-Man
function dfsMove(ghost, goalIndex) {
    const startIndex = ghost.currentIndex;
    let stack = [{ index: startIndex, path: [startIndex], direction: null }];
    let explored = new Set();

    while (stack.length > 0) {
        let currentNode = stack.pop();
        if (explored.has(currentNode.index)) continue;
        explored.add(currentNode.index);

        // If we've reached the goal, return the next move in the path
        if (currentNode.index === goalIndex) {
            return { index: currentNode.path[1] || currentNode.index, direction: currentNode.path[1] - currentNode.path[0] };
        }

        // Add neighbors to the stack
        let neighbors = getValidNeighbors(currentNode.index, currentNode.direction);
        for (let neighbor of neighbors) {
            if (!explored.has(neighbor.index)) {
                let newPath = [...currentNode.path, neighbor.index];
                stack.push({ index: neighbor.index, path: newPath, direction: neighbor.direction });
            }
        }
    }

    return { index: startIndex, direction: null };
}

// Breath-First-Search algorithm to find the shortest path to Pac-Man
function bfsMove(ghost, goalIndex) {
    const startIndex = ghost.currentIndex;
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
        let neighbors = getValidNeighbors(currentNode.index, currentNode.direction);

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

function escapePacman(ghost, validMoves) {
    // Remove Pac-Man's position from valid moves
    validMoves = validMoves.filter(move => move.index !== pacmanCurrentIndex);

    // If no valid moves, stay in place
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

    // Find the move that maximizes distance from Pac-Man
    let escapeMove = validMoves.reduce((bestMove, move) => {
        return getDistance(move.index) > getDistance(bestMove.index) ? move : bestMove;
    });

    return escapeMove;
}


export function resetGhosts() {
    console.log("resetGhosts() called!");
    ghosts.forEach(ghost => { 
        cancelAnimationFrame(ghost.timerID);
        squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost');  
        ghost.currentIndex = ghost.startIndex;
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
        ghost.isScared = false;
        ghost.framesElapsed = 0;
        ghost.lastMoveTime = 0;
        ghost.lastDirection = null; 
        ghost.wanderingTime = 100;
    });
    ghosts.forEach(ghost => {
        ghost.timerID = requestAnimationFrame((timestamp) => moveGhost(ghost, timestamp));  
    });
}
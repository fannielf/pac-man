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
        this.framesElapsed = 0;
        this.lastMoveTime = 0;
        this.wanderingTime = 0;
    }
}

export const ghosts = [
    new Ghost('blinky', 377, 0.1, 0),
    new Ghost('pinky', 378, 0.08, 150),
    new Ghost('inky', 405, 0.07, 180),
    new Ghost('clyde', 406, 0.06, 200),
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

    if (index === 364) {
        if (!squares[391].classList.contains('ghost')) {
            neighbors.push({ index: 391, direction: 1 });
        }
    }

    if (index === 391) {
        // Only allow movement to 363 if no other ghost is already in 363
        if (!squares[364].classList.contains('ghost')) {
            neighbors.push({ index: 364, direction: -1 });
        }
    }
    return neighbors;
}

function inTunnel(index) {
    return (index <= 363 && index >= 358) || (index <= 391 && index >= 386);
}

function escapeLair(ghost) {


    function move(timestamp) {
        if (gameIsOver) return

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

function moveGhost(ghost) {

    function move(timestamp) {
        if (gameIsOver) {
            return;
        }
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

// Ghost AI that switches between different movement patterns
function ghostAI(ghost) {
    // Increase wandering time
    ghost.wanderingTime++;

    const validNeighbors = getValidNeighbors(ghost.currentIndex);
    if (validNeighbors.length > 1 && inTunnel(pacmanCurrentIndex) && inTunnel(ghost.currentIndex)) {
        validNeighbors = validNeighbors.filter(neighbor => (neighbor.index === 364 || neighbor.index === 391));
    }

    if (validNeighbors.length === 0) {
        return { index: ghost.currentIndex, direction: null };
    } else if (ghost.isScared) {
        return escapePacman(ghost, validNeighbors);
    } else if (ghost.wanderingTime < 150) {  // Wandering 2sec with the rate of 60FPS
        return randomMove(ghost.lastDirection, validNeighbors);
    } else if (ghost.className === 'inky' || ghost.className === 'clyde') {
        return dfsMove(ghost.currentIndex, pacmanCurrentIndex);
    } else {
        return bfsMove(ghost.currentIndex, pacmanCurrentIndex);
    }
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

// Random wandering in the beginning
function randomMove(ghostDirection, validNeighbors) {
    if (Object.keys(validNeighbors).length > 1) {
        const oppositeDirection = -ghostDirection;
        validNeighbors = validNeighbors.filter(move => move.direction !== oppositeDirection);
    }
    
    const randomMove = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
    return { index: randomMove.index, direction: randomMove.direction };
}

// Depth-First-Search algorithm to pathfinding towards Pac-Man
function dfsMove(startIndex, goalIndex) {
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

export function resetGhosts() {
    ghosts.forEach(ghost => {
        cancelAnimationFrame(ghost.timerID);
        squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost');  
        ghost.currentIndex = ghost.startIndex;
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
        ghost.isScared = false;
        ghost.framesElapsed = 0;
        ghost.lastMoveTime = 0;
        ghost.lastDirection = null; 
        ghost.wanderingTime = 150;
        escapeLair(ghost);
    });
}
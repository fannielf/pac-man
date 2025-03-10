import { squares, width } from './gameBoard.js';
import { isPaused, frameTime } from './app.js';
import { scaredGhostEaten } from './scoring.js';
import { gameOver } from './gameState.js';
import { pacmanCurrentIndex } from './pac-man.js';

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
    new Ghost('pinky', 378, 0.05, 180),
    new Ghost('inky', 405, 0.03, 300),
    new Ghost('clyde', 406, 0.04, 420),
];

const directions = [-1, 1, width, -width]; // left, right, up, down

// Initialize all ghosts at the start of the game
ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
    escapeLair(ghost); 
});

// Simple function to get the valid neighboring squares
function getValidNeighbors(index, lastDirection) {
    const neighbors = [];
    directions.forEach(direction => {
        const nextIndex = index + direction;
        if (
            !squares[nextIndex].classList.contains('wall') &&
            !squares[nextIndex].classList.contains('ghost') &&
            !squares[nextIndex].classList.contains('ghost-lair') &&
            (direction !== -lastDirection)  // Avoid reversing direction
        ) {
            neighbors.push({ index: nextIndex, direction });  // Store both index and direction
        }
    });
    return neighbors;
}

function moveGhost(ghost) {
    function move(timestamp) {
        // If paused, skip the move
        if (isPaused) {
            ghost.timerID = requestAnimationFrame(move);
            return;
        }

        if (!ghost.lastMoveTime) ghost.lastMoveTime = timestamp;
        const deltaTime = timestamp - ghost.lastMoveTime;
        const moveStep = (deltaTime / frameTime) * ghost.speed;

        if (scaredGhostEaten(ghost)) {
            escapeLair(ghost);
            return; // Skip current movement logic, restart from the beginning
        }

        const bestMove = ghostAI(ghost);

        if (moveStep >= 1) {
            ghost.lastMoveTime = timestamp;


            // Can move if the next index is not a wall nor have another ghost in it
            if (
                !squares[bestMove.index].classList.contains('ghost') &&
                !squares[bestMove.index].classList.contains('wall') &&
                !squares[bestMove.index].classList.contains('ghost-lair') &&
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

        if (gameOver()) return;
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


// Ghost AI that switches between DFS and BFS
function ghostAI(ghost) {
    // Increase wandering time (DFS) for a while before switching to BFS
    ghost.wanderingTime++;

    const validNeighbors = getValidNeighbors(ghost.currentIndex, ghost.lastDirection);

    if (validNeighbors.length === 0) {
        return { index: ghost.currentIndex, direction: null };
    } else if (ghost.wanderingTime < 300) {  // First 300 frames (adjust as needed)
        return randomMove(validNeighbors);  // Random wandering (DFS)
    } else if (ghost.isScared) {
        return escapePacman(ghost, validNeighbors);
    } else if (ghost.className === 'inky' || ghost.className === 'clyde') {
        return dfsMove(ghost, pacmanCurrentIndex);
    } else {
        return bfsMove(ghost, pacmanCurrentIndex);  // Chase Pac-Man (BFS)
    }
}

// Random wandering in the beginning
function randomMove(validNeighbors) {
    
    const randomMove = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
    return { index: randomMove.index, direction: randomMove.direction };
}

// DFS: Pathfinding towards Pac-Man
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

    // No valid path found, stay in place
    return { index: startIndex, direction: null };
}

// BFS: Shortest path to target (Pac-Man)
function bfsMove(ghost, goalIndex) {
    const startIndex = ghost.currentIndex;
    let frontier = [{ index: startIndex, path: [startIndex], direction: null }];
    let explored = new Set();

    while (frontier.length > 0) {
        let currentNode = frontier.shift();

        // If we reached the goal (Pac-Man), return the next move in the path
        if (currentNode.index === goalIndex) {
            // Return the next move in the path (or stay if no next move)
            const nextIndex = currentNode.path[1] || currentNode.index;
            const direction = currentNode.path.length > 1
                ? currentNode.path[1] - currentNode.path[0] // Calculate direction based on the next move
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

    // If no valid path found, stay in place
    return { index: startIndex, direction: null };
}

function escapePacman(ghost, validMoves) {
    // Calculate opposite direction
    const oppositeDirection = -ghost.lastDirection;

    // Remove Pac-Man's position from valid moves
    validMoves = validMoves.filter(move => move.index !== pacmanCurrentIndex);

    // Try the opposite direction first
    let escapeMove = validMoves.find(move => move.direction === oppositeDirection);

    // If opposite direction is not possible, pick a random valid move
    if (!escapeMove && validMoves.length > 0) {
        escapeMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Return the move (or stay in place if no move is found)
    return escapeMove || { index: ghost.currentIndex, direction: null };
}

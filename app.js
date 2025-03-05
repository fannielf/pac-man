import { squares, createBoard } from './gameBoard.js';

document.addEventListener('DOMContentLoaded', function() {
    const scoreDisplay = document.getElementById('score');
    const width = 28;
    let score = 0;
    let points = 100;


createBoard();

// Create and move Pac-man

let pacmanCurrentIndex = 490;
squares[pacmanCurrentIndex].classList.add('pac-man');

function movePacman(e) {
    squares[pacmanCurrentIndex].classList.remove('pac-man');
    switch (e.key) {
        case 'ArrowLeft' : 
            if (squares[pacmanCurrentIndex-1] === squares[363]) {
                pacmanCurrentIndex = 391
            } else if (
                pacmanCurrentIndex % width !== 0 &&
                !squares[pacmanCurrentIndex-1].classList.contains('wall') &&
                !squares[pacmanCurrentIndex-1].classList.contains('ghost-lair')
            ) {
                pacmanCurrentIndex -=1;
            }
            break;
        case 'ArrowRight' :
            if (squares[pacmanCurrentIndex+1] === squares[392]) {
                pacmanCurrentIndex = 364
            } else if (
                pacmanCurrentIndex % width < width -1 &&
                !squares[pacmanCurrentIndex+1].classList.contains('wall') &&
                !squares[pacmanCurrentIndex+1].classList.contains('ghost-lair')
            ) {
                pacmanCurrentIndex +=1;
            }
            break;
        case 'ArrowUp' : 
            if (
                pacmanCurrentIndex - width >= width &&
                !squares[pacmanCurrentIndex-width].classList.contains('wall') &&
                !squares[pacmanCurrentIndex-width].classList.contains('ghost-lair')
            ) {
                pacmanCurrentIndex -=width;
            }
            break;
        case 'ArrowDown' :
            if (
                pacmanCurrentIndex + width < width * width &&
                !squares[pacmanCurrentIndex+width].classList.contains('wall') &&
                !squares[pacmanCurrentIndex+width].classList.contains('ghost-lair')
            ) {
                pacmanCurrentIndex +=width;
            }
            break;
    }
    squares[pacmanCurrentIndex].classList.add('pac-man');
    
    checkForScaredGhost(pacmanCurrentIndex)
    pacDotEaten()
    powerPelletEaten()
    checkForWin()
}

//moving the pac-man with arrow keys
let isMoving = false;
let currentDirection = null;
let lastMoveTime = 0;
const moveDelay = 150;


function movePacmanSmoothly(timestamp) {
    if (!isMoving) return; 

    if (timestamp - lastMoveTime >= moveDelay) {
    movePacman({ key: currentDirection }); 
    lastMoveTime = timestamp;
}
requestAnimationFrame(movePacmanSmoothly); 
}

function startMoving(e) {
    if (isMoving) return; 

    currentDirection = e.key; 
    isMoving = true;
    requestAnimationFrame(movePacmanSmoothly); 
}

function stopMoving() {
    isMoving = false; 
}


document.addEventListener('keydown', startMoving);
document.addEventListener('keyup', stopMoving);

// what happens when pac-man eats a pac-dot
function pacDotEaten() {
    if (squares[pacmanCurrentIndex].classList.contains('pac-dot')) {
        score++;
        scoreDisplay.innerHTML = score;
        squares[pacmanCurrentIndex].classList.remove('pac-dot');
    }
}

// what happens when pac-man eats a power-pallet
function powerPelletEaten() {
    if (squares[pacmanCurrentIndex].classList.contains('power-pellet')) {
        score += 10;
        scoreDisplay.innerHTML = score;
        ghosts.forEach(ghost => ghost.isScared = true);
        let scareDuration = 10000; //10 seconds
        let startTime = performance.now();
        function checkUnscare(time) {
            if (time - startTime >= scareDuration) {
                unScareGhosts();
            } else {
                requestAnimationFrame(checkUnscare);
            }
        }
        requestAnimationFrame(checkUnscare);
        squares[pacmanCurrentIndex].classList.remove('power-pellet');
    }
}

function unScareGhosts() {
    ghosts.forEach(ghost => ghost.isScared = false);
    points = 100;
}

// Create and move ghosts

class Ghost {
    constructor(className, startIndex, speed) {
        this.className = className;
        this. startIndex = startIndex;
        this.speed = speed;
        this.currentIndex = startIndex;
        this.isScared = false;
        this.timerID = NaN;
    }
}
const ghosts =  [
    new Ghost ('blinky', 348, 250),
    new Ghost ('pinky', 376, 400),
    new Ghost ('inky', 351, 300),
    new Ghost ('clyde', 379, 500),

]

ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
});

ghosts.forEach(ghost => moveGhost(ghost))

function moveGhost(ghost) {
    const directions = [-1, 1, width, -width];
    let direction = directions[Math.floor(Math.random() * directions.length)];
    let lastMoveTime = 0;

    function move(timestamp) {
        // Check if enough time has passed to move the ghost based on speed
        if (timestamp - lastMoveTime >= ghost.speed) {
            lastMoveTime = timestamp;

            // can move if the next index is not a wall nor have another ghost in it
            if (
                direction &&
                !squares[ghost.currentIndex + direction].classList.contains('ghost') &&
                !squares[ghost.currentIndex + direction].classList.contains('wall')
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

            checkForScaredGhost(ghost.currentIndex);
            checkForGameOver();
        }

        // Recursively call move function for the next frame
        requestAnimationFrame(move);
    }

    // Start the recursive animation
    requestAnimationFrame(move);
}

function checkForScaredGhost(index) {
    ghosts.forEach(ghost => {
        if (ghost.currentIndex === index && pacmanCurrentIndex === index && ghost.isScared) {
            squares[ghost.currentIndex].classList.remove(ghost.className, 'scared-ghost', 'ghost');
                ghost.currentIndex = ghost.startIndex;
                points = points * 2;
                score += points;
                scoreDisplay.innerHTML = score;
                squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
        }
    })
}

function checkForGameOver() {
    if (
        squares[pacmanCurrentIndex].classList.contains('ghost') &&
        !squares[pacmanCurrentIndex].classList.contains('scared-ghost')
    ) {
        ghosts.forEach(ghost => clearInterval(ghost.timerID))
        document.removeEventListener('keyup', stopMoving)
        document.removeEventListener('keydown', startMoving)
        setTimeout(function() {
            alert('Game Over')
        }, 500)
    }
}

function checkForWin() {
    if (score >= 300) {
        ghosts.forEach(ghost => clearInterval(ghost.timerID))
        document.removeEventListener('keyup', stopMoving)
        document.removeEventListener('keydown', startMoving)
        setTimeout(function() {
            alert('You have WON!!')
        }, 500)
    }
}


})
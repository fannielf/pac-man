document.addEventListener('DOMContentLoaded', function() {
    const scoreDisplay = document.getElementById('score');
    const width = 28;
    let score = 0;
    let points = 100;
    const grid = document.querySelector('.grid');
    const pauseMenu = document.getElementById('pause-menu');
    const resumeButton = document.getElementById('resume-button');
    const restartButton = document.getElementById('restart-button');
    const endMenu = document.getElementById('end-menu');
    const endMessage = document.getElementById('end-message');
    const finalScore = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again-button');
    let isPaused = false;

    const layout = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 3, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 2, 2, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 1,
        1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
        1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ]
    
const squares = [];

function createBoard() {
    for (let i = 0; i < layout.length; i++) {
        const square = document.createElement('div');
        grid.appendChild(square);
        squares.push(square);

        //add layout to the board
        if (layout[i] === 0) {
            squares[i].classList.add('pac-dot');
        } else if (layout[i] === 1) {
        squares[i].classList.add('wall');
        } else if (layout[i] === 2) {
        squares[i].classList.add('ghost-lair');
        } else if (layout[i] === 3) {
             squares[i].classList.add('power-pellet');
        }
    }
}

createBoard();

// Create and move Pac-man

let pacmanCurrentIndex = 490;
squares[pacmanCurrentIndex].classList.add('pac-man');

function movePacman(e) {
    if (isPaused) return;
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
    if (!isMoving || isPaused) return; 

    if (timestamp - lastMoveTime >= moveDelay) {
    movePacman({ key: currentDirection }); 
    lastMoveTime = timestamp;
}
requestAnimationFrame(movePacmanSmoothly); 
}

function startMoving(e) {
    if (isMoving || isPaused) return; 

    currentDirection = e.key; 
    isMoving = true;
    requestAnimationFrame(movePacmanSmoothly); 
}

function stopMoving() {
    isMoving = false; 
}


// document.addEventListener('keydown', startMoving);
// document.addEventListener('keyup', stopMoving);

//pausing the game
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
        if (isMoving) {
            requestAnimationFrame(movePacmanSmoothly);
        }
    }
}

function restartGame() {
    // Reset game state
    score = 0;
    scoreDisplay.innerHTML = score;
    isPaused = false;
    pauseMenu.classList.add('hidden');
    endMenu.classList.add('hidden');

    squares.forEach(square => {
        square.classList.remove('pac-man', 'ghost', 'scared-ghost');
    });

    createBoard();
    
    pacmanCurrentIndex = 490;
    squares[pacmanCurrentIndex].classList.add('pac-man');

    ghosts.forEach(ghost => {
        squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost');
        ghost.currentIndex = ghost.startIndex;
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
    });

    if (isMoving) {
        requestAnimationFrame(movePacmanSmoothly);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === ' ') {
        togglePause();
    } else if (e.key === 'r' && isPaused) {
        restartGame();
    } else {
        startMoving(e);
    }
});

document.addEventListener('keyup', stopMoving);

resumeButton.addEventListener('click', function() {
    if (isPaused) {
        togglePause();
    }
});
restartButton.addEventListener('click', restartGame);
playAgainButton.addEventListener('click', restartGame);

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
        if (isPaused) {
            requestAnimationFrame(move);
            return;
        }
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

            if (ghost.isScared && squares[ghost.currentIndex].classList.contains('pac-man')) {
                squares[ghost.currentIndex].classList.remove(ghost.className, 'scared-ghost', 'ghost');
                ghost.currentIndex = ghost.startIndex;
                points = points * 2;
                score += points;
                scoreDisplay.innerHTML = score;
                squares[ghost.currentIndex].classList.add(ghost.className, 'ghost');
            }

            checkForGameOver();
        }

        // Recursively call move function for the next frame
        requestAnimationFrame(move);
    }

    // Start the recursive animation
    requestAnimationFrame(move);
}

function checkForGameOver() {
    if (
        squares[pacmanCurrentIndex].classList.contains('ghost') &&
        !squares[pacmanCurrentIndex].classList.contains('scared-ghost')
    ) {
        ghosts.forEach(ghost => clearInterval(ghost.timerID))
        document.removeEventListener('keyup', stopMoving)
        document.removeEventListener('keydown', startMoving)
        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'Game Over';
        finalScore.innerHTML = score;
        endMenu.classList.remove('hidden');
    }
}

function checkForWin() {
    if (score >= 100) {
        ghosts.forEach(ghost => clearInterval(ghost.timerID))
        document.removeEventListener('keyup', stopMoving)
        document.removeEventListener('keydown', startMoving)
        squares.forEach(square => {
            square.classList.remove('pac-man', 'ghost', 'scared-ghost');
        });
        endMessage.innerHTML = 'You have WON!!';
        finalScore.innerHTML = score;
        endMenu.classList.remove('hidden');
    }
}
})
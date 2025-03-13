# JavaScript Game Project: Pac-man

## Overview

This project is a single-player game developed using plain JavaScript, HTML, and CSS. No frameworks or canvas was used, focusing on performance and efficient rendering and understanding game development. Since this is the first game we have ever developed, the game only incorporates some basic pac-man features.The goal of the project was to provide a functional pause menu and a scoreboard displaying time, score and lives.

## Objectives

- Ensure the game runs at 60 FPS at all times, with no frame drops.
- Utilize requestAnimationFrame for smooth animation.
- Implement a pause menu with the following options:
  - Continue
  - Restart
- Create a scoreboard displaying:
  - Timer
  - Score
  - Lives remaining
- Use only plain JavaScript, HTML, and CSS (no frameworks or canvas).
- Ensure smooth controls without key spamming—keys should be held down for continuous action.

## How the Game Works

### Gameplay

You control Pac-man who moves through a maze, collecting dots while avoiding ghosts. The goal is to collect all the dots in the maze while avoiding the ghosts and trying to achieve the highest score. When Pac-Man collects a power pellet, the ghosts turn blue and can be eaten for extra points.

### Main Features:

- **Movement**:
  - Pac-Man moves through the maze using arrow keys (up, down, left, right). The game supports smooth movement, where you can hold down a key to continue moving in the chosen direction.
  - Ghosts switch between escaping from Pac-man, moving randomly and chasing Pac-man, based on the game state. The ghost get faster each time Pac-man loses a life.
    **Note**: All characters can move through the tunnel without any consequences.
- **Timer**: A countdown clock runs throughout the game to track how long the game has been played.
- **Score**: Each dot collected increases the score. Eating a ghost after collecting a power pellet gives bonus points.
- **Lives**: Pac-Man starts with 3 lives. If Pac-Man collides with a ghost while not in a scared state, a life is lost. If Pac-man loses all 3 lives, game is over.
- **Power-ups**: Power pellets make ghosts turn blue for 10 seconds, allowing Pac-Man to eat them for extra points. The ghosts are flashing the last 2 seconds so that you know they are about to become normal again.

## Controls

### Keyboard Controls:

- Arrow keys (Up, Down, Left, Right): Use these to move Pac-Man through the maze.
- Space bar: Pause or unpause the game.
- R: Restart the game from the beginning.
- Enter: When game is over, restart simply by pressing enter.

## Game Flow

1. **Starting the Game**: The game starts directly when the page is loaded. Pac-Man is in the maze, and the ghosts are initially positioned in their lair.
2. **Collecting Dots**: Pac-Man moves through the maze and collects dots. The score increases with every dot collected.
3. **Ghost Interaction:**

- If Pac-Man collides with a ghost, a life is lost.
- If Pac-Man collects a power pellet, the ghosts turn blue for 10 seconds, and Pac-Man can eat them for extra points.

4. **Pause and Resume**: Press the space bar to pause the game. While paused, the game freezes, and you can choose to continue or restart the game.
5. **Game Over**: The game ends when Pac-Man runs out of lives or collects all dots and pellets that are on the game board. The final score and time played are shown in the scoreboard.

## Scoring

In Pac-Man, your score increases as you collect dots, eat power pellets, and defeat ghosts. Here's a breakdown of how scoring works in the game:

1. **Dot Collection:**

- Each regular pac-dot Pac-Man collects adds 1 point to the score.

2. **Power-Pellet Collection:**

- When Pac-Man collects a Power Pellet, the score increases by 10 points.
- Power Pellets temporarily turn the ghosts into "scared" mode, allowing Pac-Man to eat them for bonus points.

3. **Ghost Eating (during Power Pellet Effect):**

- Once a Power Pellet is eaten, the ghosts turn blue and are vulnerable for **10 seconds**.
- The first ghost Pac-Man eats during this period will award **200 points**.
- Any subsequent ghosts eaten during the 10-second period are worth **double the points** of the previous ghost:
  - For example, the second ghost eaten during the Power Pellet effect will be worth **400 points**, the third will be worth **800 points**, and the third **1600 points**.

**Note:** If the Power Pellet's effect ends before another ghost is eaten, the point multiplier resets back to **200 points** for the next ghost.

## Future Enhancements

- **Power-ups**: Introduce additional power-ups for Pac-Man that can temporarily boost speed or grant special abilities.
- **Ghost Personalities**: Each ghost could have its own behavior pattern, adding complexity to the AI (such as Blinky chasing Pac-Man, Pinky trying to ambush, etc.).
- **Level Progression**: Add multiple levels with increasing difficulty by modifying the maze or increasing ghost speed.
- **Smooth Movement**: Improve the movement so that ghosts move smoothly across the screen (without snapping tile to tile). Improve Pac-man's stopping and turning to be more responsive.

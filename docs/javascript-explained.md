# JavaScript Explained for Snake Game

In this document, we will explore the programming parts of the JavaScript code used in the Snake Game. We will keep it simple and explain key concepts that will help you understand how the game works.

## Key Parts of the Game

1. **Game Loop**  
   The game loop is like a clock for the game. It runs continuously and updates the game state and the screen. This is where the action happens!
   
   ```javascript
   function gameLoop() {
       update();  // Update the game state
       render();  // Draw the game on the screen
       requestAnimationFrame(gameLoop);  // Keep the loop going
   }
   ```

2. **Grid**  
   The grid is a grid layout for the game area. It helps the snake know where to move. Each cell in the grid is a spot where the snake can be.
   
   ```javascript
   const gridSize = 20; // Each square in the grid is 20x20 pixels
   const rows = canvas.height / gridSize;
   const cols = canvas.width / gridSize;
   ```

3. **Snake Movement**  
   The snake moves in the direction given by the player. We update the snake's position every frame based on user input.
   
   ```javascript
   snake.x += dx; // Update snake's x position
   snake.y += dy; // Update snake's y position
   ```

4. **Input Handling**  
   Input handling reads what keys are pressed by the player. This lets the snake change direction.
   
   ```javascript
   document.addEventListener('keydown', changeDirection);
   function changeDirection(event) {
       if (event.key === 'ArrowUp') { /* change direction up */ }
   }
   ```

5. **Collision Detection**  
   Collision detection checks if the snake runs into itself or the walls of the game. If it does, the game ends!
   
   ```javascript
   if (snakeHead.collidesWith(snakeBody) || snakeHead.collidesWithWall()) {
       endGame(); // End the game
   }
   ```

6. **Scoring**  
   The score increases when the snake eats food. We keep track of the score with a variable.
   
   ```javascript
   let score = 0; // Start score at 0
   function eatFood() {
       score += 10; // Increase score by 10 points
   }
   ```

7. **Rendering**  
   Rendering is the process of drawing everything on the screen. This includes the snake, food, and score.
   
   ```javascript
   function render() {
       context.clearRect(0, 0, canvas.width, canvas.height); // Clear the screen
       drawSnake(); // Draw the snake
   }
   ```

## Key Terms

- **Variable**: A storage location for data that can change. Example: `let score = 0;`
- **Function**: A block of code that does a specific task. Example: `function update() { ... }`
- **Loop**: A way to repeat code. Example: a game loop repeats many times to keep the game running.
- **Array**: A list of items. Example: `let fruits = ['apple', 'banana', 'cherry'];`
- **Event Listener**: A way for code to react to actions, like pressing a key. Example: `document.addEventListener('keydown', function() { ... });`

This document should help you understand the basic programming concepts used in the Snake Game! 

# Snake (HTML/CSS/JS) — GitHub Pages

A classic Snake game built with **only HTML, CSS, and JavaScript** (no frameworks, no build step). Perfect for hosting on **GitHub Pages**.

## Play
- **Move:** Arrow keys or **WASD**
- **Start:** **Enter** (or the Start button)
- **Pause:** **Space** (or Pause button)
- **Restart:** **R** (or Restart button)

## Classroom / Teaching Notes (8th grade friendly)
This project is a great way to teach:
- **Coordinate systems** (x/y on a grid)
- **State** (snake array, direction, food position)
- **Loops & time** (game tick updates)
- **Events** (keyboard input)
- **Randomness** (food placement)
- **Debugging** (print state to console, change tick speed)

Suggested mini-lessons:
1. Change the **board size** and discuss how pixels map to grid cells.
2. Add a new type of food worth 3 points.
3. Make walls wrap (going off the left side appears on the right).
4. Add obstacles and talk about collision detection.

## Run locally
Just open `index.html` in your browser.

## Deploy to GitHub Pages
1. Go to **Settings → Pages**
2. Under **Build and deployment** choose:
   - Source: **Deploy from a branch**
   - Branch: **main** and **/(root)**
3. Save, then wait for Pages to publish.

Your game will appear at:
`https://nicholalexander.github.io/snake/`
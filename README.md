# Asteroids Clone
A TypeScript-based remake of the classic Asteroids game using Phaser 3, featuring a player-controlled spaceship, asteroids, bullet firing, and collision detection. This project uses Vite for development and builds, TypeScript for type safety, and ESLint/Prettier for code quality.

## Overview
This project recreates the iconic Asteroids arcade game where you control a spaceship, shoot asteroids to score points, and avoid collisions to survive. The game includes:
* Player movement and rotation using arrow keys or WASD
* Bullet firing with the Spacebar
* Asteroid spawning and collision detection
* Score tracking and game-over mechanics

## Prerequisites
* Node.js (v16 or later)
* npm (comes with Node.js)

## Installation
**Clone the repository:**
```bash
git clone <your-repository-url>
cd asteroid-clone
```

**Install dependencies:**
```bash
npm install
```

## Development Setup
To run the game locally for development:

**Start the development server:**
```bash
npm run dev
```
This will launch the game in your browser at http://localhost:5173 (or another port if 5173 is in use) using Vite's hot module reloading.

**Build for production:**
```bash
npm run build
```
This generates a production-ready build in the dist directory.

**Preview the production build:**
```bash
npm run serve
```
This serves the production build locally for testing.

## Usage
* Use the arrow keys or WASD to move and rotate the spaceship.
* Press the Spacebar to fire bullets at asteroids.
* Press R to restart the game after a "GAME OVER."
* The game displays your score in the top-left corner and shows "GAME OVER" when you collide with an asteroid.
* Enable debug mode by setting debug: true in src/game.ts to visualize hitboxes (green rectangles for physics bodies).

## Linting and Formatting

**Linting:**
```bash
npm run lint
```

This runs ESLint to check for code quality issues in TypeScript files.
**Formatting:**
Use Prettier to format your code. You can integrate it into your editor or run it manually via your editor’s Prettier extension.
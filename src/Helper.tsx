import { GRID_COLUMNS, GRID_ROWS, foodList } from "./Values";

export function randomXY() {
  return {
    x: Math.floor(Math.random() * GRID_COLUMNS),
    y: Math.floor(Math.random() * GRID_ROWS),
  };
}

export function randomFood(snake: { x: number; y: number }[]) {
  let food = randomXY();
  while (snake.find((p) => p.x === food.x && p.y === food.y)) {
    food = randomXY();
  }
  return {
    ...food,
    emoji: foodList[Math.floor(foodList.length * Math.random())],
  };
}

export function getHighScore() {
  return Number.parseInt(localStorage.getItem("HighScore") || "0");
}

export function updateHighScore(score: number) {
  localStorage.setItem("HighScore", score.toString());
}


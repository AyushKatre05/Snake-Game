import { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  GRID_COLUMNS,
  GRID_ROWS,
  GRID_SIZE,
  MOVE,
  LOOPER_INTERVAL,
} from "./Values";
import { getHighScore, randomFood, updateHighScore } from "./Helper";

const initialHighScore = getHighScore();

function App() {
  const [started, setStarted] = useState(false);
  const over = useRef(false);
  const timer = useRef<number>();
  const snake = useRef([{ x: GRID_ROWS / 2, y: GRID_COLUMNS / 2 }]);
  const speed = useRef(0);
  const food = useRef(randomFood(snake.current));
  const highScore = useRef(initialHighScore);

  const direction = useRef<MOVE>(MOVE.RIGHT);
  const [, updateFrame] = useState(0);

  function moveSnake() {
    const head = { ...snake.current[0] };
    switch (direction.current) {
      case MOVE.LEFT:
        head.x--;
        break;
      case MOVE.RIGHT:
        head.x++;
        break;
      case MOVE.UP:
        head.y--;
        break;
      default:
        head.y++;
        break;
    }
    snake.current.unshift(head);
    if (head.x === food.current.x && head.y === food.current.y) {
      food.current = randomFood(snake.current);
    } else {
      snake.current.pop();
    }
  }

  function detectCollision() {
    const head = snake.current[0];
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= GRID_ROWS ||
      head.y >= GRID_COLUMNS
    ) {
      return gameOver();
    }
    for (let i = 1; i < snake.current.length; i++) {
      if (head.x == snake.current[i].x && head.y === snake.current[i].y) {
        return gameOver();
      }
    }
  }

  function gameOver() {
    clearInterval(timer.current);
    over.current = true;
    updateFrame(0);
  }

  function resetGame() {
    clearInterval(timer.current);
    snake.current = [{ x: GRID_ROWS / 2, y: GRID_COLUMNS / 2 }];
    if (over.current) food.current = randomFood(snake.current);
    over.current = false;
    direction.current = MOVE.RIGHT;
    setStarted(false);
  }

  function gameLoop() {
    moveSnake();
    detectCollision();
    updateFrame((prev) => prev + 1);
  }

  function startGame() {
    resetGame();
    setStarted(true);
    timer.current = setInterval(gameLoop, LOOPER_INTERVAL - speed.current);
  }

  function handleKeypress(e: KeyboardEvent) {
    if (e.key === " ") {
      return startGame();
    }
    const keyMap: { [key: string]: () => void } = {
      ArrowLeft: () => (direction.current = MOVE.LEFT),
      ArrowRight: () => (direction.current = MOVE.RIGHT),
      ArrowUp: () => (direction.current = MOVE.UP),
      ArrowDown: () => (direction.current = MOVE.DOWN),
    };
    const oppositeMap: { [key: string]: MOVE } = {
      ArrowLeft: MOVE.RIGHT,
      ArrowRight: MOVE.LEFT,
      ArrowUp: MOVE.DOWN,
      ArrowDown: MOVE.UP,
    };
    if (e.key in keyMap && direction.current !== oppositeMap[e.key]) {
      keyMap[e.key]();
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeypress);
    return () => document.removeEventListener("keydown", handleKeypress);
  }, []);

  function getItemStyles(c: { x: number; y: number }) {
    return {
      width: GRID_SIZE,
      height: GRID_SIZE,
      left: c.x * GRID_SIZE,
      top: c.y * GRID_SIZE,
      borderRadius: GRID_SIZE / 3,
      borderWidth: GRID_SIZE / 10,
      transitionDuration: `${LOOPER_INTERVAL - speed.current}ms`,
    };
  }

  function getSnakeHeadStyles() {
    const angle = [0, 90, 180, 270][direction.current];
    return {
      gap: GRID_SIZE / 5,
      width: GRID_SIZE,
      transform: `rotate(${angle}deg)`,
    };
  }

  function getSnakeTailStyles() {
    const len = snake.current.length;
    const a = snake.current[len - 1];
    const b = snake.current[len - 2];
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const width = GRID_SIZE / 4;
    const angle = dx < 0 ? 0 : dx > 0 ? 180 : dy < 0 ? 90 : 270;
    return {
      width,
      height: GRID_SIZE / 10,
      transform: `rotate(${angle}deg)`,
      transitionDuration: `${LOOPER_INTERVAL - speed.current}ms`,
    };
  }

  const currentScore = snake.current.length - 1;
  const currentHighScore = Math.max(currentScore, highScore.current);

  useEffect(() => {
    if (started) updateHighScore(currentHighScore);
  }, [currentHighScore, started]);

  return (
    <div className="flex items-center justify-center h-[100vh] p-0 m-0 box-border">
      <div className="rounded-xl shadow-zinc-900">
        <div className="bg-zinc-900 p-3 -mb-3 rounded-xl flex justify-between text-xl">
          <span className="text-white p-3">Your Score : {currentScore.toString().padStart(3, "0")}</span>
          <span className="text-white p-3"> HighScore : {currentHighScore.toString().padStart(3, "0")}</span>
        </div>
        <div className=" bg-slate-900 rounded-xl border-slate-400 border-[15px]">
          <div
            className="block relative overflow-hidden"
            style={{
              width: GRID_ROWS * GRID_SIZE,
              height: GRID_COLUMNS * GRID_SIZE,
              opacity: started && !over.current ? 1 : 0.5,
            }}
          >
            <div
              className="absolute bg-green-500 border-[3px] border-white flex items-center justify-center text-xl animate-ping"
              key={snake.current.length}
              style={getItemStyles(food.current)}
            >
              {food.current.emoji}
            </div>
            {snake.current.map((c, i, a) => (
              <div key={i} className="bg-red-500 border-white border-[4px] flex items-center justify-center absolute transition-all ease-linear animate-bounce" style={getItemStyles(c)}>
                {i === 0 ? (
                  <div
                    className="snake-head"
                    style={getSnakeHeadStyles()}
                  ></div>
                ) : i === a.length - 1 ? (
                  <div
                    className="snake-tail"
                    style={getSnakeTailStyles()}
                  ></div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      {started && !over.current ? null : (
        <div className="absolute flex flex-col items-center justify-center text-center bg-slate-800 rounded-2xl p-5 shadow-slate-300 animate-pulse">
          <h1 className="text-5xl font-bold mb-5 text-white">{over.current ? "Game Over 😲" : "Snake Game"}</h1>
          <button className="text-white bg-green-600 border-none p-4 rounded-3xl text-lg cursor-pointer font-bold line-clamp-1" onClick={startGame}>
            Click here to {over.current ? "Restart" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

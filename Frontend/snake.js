import {
    buildElement,
    $
} from './common.js'

const dir = {
    UP: 'up',
    LEFT: 'left',
    RIGHT: 'right',
    DOWN: 'down'
}

export class Point {
    constructor(x, y) {
        if (x instanceof Point) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
    }

    move(d) {
        switch (d) {
            case dir.LEFT:
                this.x -= 1;
                break;
            case dir.RIGHT:
                this.x += 1;
                break;
            case dir.UP:
                this.y -= 1;
                break;
            case dir.DOWN:
                this.y += 1;
                break;
            default:
                throw new Error("Unknown direction in move")
        }
    }

    equals(p) {
        return this.x === p.x && this.y === p.y;
    }
}

function randomInt(low, high) {
    return Math.floor((Math.random() * (high - low)) + low)
}

function randomPoint() {
    return new Point(randomInt(2, 98), randomInt(2, 98))
}

class Game {
    constructor() {
        this.board = $("#board")
        this.g = board.getContext("2d")
        this.g.scale(board.width / 100, board.height / 100)
        this.snake = new Snake(new Point(50, 50))

        this.food = randomPoint();

        $("body").addEventListener("keydown", this.onKey.bind(this))
    }

    run() {
        this.blank();
        this.draw();
        if (this.snake.alive) {
            this.snake.tick();
            if (!this.collisionChecks(this.snake)) {
                this.snake.alive = false;
            }
            this.timer = setTimeout(this.run.bind(this), 100)
        }
    }

    collisionChecks(snake) {
        if (!this.boundsCheck(snake.head)) {
            return false;
        }
        if (this.food.equals(this.snake.head)) {
            snake.grow(this.food);
            this.food = randomPoint();
            return true;
        }
        return !snake.selfCheck();
    }

    boundsCheck(p) {
        return p.x > 0 && p.x < 100 && p.y > 0 && p.y < 100;
    }

    blank() {
        this.g.clearRect(0, 0, this.board.width, this.board.height);
    }

    draw() {
        this.drawSnake(this.snake);
        this.drawFood()
    }

    drawFood() {
        this.drawPoint(this.food, 'blue')
    }
    drawSnake(s) {
        for (let i = 0; i < s.length; i += 1) {
            this.drawPoint(s.body[i], s.alive ? 'green' : 'red');
        }
    }

    drawPoint(p, color) {
        this.g.fillStyle = color
        this.g.fillRect(p.x - 0.5, p.y - 0.5, 1, 1)
    }

    onKey(e) {
        switch (e.code) {
            case "KeyS":
            case "ArrowDown":
                this.snake.facing = dir.DOWN;
                break;
            case "KeyW":
            case "ArrowUp":
                this.snake.facing = dir.UP;
                break;
            case "KeyA":
            case "ArrowLeft":
                this.snake.facing = dir.LEFT;
                break;
            case "KeyD":
            case "ArrowRight":
                this.snake.facing = dir.RIGHT;
        }
    }
}

class Snake {
    constructor(head) {
        this.alive = true;
        this.length = 1;
        this.body = [new Point(head)]
        this.facing = dir.RIGHT;
    }

    tick() {
        const p = new Point(this.head);
        p.move(this.facing);
        this.body.unshift(p)
        this.body.pop();
    }

    grow(p) {
        this.body.unshift(p);
        this.length = this.body.length
    }

    selfCheck() {
        for (let i = 1; i < this.body.length; i += 1) {
            if (this.head.equals(this.body[i])) {
                return true;
            }
        }
        return false;
    }

    get head() {
        return this.body[0];
    }
}



function init() {
    const game = new Game();
    game.run();
}

window.addEventListener("DOMContentLoaded", init);

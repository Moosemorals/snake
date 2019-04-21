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

const field = {
    WIDTH: 25,
    HEIGHT: 25
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

    dist(a) {
        return Math.abs(this.x - a.x) + Math.abs(this.y - a.y);
    }

    toString() {
        return ["(", this.x, ",", this.y, ")"].join('');
    }
}

function randomInt(low, high) {
    return Math.floor((Math.random() * (high - low)) + low)
}

function randomPoint() {
    return new Point(randomInt(2, field.WIDTH - 1), randomInt(2, field.HEIGHT - 1))
}

class Game {
    constructor() {
        this.board = $("#board")
        this.g = board.getContext("2d")
        this.g.scale(board.width / field.WIDTH, board.height / field.HEIGHT)
        this.snake = new AutoSnake(new Point(Math.floor(field.WIDTH / 2), Math.floor(field.HEIGHT / 2)))

        this.food = randomPoint();

        $("body").addEventListener("keydown", this.onKey.bind(this))
    }

    run() {
        this.blank();
        this.draw();
        if (this.snake.alive) {
            this.snake.tick(this.food);
            if (!this.collisionChecks(this.snake)) {
                this.snake.alive = false;
            }
            this.timer = setTimeout(this.run.bind(this), 100)
        }
    }

    placeFood() {

        while (true) {
            this.food = randomPoint();
            for (let i = 0; i < this.snake.body.length; i += 1) {
                if (this.snake.body[i].equals(this.food)) {
                    this.food = undefined;
                    break;
                }
            }
            if (this.food != undefined) {
                return;
            }
        }
    }

    collisionChecks(snake) {
        if (!this.boundsCheck(snake.head)) {
            return false;
        }


        if (this.food.equals(this.snake.head)) {
            snake.grow(this.food);
            this.placeFood();
            return true;
        }

        return !snake.selfCheck();
    }

    boundsCheck(p) {
        return p.x > 0 && p.x < field.WIDTH && p.y > 0 && p.y < field.HEIGHT;
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

// via http://eloquentjavascript.net/1st_edition/appendix2.html
export class BinaryHeap {
    constructor(score, equals) {
        this.content = [];
        this.scoreFunction = score;
        this.equalsFunction = equals;
    }

    contains(element) {
        for (let i = 0; i < this.content.length; i += 1) {
            if (this.equalsFunction(element, this.content[i])) {
                return true;
            }
        }
        return false;
    }

    push(element) {
        this.content.push(element);
        this.bubbleUp(this.content.length - 1);
    }

    pop() {
        const result = this.content[0];
        const end = this.content.pop();

        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }

        return result;
    }

    isEmpty() {
        return this.content.length === 0;
    }

    bubbleUp(n) {
        const element = this.content[n];
        const score = this.scoreFunction(element);

        while (n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1;
            parent = this.content[parentN];
            if (score >= this.scoreFunction(parent)) {
                break;
            }
            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
        }
    }

    sinkDown(n) {
        const length = this.content.length;
        const element = this.content[n];
        const elemScore = this.scoreFunction(element);

        while (true) {
            const child2N = (n + 1) * 2;
            const child1N = child2N - 1;
            let child1, child1Score;

            let swap = null;
            if (child1N < length) {
                child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            if (child2N < length) {
                const child2 = this.content[child2N];
                const child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            if (swap == null) {
                break;
            }

            this.content[n] = this.content[swap];
            this.content[swap] = element;
            n = swap;
        }
    }
}

class AutoSnake extends Snake {
    constructor(head) {
        super(head)
        this.route = [];
    }

    isBody(p) {
        for (let i = 0; i < this.length; i += 1) {
            if (this.body[i].equals(p)) {
                return true;
            }
        }
        return false;
    }

    boundsCheck(p) {
        return p.x > 0 && p.x < field.WIDTH && p.y > 0 && p.y < field.HEIGHT;
    }

    getNeighbours(p) {

        const n = Object.values(dir).map(d => {
            const q = new Point(p);
            q.move(d);
            return q
        });

        for (let i = 0; i < n.length; i += 1) {
            if (this.isBody(n[i]) || !this.boundsCheck(n[i])) {
                n.splice(i, 1);
                i -= 1;
            }
        }

        return n;
    }

    findRoute(start, end) {

        function path(current) {
            const result = [];
            while (current in cameFrom) {
                current = cameFrom[current];
                result.push(current);
            }
            return result;
        }

        const fScore = {},
            gScore = {},
            cameFrom = {},
            closedSet = {};
        const openSet = new BinaryHeap(x => x in fScore ? fScore[x] : Math.MAX_SAFE_INTEGER, (x, y) => x.equals(y));

        openSet.push(start);
        fScore[start] = start.dist(end);
        gScore[start] = 0;

        while (!openSet.isEmpty()) {
            const current = openSet.pop();

            if (current.equals(end)) {
                return path(current);
            }

            closedSet[current] = true;

            this.getNeighbours(current).forEach(n => {
                if (n in closedSet) {
                    return;
                }

                const maybeScore = gScore[current] + 1;

                if (!openSet.contains(n)) {
                    fScore[n] = maybeScore + n.dist(end);
                    openSet.push(n)
                } else if (maybeScore >= n in gScore ? gScore[n] : Math.MAX_SAFE_INTEGER) {
                    return;
                }

                cameFrom[n] = current;
                gScore[n] = maybeScore;
                fScore[n] = maybeScore + n.dist(end);
            })
        }
    }


    tick(food) {

        if (this.route.length === 0) {
            this.route = this.findRoute(this.head, food);
            if (this.route !== undefined) {
                this.route.unshift(food);
                this.route.pop();
            } else {
                this.route = [];
            }
        }

        if (this.route.length > 0) {

            const next = this.route.pop();

            if (next.x < this.head.x) {
                this.facing = dir.LEFT;
            } else if (next.x > this.head.x) {
                this.facing = dir.RIGHT;
            } else if (next.y < this.head.y) {
                this.facing = dir.UP;
            } else if (next.y > this.head.y) {
                this.facing = dir.DOWN;
            }
        }
        super.tick();
    }
}


function init() {
    const game = new Game();
    game.run();
}

window.addEventListener("DOMContentLoaded", init);

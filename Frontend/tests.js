import {
    Point,
    BinaryHeap
} from './snake.js'


QUnit.test("Point: Constructors", function (assert) {

    const one = new Point(1, 2);
    assert.equal(one.x, 1, "Should have set x")
    assert.equal(one.y, 2, "Should have set y")


    const two = new Point(one);
    assert.equal(two.x, 1, "Should have set x")
    assert.equal(two.y, 2, "Should have set y")

    one.x = 3;

    assert.equal(two.x, 1, "Should have set x")

});

QUnit.test("Heap", function (assert) {

    const heap = new BinaryHeap(x => x);
    const vals = [10, 4, 2, 3]

    vals.forEach(v => heap.push(v));

    assert.equal(heap.pop(), 2);
    assert.equal(heap.pop(), 3);
    assert.equal(heap.pop(), 4);
    assert.equal(heap.pop(), 10);


})

QUnit.test("points as keys", function (assert) {

    const p = new Point(1, 1);

    const n = {};
    n[p] = 1;

    assert.equal(n[p], 1)
});

QUnit.test("dist", function (assert) {

    const data = [
        [new Point(0, 0), new Point(0, 0), 0, "Same point"],
        [new Point(0, 0), new Point(0, 1), 1, "One away"],
        [new Point(0, 0), new Point(1, 1), 2, "Diaganal"],
        [new Point(1, 1), new Point(0, 0), 2, "reverse"]
    ]

    data.forEach(row => {
        const [p1, p2, expected, comment] = row;
        assert.equal(p1.dist(p2), expected, comment)
    })


})

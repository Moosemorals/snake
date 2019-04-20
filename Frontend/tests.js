import {
    Point
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

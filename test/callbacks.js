var test = require('tape');
var callbacks = require('../lib/callbacks');

test('remove expired callbacks', function (t) {
    t.plan(4);

    var cbs = callbacks({
        timeout: 10
    });

    t.equal(cbs.timeout, 10, 'should have set timeout')

    var id = cbs.add(function() {});

    t.ok(id, 'should have returned an id');
    t.ok(cbs.find(id), 'should have found a callback for an id');

    setTimeout(function() {
        t.equal(cbs.find(id), undefined, 'should have removed a callback after timeout');
        t.end();
    }, 50)
});

test('disable timeouts', function (t) {
    t.plan(4);

    var cbs = callbacks({
        timeout: 0
    });

    t.equal(cbs.timeout, 0)

    var id = cbs.add(function() {});

    t.ok(id);
    t.ok(cbs.find(id));

    setTimeout(function() {
        t.ok(cbs.find(id));
        t.end();
    }, 50)
});

test('remove callbacks', function (t) {
    t.plan(3);

    var cbs = callbacks({
        timeout: 0
    });

    t.equal(cbs.timeout, 0)

    var id = cbs.add(function() {});

    t.ok(id);

    cbs.remove(id);

    t.equal(cbs.find(id), undefined);
});
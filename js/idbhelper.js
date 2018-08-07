// creating DB keyval
var dbPromise = idb.open('test-db', 1, function name(upgradeDb) {
    var keyValStore = upgradeDb.createObjectStore('keyval');
    keyValStore.put('world', 'hello');
});

// READ from db keyval
dbPromise.then(function(db) {
    var tx = db.transaction('keyval');
    var keyValStore = tx.objectStore('keyval');
    return keyValStore.get('hello');
}).then(function(val) {
    console.log('The value of "Hello" is: ', val);
});

//  add another value to objectstore
dbPromise.then(function(db) {
    var tx = db.transaction('keyval', 'readwrite');
    var keyValStore = tx.objectStore('keyval');
    keyValStore.put('bar', 'foo');
    return tx.complete;
}).then(function name(params) {
    console.log('Added foo:bar to keyval');
});
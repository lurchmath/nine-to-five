
# Nine to Five

A partial implementation of
[the WebWorker API](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
for Node.js.

**Q:** Why? We already have the
[worker_threads](https://nodejs.org/api/worker_threads.html) module built in to
Node.js!

**A:** Yes, but it doesn't have the same API.  If you want to re-use browser
code on the command line without rewriting, you want the API to be the same.
This library is essentially a thin layer on top of `worker_threads` to make it
look and behave like WebWorkers.

## Status

Working, with unit tests, but not a full implementation.

Very little documentation.  See comments in the source code
([here](index.js) and [here](preamble.js)).

The goal is to create something that behaves like this:

 * [WebWorker API](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
 * [Functions in Worker global scope](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

See [What's not supported](#whats-not-suppoorted), below.

## Example

File example-worker.js:
```js
onmessage = ( message, transfer ) => {
    const { a, b } = message.data // get inputs
    postMessage( a + b ) // send back output
}
```

File example-script.js:
```js
let { Worker } = require( 'nine-to-five' )
const w = new Worker( 'example-worker.js' )
w.postMessage( { a : 5, b : 6 } )
w.on( 'message', ( message, transfer ) => {
    console.log( message.data ) // prints 11
    w.terminate() // so the whole script will stop
} )
```

Output:
```
11
```

## Installation

```sh
npm install nine-to-five
```

## Contributing

Clone this repo.  You can run tests with `npm test`.

## What's not supported?

Some errors

 * If the Worker script has a syntax error, the web implementation throws a
   `SyntaxError`, but we do not.
 * Similarly, we do not generate `messageerror` events.

Worker constructor details

 * `Worker(script)` requires `script` to be a filename relative
   to the current working directory; in particular, it cannot be a URL.
 * `Worker(script,options)` does not support the `options.type` field,
   which means it assumes type `"classic"` and never type `"module"`.
 * `Worker(script,options)` does not support the `options.credentials` field;
   it ignores it.

Missing APIs in Workers

 * [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
 * [Performance](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
   and [related classes](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry)
 * [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
 * [WorkerLocation](https://developer.mozilla.org/en-US/docs/Web/API/WorkerLocation)
 * [WorkerNavigator](https://developer.mozilla.org/en-US/docs/Web/API/WorkerNavigator)

Miscellany

 * You cannot create your own events, as with the `CustomEvent` class in the
   browser, because Node.js does not support constructing event objects.
 * The `dump()` function is not supported in Workers; it is non-standard.

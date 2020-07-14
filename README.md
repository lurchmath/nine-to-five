
# Nine to Five

A partial implementation of
[the WebWorker API](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
for Node.js.

**Q:** Why? We already have the
[worker_threads](https://nodejs.org/api/worker_threads.html) module built in to
Node.js!

**A:** Yes, but it doesn't have the
[WebWorker API](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker),
nor all the [Functions in WebWorkers' global scope](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers).
To reuse code the API must be the same.

This library is essentially a thin layer on top of `worker_threads` to make it
look and behave like WebWorkers. See also
[What's been added](#whats-been-added), below.

## Status

Working, with unit tests, but see [What's not supported](#whats-not-supported).

For documentation, read the example and bullet points below, and optionally the
comments in the source
([here](https://github.com/lurchmath/nine-to-five/blob/master/index.js) and
[here](https://github.com/lurchmath/nine-to-five/blob/master/preamble.js)).

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

## What's been added?

That is, how is this better than Node's built-in
[worker_threads](https://nodejs.org/api/worker_threads.html) module?
(The example above could have been done using that alone, I think.)

 * Workers can use
   [importScripts()](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts).
 * Workers can use the
   [XMLHttpRequest API](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).
 * Workers can access `on`, `off`, `onmessage`, `addEventListener`,
   `removeEventListener`, `emit`, and
   [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/postMessage).
 * Message events behave like they would in the browser, in this sense:
    * `myWorker.postMessage(x)` sends the Worker a message `{ data : x }`
    * `postMessage(x)` in the Worker sends out a message `{ data : x }`
 * Workers can use
   [close()](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/close)
   to terminate themselves.
 * Workers can use the
   [atob()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/atob) and
   [btoa()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa) functions.

## What's not supported?

### Some errors

 * If the Worker script has a syntax error, the web implementation throws a
   `SyntaxError`, but we do not.
 * Similarly, we do not generate `messageerror` events.

### Some Worker constructor options

 * `Worker(script)` requires `script` to be a filename relative
   to the current working directory; in particular, it cannot be a URL.
 * `Worker(script,options)` does not support the `options.type` field,
   which means it assumes type `"classic"` and never type `"module"`.
 * `Worker(script,options)` does not support the `options.credentials` field;
   it ignores it.

### Some Worker APIs

 * [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
 * [Performance](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
   and [related classes](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry)
 * [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
 * [WorkerLocation](https://developer.mozilla.org/en-US/docs/Web/API/WorkerLocation)
 * [WorkerNavigator](https://developer.mozilla.org/en-US/docs/Web/API/WorkerNavigator)
 * You cannot create your own events, as with the `CustomEvent` class in the
   browser, because Node.js does not support constructing event objects.
 * The [dump()](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/dump)
   function is not supported in Workers; it is non-standard.

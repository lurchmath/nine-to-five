
# What should I be able to do?

 * Workers should be instances of `EventEmitter` already, as per the docs;
   verify this.
 * Worker should run the script passed.  At first, test this informally by
   dumping some output to the console.  Then formalize the test while also
   creating a test of the following requirement.
 * Workers can use `console.*()`.  Listen for this in the parent using the code
   below.  Create a simple test that puts into the worker a script that just
   writes something to `stdout` and verifies that it comes out of the worker.

```js
// use these options when creating a worker
const worker = new wt.Worker( '...', { stdout: true, stderr: true } )
// now when it uses console.log() or console.error(),
// you can get the values because worker.stdout is a readable stream.
worker.stdout.on( 'data', ( chunk ) => {
  // chunk could be string, Buffer, or other...convert to string?
} )
// 'end' event is emitted when there is no more data
```

 * If the script can't be loaded, then the `error` event should be called with a
   `SyntaxError` object.  (Listen for `error` events with an error parameter,
   for if the worker throws an uncaught exception.)
 * Prepare to prepend custom code to any worker script as follows.  Create a
   file containing the custom code (for now just define a global test variable).
   Load this file syncrhonously at module launch.  When the user provides a
   script filename, load it with `fs.read()`, prepend your code to it, then pass
   that as the *code* as the argument to the `Worker` constructor, and use the
   option `eval: true`.  Print the global test variable from the script to be
   sure that this works.
 * The worker's global scope should be an instance of `EventEmitter`, so that it
   supports `addEventListener()` and so forth globally, including `emit()`.  If
   this is not the case already, you will need to create an `EventEmitter`
   instance and create global functions that route their work through that
   global instance.  Do so in the global preamble script you just created.
 * Worker objects should support event listening using
   `worker.addEventListener()` and with fields like `onerror`.
   (No idea if this is how workers currently work.  It is not how workers
   currently talk to the parent thread, however.  That happens with
   `parentPort`, so you'll probably want to reroute that, by adding some code
   like the following to your preamble.)

```js
( function () {
    const wt = require( 'worker_threads' )
    wt.parentPort.on( 'message', ( ...args ) => {
        this.emit( 'message', ...args )
    } )
    this.postMessage = ( ...args ) => {
        wt.parentPort.postMessage( ...args )
    }
} )()
```

 * If the worker script calls `postMessage(data[,transfer])` then a `message`
   event should occur on the outer Worker object with `event.data` a structural
   copy of the given data; ignore the `transfer` parameter.  This will require
   you to convert the data given to `postMessage()` into something that has the
   structure of a `MessageEvent`.  See
   [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent).
 * If the data can't be deserialized to create the message event, it must call a
   `messageerror` event instead (still with a `MessageEvent`, but
   [the docs](https://developer.mozilla.org/en-US/docs/Web/API/Worker/messageerror_event)
   don't say specifically how to decide on its fields' contents, so just do
   something that makes sense).
 * Calling `worker.postMessage(message,[transfer])` does the same thing as if
   you called it from in the worker, but in reverse, including errors.  This
   will require you to convert the data given to `postMessage()` into something
   that has the structure of a `MessageEvent`.  See
   [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent).
 * `worker.terminate()` should stop it immediately; needs no parameters.

```js
worker.terminate() // works also in Node's version
```

 * Workers can create and use instances of `CustomEvent`.
 * Workers can create and use instances of `Promise`.
 * Workers can access these functions: `atob()`, `btoa()`, `dump()`.
 * Workers can access these functions: `setInterval()`, `clearInterval()`,
   `setTimeout()`, `clearTimeout()`.
 * Workers can call `importScripts()`.
 * Workers can self-terminate with `close()`.

```js
process.exit() // try this
// parent hears it as an 'exit' event with an int-type exit code parameters
```

 * Optional `options` parameter may specify `options.type=='classic'` or omit
   that field, but nothing else.
 * Optional `options` parameter may specify `optiona.name=='any string'` and the
   Worker global scope will have `name` set to that string.
 * Worker can read its global scope name value with code `self.name`.  (Just
   add this to the preamble.)
 * Check to see if the `XMLHttpRequest` API is already supported in the worker.
   If not, add it to my list of what's not supported.

# What's not supported?

 * `Worker(script)` with `script` an URL
 * `Worker(script,options)` with `options.type=='module'`
 * `Worker(script,options)` with the `options.credentials` field
 * `transfer` parameter of `postMessage()`, in both directions
 * `IndexedDB` inside workers
 * Worker functions for measuring performance
 * Worker API for using WebSockets
 * `WorkerLocation` API
 * `WorkerNavigator` API

# References

 * [WebWorker docs](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
 * [WebWorker global scope](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

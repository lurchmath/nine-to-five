
# What should I be able to do?

 * Add support for global `onmessage` field in worker.
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

 * If the initial script has a syntax error, we do not report it specifically,
   because node.js does not have the `SyntaxError` class.
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

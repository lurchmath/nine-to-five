
# What should I be able to do?

 * Check to see if the `XMLHttpRequest` API is already supported in the worker.
   If not, add it to my list of what's not supported.
 * Ensure that you can do multiple slow tasks in parallel.
 * Ensure that you can terminate a task and it doesn't do anything more.

# What's not supported?

 * If the initial script has a syntax error, we do not report it specifically,
   because node.js does not have the `SyntaxError` class.
 * Similarly, we do not generate `messageerror` events.
 * `Worker(script)` with `script` an URL
 * `Worker(script,options)` with `options.type=='module'`
 * `Worker(script,options)` with the `options.credentials` field
 * `transfer` parameter of `postMessage()`, in both directions
 * `IndexedDB` inside workers
 * Worker functions for measuring performance
 * Worker API for using WebSockets
 * `WorkerLocation` API
 * `WorkerNavigator` API
 * You cannot create your own events, as with the `CustomEvent` class in the
   browser, because Node.js does not support constructing event objects.
 * The `dump()` function, because it is non-standard.
 * The `options.type` parameter to a Worker constructor is ignored.

# References

 * [WebWorker docs](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
 * [WebWorker global scope](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

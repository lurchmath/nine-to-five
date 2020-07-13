
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

Absolutely just beginning, not much of anything done yet

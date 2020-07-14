
/*
 * If you want to experiment with a worker, to see if it has or can support
 * certain functionality, run this script.  It just fires up a worker running
 * experiment-worker.js, runs it, and waits for it to say that it's done before
 * terminating.  See that file's content for more.
 */

// Create the worker and start it running.
let { Worker } = require( './index.js' )
const w = new Worker( './experiment-worker.js' )

// If it tries to print anything to stdout/stderr, let that go through.
w.on( 'console.log', console.log )
w.on( 'console.lerror', console.error )

// If it sends a message, print it.  If it's the special message "Done" then
// terminate the script.
w.on( 'message', ( message, transfer ) => {
    console.log( 'Worker message:', message.data )
    if ( message.data == 'Done' ) w.terminate()
} )

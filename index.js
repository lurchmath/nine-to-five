
const wt = require( 'worker_threads' )
const EventEmitter = require( 'events' )
const fs = require( 'fs' )
const path = require( 'path' )

// Load pre and post scripts from filesytem
const preamble =
    String( fs.readFileSync( path.join( __dirname, 'preamble.js' ) ) )

/*
 * Imitates the behavior of the browser's Worker class:
 * https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */
class Worker extends EventEmitter {

    /*
     * Imitates the behavior of the browser's Worker constructor:
     * https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker
     * 
     * The options parameter is not yet implemented; it is ignored for now.
     * The script parameter must be a path to a local file, not a URL.
     */
    constructor ( script, options = { } ) {
        super()
        this.script = script
        this.options = options
        this.code = null
        // this will be changed later:
        this.nodeWorker = new wt.Worker( this.buildScriptCode(), {
            stdout : true,
            stderr : true,
            eval : true
        } )
        // Workers may use console.log()/console.error() and we will want to be
        // able to see it:
        this.nodeWorker.stdout.on( 'data', chunk => {
            this.emit( 'console.log', String( chunk ) )
        } )
        this.nodeWorker.stderr.on( 'data', chunk => {
            this.emit( 'console.error', String( chunk ) )
        } )
        this.nodeWorker.on( 'message', ( ...args ) => {
            this.emit( 'message', ...args )
        } )
        // We can notice when the worker has completed the run of its setup
        // script:
        this.setupComplete = false

        // If a worker has an uncaught exception, we will hear it and do one of
        // two things:

    }

    /*
     * Build script to run by concatenating the preamble and the script
     *
     * The script is what the client provided to the constructor.
     * The preamble is part of this module, doing setupnecessary to this
     * module's functionality.
     */
    buildScriptCode () {
        if ( !this.code ) {
            this.code = preamble + '\n' + fs.readFileSync( this.script )
        }
        return this.code
    }

    /*
     * Imitates the behavior of terminate() in WebWorkers:
     * https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate
     */
    terminate () {
        this.nodeWorker.terminate()
    }
    
}

module.exports = {
    Worker : Worker
}

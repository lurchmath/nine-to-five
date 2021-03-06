
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
 * 
 * For message events, the message object will have a data field only.  The
 * fields origin, lastEventIt, source, and ports are not implemented.  They are
 * (partially) documented here:
 * https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
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
        this.script = path.resolve( script )
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
            const escape = x => x.replace( /\\/g, '\\\\' )
                                 .replace( /"/g, '\\"' )
            this.code =
                `const __filename = "${escape( this.script )}"\n`
              + `const __dirname = "${escape( path.dirname( this.script ) )}"\n`
            if ( this.options.hasOwnProperty( 'name' ) )
                this.code += `const name = "${escape( this.options.name )}"\n`
            this.code += preamble + '\n'
                       + fs.readFileSync( this.script )
        }
        return this.code
    }

    /*
     * Imitates the behavior of postMessage() in WebWorkers:
     * https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
     * 
     * This creates a wrapper with a data field, to partially imitate the
     * structure of a MessageEvent.  For more information, see:
     * https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
     */
    postMessage ( message, transfer ) {
        this.nodeWorker.postMessage( { data : message }, transfer )
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

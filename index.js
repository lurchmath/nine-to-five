
const wt = require( 'worker_threads' )
const EventEmitter = require( 'events' )

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
        // this will be changed later:
        this.nodeWorker = new wt.Worker( '', { eval : true } )
    }
}

module.exports = {
    Worker : Worker
}

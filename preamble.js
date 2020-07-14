
let onmessage = null

{

    // Create an EventEmitter that will function as if the whole Worker were an
    // EventEmitter.
    const EventEmitter = require( 'events' )
    const globalEmitter = new EventEmitter()

    // Add on/off/emit functions to the global namespace.
    // (Recall that for a function called outside of an object, "this" is the
    // global namespace.)
    global.on = ( ...args ) => globalEmitter.on( ...args )
    global.off = ( ...args ) => globalEmitter.off( ...args )
    global.emit = ( ...args ) => globalEmitter.emit( ...args )

    // Create familiar aliases for on and off.
    global.addEventListener = global.on
    global.removeEventListener = global.off

    // Implement expected message events and postMessage function, by rerouting
    // them through the event system we just built and that of the parentPort.
    const wt = require( 'worker_threads' )
    wt.parentPort.on( 'message', ( ...args ) => {
        // if they've added event listeners, ensure they are triggered
        global.emit( 'message', ...args )
        // if they've assigned to the global onmessage handler, trigger it
        if ( onmessage ) onmessage( ...args )
    } )

    // Implement the global postMessage event, wrapping the message in an object
    // with a data field, to simulate part of the MessageEvent structure.  See:
    // https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
    global.postMessage = ( message, transfer ) => {
        wt.parentPort.postMessage( { data : message }, transfer )
    }

    // Implement global functions atob and btoa, which the browser ensures are
    // available to WebWorkers.
    // https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope#Methods
    global.btoa = data => Buffer.from( data, 'binary' ).toString( 'base64' )
    global.atob = data => Buffer.from( data, 'base64' ).toString( 'binary' )

    // Implement importScripts() to behave like the following:
    // https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
    // Note that this is just a slight tweak of Sebastiaan Deckers' project
    // import-scripts on npm, to suit my needs.  See his very helpful work here:
    // https://gitlab.com/sebdeckers/import-scripts/-/blob/master/src/index.js
    const path = require( 'path' )
    const vm = require( 'vm' )
    const fs = require( 'fs' )
    global.importScripts = ( ...scripts ) => {
        for ( const script of scripts ) {
            let filepath, code
            try {
                filepath = path.resolve( __dirname, script )
            } catch ( error ) {
                throw new SyntaxError( error.message )
            }        
            try {
                code = fs.readFileSync( filepath, 'utf-8' )
            } catch ( error ) {
                const newError = new Error( error.message )
                newError.name = 'NetworkError'
                throw newError
            }        
            vm.runInThisContext( code, { filename : filepath } )
        }
    }

    // Implement close() in workers that will terminate them.
    global.close = () => process.exit()

    // Expose an XMLHttpRequest emulator to the Worker, like the browser would
    // supply.  Thanks to github.com/driverdan:
    // https://www.npmjs.com/package/xmlhttprequest
    global.XMLHttpRequest = require( 'xmlhttprequest' ).XMLHttpRequest

}

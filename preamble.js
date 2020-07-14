
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

}

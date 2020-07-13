
const wt = require( 'worker_threads' )
const EventEmitter = require( 'events' )

class Worker extends EventEmitter {

}

module.exports = {
    Worker : Worker
}

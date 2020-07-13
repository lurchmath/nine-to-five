
// import test tools
const expect = require( 'expect.js' )
const EventEmitter = require( 'events' )
const path = require( 'path' )
const testpath = __dirname + path.sep

// import this module
let { Worker } = require( '../index.js' )

suite( 'Main', () => {

    test( 'All required global functions and classes exist', () => {
        expect( Worker ).to.be.ok()
    } )

    test( 'We can construct worker instances', () => {
        const w = new Worker( testpath + 'worker-script-1.js' )
        expect( w ).to.be.a( Worker )
        expect( w.script ).to.be( testpath + 'worker-script-1.js' )
        expect( w.options ).to.eql( { } )
        expect( w.nodeWorker ).to.be.an( EventEmitter )
    } )

    test( 'We can capture console output', done => {
        const w = new Worker( testpath + 'worker-script-1.js' )
        let total = 0
        w.on( 'console.log', data => {
            expect( data ).to.be( 'script ran successfully\n' )
            if ( ++total == 2 ) done()
        } )
        w.on( 'console.error', data => {
            expect( data ).to.be( 'we would put errors here\n' )
            if ( ++total == 2 ) done()
        } )
    } )

} )

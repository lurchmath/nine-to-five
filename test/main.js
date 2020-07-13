
// import test tools
const expect = require( 'expect.js' )
const EventEmitter = require( 'events' )
const path = require( 'path' )
const testpath = path.join( __dirname, 'worker-scripts' ) + path.sep

// import this module
let { Worker } = require( '../index.js' )

suite( 'Main', () => {

    test( 'All required global functions and classes exist', () => {
        expect( Worker ).to.be.ok()
    } )

    test( 'We can construct worker instances', () => {
        const w = new Worker( testpath + 'basic.js' )
        expect( w ).to.be.a( Worker )
        expect( w.script ).to.be( testpath + 'basic.js' )
        expect( w.options ).to.eql( { } )
        expect( w.nodeWorker ).to.be.an( EventEmitter )
        w.terminate()
    } )

    test( 'We can capture console output', done => {
        const w = new Worker( testpath + 'basic.js' )
        finish = () => {
            w.terminate()
            done()
        }
        let total = 0
        w.on( 'console.log', data => {
            expect( data ).to.be( 'script ran successfully\n' )
            if ( ++total == 2 ) finish()
        } )
        w.on( 'console.error', data => {
            expect( data ).to.be( 'we would put errors here\n' )
            if ( ++total == 2 ) finish()
        } )
    } )

} )

suite( 'Messages', () => {

    test( 'We can receive messages from a script', done => {
        const w = new Worker( testpath + 'messages.js' )
        w.on( 'message', data => {
            expect( data ).to.be( 'Test message' )
            w.terminate()
            done()
        } )
    } )

} )


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
        w.terminate() // necessary or test will not halt
    } )

    test( 'We can capture console output', done => {
        const w = new Worker( testpath + 'basic.js' )
        finish = () => {
            w.terminate() // necessary or test will not halt
            done()
        }
        let numMessagesHeard = 0
        w.on( 'console.log', data => {
            expect( data ).to.be( 'script ran successfully\n' )
            if ( ++numMessagesHeard == 2 ) finish()
        } )
        w.on( 'console.error', data => {
            expect( data ).to.be( 'we would put errors here\n' )
            if ( ++numMessagesHeard == 2 ) finish()
        } )
    } )

} )

suite( 'Messages', () => {

    test( 'We can receive messages from a script', done => {
        const w = new Worker( testpath + 'messages-out.js' )
        w.on( 'message', data => {
            expect( data ).to.eql( { data : 'Test message' } )
            w.terminate() // necessary or test will not halt
            done()
        } )
    } )

    test( 'We can send messages from a script', done => {
        const w = new Worker( testpath + 'messages-in.js' )
        let numMessagesHeard = 0
        w.on( 'console.log', data => {
            if ( numMessagesHeard == 0 ) {
                expect( data ).to.be(
                    'message event heard message from main thread\n' )
                ++numMessagesHeard
            } else if ( numMessagesHeard == 1 ) {
                expect( data ).to.be(
                    'onmessage heard message from main thread\n' )
                w.terminate() // necessary or test will not halt
                done()
            }
        } )
        w.postMessage( 'message from main thread' )
    } )

} )

suite( 'Functions', () => {

    test( 'The Promise function exists and works in workers', done => {
        const w = new Worker( testpath + 'promise.js' )
        w.on( 'message', data => {
            expect( data ).to.eql( { data : 'Promises work!' } )
            w.terminate() // necessary or test will not halt
            done()
        } )
    } )

    test( 'The atob() and btoa() functions work in workers', done => {
        const w = new Worker( testpath + 'base64.js' )
        let numMessagesHeard = 0
        w.on( 'message', data => {
            if ( numMessagesHeard == 0 ) {
                expect( data ).to.eql(
                    { data : { result : 'SGVsbG8gV29ybGQh' } } )
                ++numMessagesHeard
            } else if ( numMessagesHeard == 1 ) {
                expect( data ).to.eql(
                    { data : { result : 'Hello World!' } } )
                w.terminate() // necessary or test will not halt
                done()
            }
        } )
        w.postMessage( { conversion : 'btoa', input : 'Hello World!' } )
        w.postMessage( { conversion : 'atob', input : 'SGVsbG8gV29ybGQh' } )
    } )

} )

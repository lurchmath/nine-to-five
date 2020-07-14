
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

    test( 'Interval and timeout functions are available in workers', done => {
        // See test/worker-scripts/timing.js for code that does the following:
        // 200ms from now:
        //   sends the message 'Repeating output'
        // 400ms from now:
        //   sends the message 'Repeating output'
        // 450ms from now:
        //   also sends the message 'One-time output'
        // Sends no other messages thereafter
        const w = new Worker( testpath + 'timing.js' )
        // We capture all output, like so:
        let output = [ ]
        w.on( 'message', data => output.push( data.data ) )
        // Verify no output has happened after only 100ms
        setTimeout( () => {
            expect( output ).to.eql( [ ] )
        }, 100 )
        // Verify first repeating output heard after 300ms, nothing else
        setTimeout( () => {
            expect( output ).to.eql( [ 'Repeating output' ] )
        }, 300 )
        // Verify two repeating outputs and one onoe-time output heard after
        // 500ms, nothing else
        setTimeout( () => {
            expect( output ).to.eql( [
                'Repeating output',
                'Repeating output',
                'One-time output'
            ] )
        }, 500 )
        // Verify the result is exactly the same at 700ms, and thus we can
        // terminate the worker and end this test.
        setTimeout( () => {
            expect( output ).to.eql( [
                'Repeating output',
                'Repeating output',
                'One-time output'
            ] )
            w.terminate()
            done()
        }, 700 )
    } )

} )

suite( 'Importing', () => {

    test( 'Workers can import other scripts', done => {
        const w = new Worker( testpath + 'importer.js' )
        // that imports another file that defines test_value and then posts it
        // for us to see; this will work only if the import succeeded.
        w.on( 'console.log', data => {
            expect( data ).to.eql( '12345\n' )
            w.terminate()
            done()
        } )
    } )

} )

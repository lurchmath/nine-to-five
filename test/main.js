
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

    test( 'Workers can terminate themselves with close()', done => {
        const w = new Worker( testpath + 'quit.js' )
        w.on( 'console.log', data => {
            expect( data ).to.be( 'You will see this output.\n' )
        } )
        setTimeout( () => {
            // If 250ms elapsed without the previous test failing, then we
            // conclude we're not going to see the second console.log(),
            // which is correct, because the worker close()d itself.
            // We do't need to terminate it, because it terminated itself.
            done()
        }, 250 )
    } )

    test( 'We can give workers names that they can see', done => {
        const w = new Worker( testpath + 'print-name.js', { name : 'Hank' } )
        w.on( 'console.log', data => {
            expect( data ).to.be( 'Hank\n' )
            w.terminate()
            done()
        } )
    } )

    test( 'Workers without names report them as undefined', done => {
        const w = new Worker( testpath + 'print-name.js' )
        w.on( 'console.log', data => {
            expect( data ).to.be( 'undefined\n' )
            w.terminate()
            done()
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

suite( 'Network', () => {

    test( 'Workers can make XMLHttpRequests', done => {
        const w = new Worker( testpath + 'xmlhttprequest.js' )
        // that file tries to get the main page from http://www.google.com.
        w.on( 'message', ( message, transfer ) => {
            // worker sends us the content of the page...just be sure there is
            // something there:
            expect( message.data.length ).to.be.greaterThan( 100 )
            w.terminate()
            done()
        } )
    } )

} )

suite( 'Parallelism', () => {

    test( 'A worker that computes for 0.5sec uses 0.5sec wall time', done => {
        const w = new Worker( testpath + 'seive.js' )
        w.postMessage( 500 ) // Tell it to run for 500ms
        // remember the starting time:
        const start = new Date().getTime()
        // The Worker is a 0.5sec-long Seive of Eratosthenes that ends us all
        // its primes when it's done.
        w.on( 'message', ( message, transfer ) => {
            const stop = new Date().getTime()
            expect( stop - start ).to.be.greaterThan( 500 ) // >= 0.5sec
            expect( message.data.length ).to.be.greaterThan( 100 ) // at least!
            expect( message.data.slice( 0, 10 ) ).to.eql(
                [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ] )
            w.terminate()
            done()
        } )
    } )

    test( '2 workers that compute for 0.5sec each don\'t use 1.0sec', done => {
        const w1 = new Worker( testpath + 'seive.js' )
        const w2 = new Worker( testpath + 'seive.js' )
        w1.postMessage( 500 ) // Tell it to run for 500ms
        w2.postMessage( 500 ) // Tell it to run for 500ms
        // remember the starting time:
        const start = new Date().getTime()
        // Same tests as last time, with two exceptions:
        let numResponsesHeard = 0
        const test = ( message, transfer ) => {
            const stop = new Date().getTime()
            expect( stop - start ).to.be.greaterThan( 500 ) // >= 0.5sec
            // No longer test to be sure that we got at least 100 primes,
            // because a machine with 1 CPU might do these in succession, and
            // so the second seive would stop as soon as it started.
            // But this time we do verify it was clearly less than 2 seconds:
            expect( stop - start ).to.be.lessThan( 750 ) // << 1.0sec
            if ( ++numResponsesHeard == 2 ) {
                w1.terminate()
                w2.terminate()
                done()
            }
        }
        // Install same test in both workers:
        w1.on( 'message', test )
        w2.on( 'message', test )
    } )

} )

suite( 'Early termination', () => {

    test( 'A worker set for 0.5sec but terminated early does less', done => {
        const w1 = new Worker( testpath + 'seive.js' )
        const w2 = new Worker( testpath + 'seive.js' )
        w1.postMessage( 250 ) // Tell it to run for 250ms
        w2.postMessage( 250 ) // Tell it to run for 250ms
        // Let w1 take its full 0.25sec.  Stop w2 much earlier.
        setTimeout( () => w2.terminate(), 100 )
        // We should hear from w1 when it completes.
        w1.on( 'message', ( message, transfer ) => {
            expect( message.data.length ).to.be.greaterThan( 100 )
            expect( message.data.slice( 0, 10 ) ).to.eql(
                [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ] )
            w1.terminate()
        } )
        // We should not hear from w2 at all; we'll wait 500ms.
        let heardFrom2 = false
        w2.on( 'message', () => { heardFrom2 = true } )
        setTimeout( () => {
            expect( heardFrom2 ).to.be( false )
            // no need to terminate w2; we already did 400ms ago.
            done()
        }, 500 )
    } )

} )


// import test tools
let expect = require( 'expect.js' )
let EventEmitter = require( 'events' )

// import this module
let { Worker } = require( '../index.js' )

suite( 'Main', () => {

    test( 'All required global functions and classes exist', () => {
        expect( Worker ).to.be.ok()
    } )

    test( 'We can construct worker instances', () => {
        const w1 = new Worker( 'a = 5' )
        expect( w1 ).to.be.a( Worker )
        expect( w1.script ).to.be( 'a = 5' )
        expect( w1.options ).to.eql( { } )
    } )

} )

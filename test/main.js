
// import test tools
let expect = require( 'expect.js' )

// import this module
let { Worker } = require( '../index.js' )

suite( 'Main', () => {

    test( 'Basics', () => {
        expect( Worker ).to.be.ok()
    } )

} )

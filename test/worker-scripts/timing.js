
// See test/main.js for documentation of what's going on here.
const i1 = setInterval( () => { postMessage( 'Repeating output' ) }, 200 )
const i2 = setTimeout( () => { postMessage( 'One-time output' ) }, 450 )
const i3 = setTimeout( () => { clearInterval( i1 ) }, 500 )
const i4 = setTimeout( () => { postMessage( 'This never happens' ) }, 600 )
const i5 = setTimeout( () => { clearTimeout( i4 ) }, 500 )

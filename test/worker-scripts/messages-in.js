
onmessage = ( ...args ) => {
    console.log( 'onmessage heard', ...args )
}

on( 'message', ( ...args ) => {
    console.log( 'message event heard', ...args )
} )


onmessage = ( message, transfer ) => {
    console.log( 'onmessage heard', message.data )
}

on( 'message', ( message, transfer ) => {
    console.log( 'message event heard', message.data )
} )

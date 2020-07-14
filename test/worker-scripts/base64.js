
onmessage = ( message, transfer ) => {
    const { conversion, input } = message.data
    postMessage( {
        result : conversion == 'atob' ? atob( input ) : btoa( input )
    } )
}


new Promise( ( resolve, reject ) => {
    resolve( 'Promises work!' )
} ).then( result => {
    postMessage( result )
} )


var xhr = new XMLHttpRequest()

xhr.onreadystatechange = function () {
    if ( this.readyState == 4 && this.status == 200 ) {
        postMessage( xhr.responseText )
    }
}

xhr.open( 'GET', 'http://www.google.com', true )
xhr.send()

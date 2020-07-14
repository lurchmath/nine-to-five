
// This script takes one second to execute.
// It sends back, at the end of that second, the primes it was able to
// compute (in a horribly inefficient way) during that time frame.

// Set up timing.
const now = () => new Date().getTime()
const start = now()
const stop = start + 1000 // ms

// Initialize seive of Eratosthenes
let seive = [ 2 ]

// Loop for one second
while ( now() < stop ) {

    // Look for the next prime...
    for ( let next = seive[seive.length-1] + 1 ; ; next++ ) {
        // Look for a divisor of the current candidate...
        let foundADivisor = false
        for ( const prime of seive ) {
            if ( next % prime == 0 ) {
                foundADivisor = true
                break
            }
        }
        // If we didn't find one, it's prime.
        if ( !foundADivisor ) {
            seive.push( next )
            break
        }
    }

}

// Report the primes I computed.
postMessage( seive )

// ----
// Dependencies
const path = require( 'path' );
const osu = require( 'node-os-utils' );
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;


// ---- 
// CPU Overload
let cpuOverload = 80;



notifyUser({
    title: 'CPU Overload',
    body: `CPU is over ${ cpuOverload }%`,
    icon: path.join( __dirname, 'img', 'icon.png' )
});


// ----
// Static Stats

// Set Model
document.querySelector( '#cpu-model' ).innerText = cpu.model();

// Computer Name
document.querySelector( '#comp-name' ).innerText = os.hostname();

// OS
document.querySelector( '#os' ).innerText = `${ os.type() } (${ os.arch() })`;

// Total Memory
mem.info().then(( info ) => {
    document.querySelector( '#mem-total' ).innerText = info.totalMemMb;
});


// ----
// Dynamic Stats / Interval
setInterval(() => {
    // CPU Usage
    cpu.usage().then(( info ) => {
        document.querySelector( '#cpu-usage' ).innerText = `${ info }%`;

        document.querySelector( '#cpu-progress' ).style.width = `${ info }%`;

        if ( info >= cpu.cpuOverload ) {
            console.log( 'is overload' );
            document.querySelector( '#cpu-progress' ).style.backgroundColor = 'red !important';
        } else {
            document.querySelector( '#cpu-progress' ).style.backgroundColor = '#30c88b';
        }
    });

    // CPU Free
    cpu.free().then(( info ) => {
        document.querySelector( '#cpu-free' ).innerText = `${ info }%`;
    });

    // Uptime
    document.querySelector( '#sys-uptime' ).innerText = SecondsToDHMS( os.uptime() );

}, 2000 );


// ----
// Show, days, hours, mins, and sec for uptime
function SecondsToDHMS( value ) {
    value = +value;

    const day = Math.floor( value / ( 3600 * 24 ));
    const hour = Math.floor(( value % ( 3600 * 24 )) / 3600 );
    const minutes = Math.floor(( value % 3600 ) / 60 );
    const seconds = Math.floor( value % 60 );

    return `${ day }d, ${ hour }h, ${ minutes }m, ${ seconds }s`;
}


// ----
// Notification
function notifyUser( options ) {
    new Notification( options.title, options );
}

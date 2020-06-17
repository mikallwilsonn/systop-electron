// ----
// Dependencies
const electron = require( 'electron' );
const path = require( 'path' );
const fs = require( 'fs' );


// ----
// Store Class
class Store {
    constructor( options ) {
        const userDataPath = ( electron.app || electron.remote.app ).getPath( 'userData' );

        this.path = path.join( userDataPath, options.configName + '.json' );

        this.data = parseDataFile( this.path, options.defaults );
    }   

    // Get Data
    get( key ) {
        return this.data[ key ];
    }

    // Set Data
    set( key, value ) {
        this.data[ key ] = value;

        fs.writeFileSync( this.path, JSON.stringify( this.data ));
    }
}


// -----
// Parse Data File
function parseDataFile( filePath, defaults ) {
    try {
        return JSON.parse( fs.readFileSync( filePath ));
    } catch ( error ) {
        return defaults;
    }
}


// ----
// Export
module.exports = Store;

var pg = require( 'pg' ),
	db = require( './db' );
	
exports.names = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	var names = [];
	
	var query = client.query( "SELECT name FROM neighborhoods WHERE name IS NOT NULL ORDER BY name" );
	
	query.on( 'row', function( result ) {
		names.push( result.name );
	})
	
	query.on( 'end', function() {
		res.send( names );
		client.end();
	});
}

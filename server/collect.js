var pg = require( 'pg' ),
	db = require( './db' );
	
exports.add = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	var queryString = "INSERT INTO neighborhood_collection ( name, uuid, confidence, comments, geom, tool_used ) VALUES( ";
	
	queryString += "'" + req.body.name + "', ";
	queryString += "'" + req.body.uuid + "', ";
	queryString += req.body.confidence + ", ";
	queryString += req.body.comments ? "'" + req.body.comments + "', " : "NULL, ";
	queryString += "ST_GeomFromGeoJSON( '" + req.body.geojson + "' ),";
	queryString += "'" + req.body.tool_used + "' )";
	
	var query = client.query( queryString );
	
	query.on( 'end', function() {
		res.send( req.body.name );
		client.end();
	});
}

exports.delete = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	var query = client.query( "DELETE FROM neighborhood_collection WHERE gid = ANY ( ARRAY ( SELECT gid FROM neighborhood_collection WHERE uuid = '" + req.params.uuid + "' AND name = '" + req.params.name + "' ORDER BY added DESC LIMIT 1 ) )" );
	
	query.on( 'end', function() {
		res.send( "DELETED" );
		client.end();
	})
}

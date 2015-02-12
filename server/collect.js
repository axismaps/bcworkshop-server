var pg = require( 'pg' ),
	db = require( './db' );
	
exports.add = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	var queryString = "INSERT INTO neighborhood_collection ( name, uuid, confidence, comments, geom ) VALUES( ";
	
	queryString += "'" + req.body.name + "', ";
	queryString += "'" + req.body.uuid + "', ";
	queryString += req.body.confidence + ", ";
	queryString += req.body.comments ? "'" + req.body.comments + "', " : "NULL, ";
	queryString += "ST_GeomFromGeoJSON( '" + req.body.geojson + "' ) )"
	
	console.log( queryString );
	
	var query = client.query( queryString );
	
	query.on( 'end', function()
	{
		res.send( "OK" );
		client.end();
	});
}
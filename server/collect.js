var pg = require( 'pg' ),
	conn = 'postgres://davidheyman@localhost/bcworkshop';
	
exports.add = function( req, res ) {
	var client = new pg.Client( conn );
	client.connect();
	
	console.log( req.body );
	
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
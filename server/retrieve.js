var pg = require( 'pg' ),
	dbgeo = require( 'dbgeo' ),
	db = require( './db' );
	
exports.neighborhoods = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	client.query( "SELECT id, name, ST_AsGeoJSON( geom ) AS geom FROM neighborhoods", function( error, result ) {
		dbgeo.parse({
		    "data": result.rows,
			"geometryColumn": "geom",
			"outputFormat": "topojson",
			"callback": function( error, result ) {
				if( error ) {
		    		    console.log( " --- error --- ", error);
				} else {
					res.send( result );
					client.end();
				}
		    }
		});
	});
}

exports.services = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	var services = [];
	
	var query = client.query( "SELECT organizations.* FROM neighborhoods INNER JOIN organization_lookup ON neighborhoods.id = neighborhood INNER JOIN organizations ON organizations.id = organization WHERE neighborhoods.id = '" + req.params.neighborhood + "'" );
	
	query.on( 'row', function( result ) {
		services.push( result );
	});
	
	query.on( 'end', function() {
		res.send( services );
		client.end();
	})
}

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

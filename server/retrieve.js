var pg = require( 'pg' ),
	_ = require( 'underscore' ),
	dbgeo = require( 'dbgeo' ),
	db = require( './db' );
	
exports.topojson = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	var fields = req.params.fields ? req.params.fields.split( "," ) : [ "gid" ];
	fields.push( "ST_AsGeoJSON( geom ) AS geom" );
	
	var order = fields.indexOf( 'area' ) == -1 ? 'gid' : 'area'
	
	var queryString = buildQuery( fields, req.params.table, req.params.where, order, 'DESC' );
	
	client.query( queryString, function( error, result ) {
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

exports.download = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	var fields = req.params.fields ? req.params.fields.split( "," ) : [ "id", "name", "description" ];
	fields.push( "ST_AsGeoJSON( geom ) AS geom" );
	
	var queryString = buildQuery( fields, "neighborhoods" )
	client.query( queryString, function( error, result ) {
		dbgeo.parse({
		    "data": result.rows,
			"geometryColumn": "geom",
			"outputFormat": "geojson",
			"callback": function( error, result ) {
				if( error ) {
					console.log( " --- error --- ", error);
				} else {
					var file = { "file" : result }
					res.set({ "Content-Disposition" : "attachment; filename=neighborhoods.geojson" });
					res.set({ "Content-type" : "application/vnd.geo+json" });
					res.send( file.file );
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
		
	var fields = req.params.fields ? req.params.fields.split( "," ) : [ "id", "name" ];
	var where = "name IS NOT NULL";
	if( req.params.id ) where += " AND id = " + req.params.id;
	
	var queryString = buildQuery( fields, "neighborhoods", where );
	var query = client.query( queryString );
	
	query.on( 'row', function( result ) {
		names.push( result );
	})
	
	query.on( 'end', function() {
		res.send( names );
		client.end();
	});
}

exports.template = function( req, res ) {
	var client = new pg.Client( db.conn );
	client.connect();
	
	var template = JSON.parse( req.body.json ),
		id = req.body.id,
		html = '';
	
	load_part( template.shift() );
		
	function load_part( part ) {		
		var data = [];
		var query = client.query( part.query + " WHERE neighborhoods.id = " + id );
		query.on( 'row', function( result ) {
			data.push( result );
		});
		query.on( 'end', function() {
			if ( data.length ) {
				html += part.header;
				html += _.reduce( data, function( s1, row ) {
					if ( row.type ) {
						var type = row.type.trim();
						return s1 + _.reduce( part.style, function( s2, item ) {
							if ( item.data == type ) {
								return s2 + item.format.replace( /\|\|data\|\|/g, row[ item.data ] );
							}
							else {
								return s2
							}
						}, '' )
					}
					else {
						return s1 + _.reduce( part.style, function( s2, item ) {
							if( row[ item.data ] ) {
								return s2 + item.format.replace( /\|\|data\|\|/g, row[ item.data ] );
							}
							else {
								return s2
							}
						}, '' )
					}
				}, '' );
				html += part.footer;
			}
			
			if( template.length ) {
				load_part( template.shift() );
			}
			else {
				complete();
			}
		});
	}
	
	function complete() {
		res.send( html );
		client.end();
	}
}

function buildQuery( fields, table, where, order, asc_desc ) {
	var queryString = "SELECT";
	
	queryString = _.reduce( fields, function( memo, field, i ) {
		if( i > 0 ) memo += ",";
		return memo += " " + field;
	}, queryString );
	
	queryString += " FROM " + table;
	if( where ) queryString += " WHERE " + where;
	
	if( order ) queryString += " ORDER BY " + order + " " + asc_desc;
	
	return queryString;
}

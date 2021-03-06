var express = require( 'express' ),
	bodyParser = require( 'body-parser' ),
    collect = require( './server/collect' ),
    retrieve = require( './server/retrieve' );

var app = express();

app.use( function( req, res, next )
{

    // Website you wish to allow to connect
    res.setHeader( 'Access-Control-Allow-Origin', '*' );

    // Request methods you wish to allow
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use( function(err, req, res, next) {
  console.error(err.stack);
  next(err);
});

app.use( function(err, req, res, next) {
  if (req.xhr) {
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
});

app.use( function(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
});

app.use(bodyParser.urlencoded({limit: 10000000}));

app.post( '/add', collect.add );
app.post( '/template', retrieve.template );
app.get( '/delete/:uuid/:name/:neighborhood', collect.delete );
app.get( '/topojson/:table/:fields?/:where?', retrieve.topojson );
app.get( '/names/:fields?/:id?', retrieve.names );
app.get( '/services/:neighborhood', retrieve.services );
app.get( '/download', retrieve.download);
app.get( '/process/:neighborhood', retrieve.process );
app.get( '/latlon/:lat/:lon', retrieve.latlon );

app.get( '*', function( req, res, next) {
	var err = new Error();
	err.status = 404;
	next(err);
});

app.use( function(err, req, res, next) {
  if( err.status !== 404) {
	  return next();
  }
  
  res.status(404);
  res.send(err.message || "You tried to go somewhere that doesn't exist or you didn't put parameters in correctly" );
});

var port = parseInt( process.argv[ 2 ], 10 );

app.listen( port );
console.log( 'Listening on port ' + port + '...' );

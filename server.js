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
app.get( '/delete/:uuid/:name', collect.delete );
app.get( '/neighborhoods', retrieve.neighborhoods );
app.get( '/names/:fields?/:id?', retrieve.names );
app.get( '/services/:neighborhood', retrieve.services );

app.listen( 3000 );
console.log( 'Listening on port 3000...' );

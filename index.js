var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

app.get('/mdb', function(request, response){

	var mongoose = require('mongoose');    

	var uri = 'mongodb://heroku_fdlmfnrq:c6ti573b1nncp2c7qig0s0ecff@ds153689.mlab.com:53689/heroku_fdlmfnrq';

	mongoose.Promise = global.Promise

	mongoose.connect(uri);

	var db = mongoose.connection;

	db.on('error', console.error.bind(console, 'connection error:'));

	db.once('open', function callback () {

	  // Create song schema
	  var songSchema = mongoose.Schema({
	    decade: String,
	    artist: String,
	    song: String,
	    weeksAtOne: Number
	  });

	  // Store song documents in a collection called "songs"
	  var Song = mongoose.model('songs', songSchema);

	  // Create seed data
	  var seventies = new Song({
	    decade: '1970s',
	    artist: 'Debby Boone',
	    song: 'You Light Up My Life',
	    weeksAtOne: 10
	  });

	  var eighties = new Song({
	    decade: '1980s',
	    artist: 'Olivia Newton-John',
	    song: 'Physical',
	    weeksAtOne: 10
	  });

	  var nineties = new Song({
	    decade: '1990s',
	    artist: 'Mariah Carey',
	    song: 'One Sweet Day',
	    weeksAtOne: 16
	  });

	  /*
	   * First we'll add a few songs. Nothing is required to create the 
	   * songs collection; it is created automatically when we insert.
	   */
	  var list = [seventies, eighties, nineties]
	  Song.insertMany(list);

	  /*
	   * Then we need to give Boyz II Men credit for their contribution
	   * to the hit "One Sweet Day".
	   */
	  Song.update({ song: 'One Sweet Day'}, { $set: { artist: 'Mariah Carey ft. Boyz II Men'} }, 
	    function (err, numberAffected, raw) {

	      if (err) return handleError(err);

	      /*
	       * Finally we run a query which returns all the hits that spend 10 or
	       * more weeks at number 1.
	       */
	      Song.find({ weeksAtOne: { $gte: 10} }).sort({ decade: 1}).exec(function (err, docs){

	        if(err) throw err;

	        docs.forEach(function (doc) {
	          console.log(
	            'In the ' + doc['decade'] + ', ' + doc['song'] + ' by ' + doc['artist'] + 
	            ' topped the charts for ' + doc['weeksAtOne'] + ' straight weeks.'
	          );
	        });

	        // Since this is an example, we'll clean up after ourselves.
	        //mongoose.connection.db.collection('songs').drop(function (err) {
	          //if(err) throw err;

	          // Only close the connection when your app is terminating
	          mongoose.connection.db.close(function (err) {
	            if(err) throw err;
	          //});
	        });
	      });
	    }
	  )
	});	

	response.send("Hello World");
});

var pg = require('pg');

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
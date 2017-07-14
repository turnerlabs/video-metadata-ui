'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mime = require('mime'),
    aws = require('aws-sdk'),
    mysql = require('mysql'),
    morgan = require('morgan'),
    s3 = new aws.S3(),
    bodyParser = require('body-parser'),
    healthcheck = process.env.HEALTHCHECK || '/hc',
    port = process.env.PORT || "8080",
    bucket = process.env.BUCKET,
    host = process.env.DB_ENDPOINT,
    user = process.env.DB_USERNAME,
    password = process.env.DB_PASSWORD,
    database = process.env.DB_NAME,
    app = express();

if (!bucket || !user || !password || !host) {
  console.log("Must Provide BUCKET.");
  console.log("Must Provide DB_ENDPOINT.");
  console.log("Must Provide DB_USERNAME.");
  console.log("Must Provide DB_PASSWORD.");
  console.log("Must Provide DB_NAME.");
  process.exit(1);
}

var con = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database : database
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get(healthcheck, hc);
app.use(morgan('tiny'));
app.get('/', root);
app.get('/stream/:video', stream);
app.get('/celebs/:video', query('AWSCelebResults', "Celebrities"));
app.get('/labels/:video', query('AWSLabelResults', "Labels"));

app.listen(port, function () {
    console.log('Video Metadat GUI is running on %s', port);
});

function hc(req, res) {
    var pkg = require('./package.json');
    res.json({ version: pkg.version });
}

function root(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
}

function stream(req, res, next) {
  let key = 'videos/' + req.params.video,
  params = {Bucket: bucket, Key: key};
  console.log(params)
  s3.headObject(params, function (err, data) {
        if (err) {
            // an error occurred
            console.error(err);
            return next();
        }
        var stream = s3.getObject(params).createReadStream();

        // forward errors
        stream.on('error', function error(err) {
            //continue to the next middlewares
            return next();
        });

        //Add the content type to the response (it's not propagated from the S3 SDK)
        res.set('Content-Type', mime.lookup(key));
        res.set('Content-Length', data.ContentLength);
        res.set('Last-Modified', data.LastModified);
        res.set('ETag', data.ETag);

        stream.on('end', () => {
            console.log('Served by Amazon S3: ' + key);
        });
        //Pipe the s3 object to the response
        stream.pipe(res);
    });
}

function query(table, key) {
  return (req, res, next) => {
    con.query('SELECT * FROM `' + table + '` WHERE `VideoName`="' + req.params.video + '" ORDER BY `Timestamp` LIMIT 1000', (err, result, fields) => {
      if (err) {
        console.log("ERROR =>", error)
        res.status(500).json({error: error, code: 500});
      }

      if (result.length === 0) {
        res.status(404).json({error: `No Results for Video: ${req.params.video}`, code: 404});
        return;
      }

      let objects = {};
      result.map((object) => {
        if (!objects[object.TimeStamp]) {
            objects[object.TimeStamp] = [];
        }

        objects[object.TimeStamp].push(object[key]);
      })

      res.json(objects);
    });
  }
}

// Restify server config here
var server = restify.createServer({
  name: 'restify-test',
  version: '1.0.0',
});

// ...

// Connect config here
var connectApp = connect()
    .use(connect.logger())
    .use(connect.bodyParser())
    .use(connect.query())
    .use(connect.cookieParser())
    // And this is where the magic happens
    .use("/api", function (req, res) {
             server.server.emit('request', req, res);
         });

connectApp.listen(8080);

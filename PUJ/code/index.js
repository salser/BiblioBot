'use strict';
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
var http = require('http');
const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context); };


//  /**
//   * Get port from environment and store in Express.
//   */

//  var port = normalizePort(process.env.PORT || '8085');
//  app.set('port', port);

//  /**
//   * Create HTTP server.
//   */

//  // var fs = require('fs');
//  // var hskey = fs.readFileSync('/etc/nginx/ssl/bibliobot.key');
//  // var hscert = fs.readFileSync('/etc/nginx/ssl/bibliobot.cer')
//  // var options = {
//  //     key: hskey,
//  //     cert: hscert
//  // };

//  // var credentials = {key: hskey, cert: hscert};

//  var server = http.createServer(/*credentials,*/ app);

//  /**
//   * Listen on provided port, on all network interfaces.
//   */

//  server.listen(port);
//  server.on('error', onError);
//  server.on('listening', onListening);

//  /**
//   * Normalize a port into a number, string, or false.
//   */

//  function normalizePort(val) {
//    var port = parseInt(val, 10);

//    if (isNaN(port)) {
//      // named pipe
//      return val;
//    }

//    if (port >= 0) {
//      // port number
//      return port;
//    }

//    return false;
//  }

//  /**
//   * Event listener for HTTP server "error" event.
//   */

//  function onError(error) {
//    if (error.syscall !== 'listen') {
//      throw error;
//    }

//    var bind = typeof port === 'string'
//      ? 'Pipe ' + port
//      : 'Port ' + port;

//    // handle specific listen errors with friendly messages
//    switch (error.code) {
//      case 'EACCES':
//        console.error(bind + ' requires elevated privileges');
//        process.exit(1);
//        break;
//      case 'EADDRINUSE':
//        console.error(bind + ' is already in use');
//        process.exit(1);
//        break;
//      default:
//        throw error;
//    }
//  }

//  /**
//   * Event listener for HTTP server "listening" event.
//   */

//  function onListening() {
//    var addr = server.address();
//    var bind = typeof addr === 'string'
//      ? 'pipe ' + addr
//      : 'port ' + addr.port;
//    console.log('Listening on ' + bind);
//  }

//  //app.listen(3000, () => console.log('[ChatBot] Webhook is listening'));

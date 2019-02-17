'use strict';
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context); };


//app.listen(3000, () => console.log('[ChatBot] Webhook is listening'));
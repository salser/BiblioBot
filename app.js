'use strict';

const {WebhookClient, Suggestion} = require('dialogflow-fulfillment');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

var express = require('express');
const app = express();
const router = express.Router();

router.use(compression());
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(awsServerlessExpressMiddleware.eventContext());

router.post('/', (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 

  function horarios(agent) {
    var biblioteca = agent.parameters.biblioteca;
    agent.add("Hola, soy bibliobot desde aws y voy a buscar el horario de la bilbioteca " + biblioteca);
  }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Horarios bibliotecas", horarios);
    agent.handleRequest(intentMap);
});

app.use('/', router);

module.exports = app;

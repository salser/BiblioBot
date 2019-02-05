'use strict';

const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

var express = require('express');
const app = express();
const router = express.Router();
const unirest = require("unirest");

router.use(compression());
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(awsServerlessExpressMiddleware.eventContext());

router.post('/webhooks/dialogflow', (request, response) => {
    const agent = new WebhookClient({ request, response });
    //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    //console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    var body = request.body;

    function welcome(agent) {
        agent.add(`Welcome to my agent on AWS Lambda!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    function horarios(agent) {
        let biblioteca = agent.parameters.biblioteca;
        agent.add("Hola, soy fullfilment y voy a buscar el horario de la bilbioteca " + biblioteca);
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set("Horarios bibliotecas", horarios);
    agent.handleRequest(intentMap);
});

app.use('/', router);

module.exports = app;



/*
var
    port = process.env.PORT || 3000;
app.listen(port);

console.log('Server started on: ' + port);
*/

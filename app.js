'use strict';

const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
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


  function schedules(agent) {
    var biblioteca = agent.parameters.biblioteca;
    agent.add("Hola Mundo9, soy bibliobot y voy a buscar el horario de la bilbioteca " + biblioteca);
  }

  function bookSearch(agent) {
    var book = JSON.stringify(agent.query);
    agent.add(book);
    //agent.add(book.includes('el libro'));
    /* if (book.includes('el libro')) {
      var splitter = JSON.stringify(book).split(" ");
      for (var i = 0; i < splitter.length; ++i) {
        agent.add(splitter[i]);
      }
    } else {
      agent.add('Si vas a preguntar por libros asegurate de preguntar "el libro <libro>"');
    } */
  }
  /*function bookSearch(agent) {
    var book = agent.parameters.libro;
    agent.add("el libro" + book);
    var splitter = JSON.stringify(book).split("'");
    if (undefined == splitter[1]) {
      agent.add("Puedes repetir el libro por favor entre comillas sencillas...")
    } else {
      agent.add(JSON.stringify(splitter));
      agent.add("Hola, soy bibliobot y voy a buscar el libro " + splitter[1]);
    }
  }*/


  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set("Horarios bibliotecas", schedules);
  intentMap.set('Busqueda Libros', bookSearch)
  agent.handleRequest(intentMap);
});

app.use('/', router);

module.exports = app;

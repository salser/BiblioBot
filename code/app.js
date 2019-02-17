'use strict';

const { WebhookClient, Suggestion, Card } = require('dialogflow-fulfillment');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

var express = require('express');
const app = express();
const router = express.Router();
const bibloredImgUrl = 'http://www.bogota.gov.co/sites/default/files/styles/large/public/field/image/logo-biblored-actualizado.jpg?itok=aiOgTXBa';

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
    agent.add("Hola, soy bibliobot y voy a buscar el horario de la bilbioteca " + biblioteca);
  }

  function bookSearch(agent) {
    var query = agent.query;
    /* agent.add("el libro es " + query);
    agent.add('EL LIBRO ES: ' + JSON.stringify(query)); */
    var strQuery = JSON.stringify(query);
    var queryType = -1;
    if (strQuery.includes('libro')) {
      queryType = 1;
    } else if (strQuery.includes('autor')) {
      queryType = 2;
    } else if (strQuery.includes('genero') || strQuery.includes('género') || strQuery.includes('tipo')) {
      queryType = 3;
    }
    if (1 === queryType) {
      var splitter = JSON.stringify(query).split("libro")[1].split(",");
      //agent.add("Hola bibliobot va a buscar el libro " + splitter[0] + "");

      agent.add('Bibliobot soy yo,');
      agent.add(new Card({
        title: 'Voy a buscar el libro en segundos vuelvo...',
        imageUrl: bibloredImgUrl,
        text: splitter[0] + ' 💁',
        buttonText: 'Echa un vistazo a biblored',
        buttonUrl: 'http://catalogo.biblored.gov.co/'
      })
      )
    } else {
      agent.add('Especifica que quieres buscar por ejemplo "Buscar el libro <libro>"')
    }

    //agent.add(JSON.stringify(book).includes('el libro'));
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

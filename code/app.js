'use strict';

const { WebhookClient, Suggestion, Card } = require('dialogflow-fulfillment');
const { dialogflow } = require('actions-on-google');
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

const appDialogFlow = dialogflow();

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
    var strQuery = JSON.stringify(query);
    if (strQuery.includes('libro')) {
      var splitter = JSON.stringify(query).split("libro")[1].split(",");
      agent.add('Bibliobot soy yo,');
      agent.add(new Card({
        title: 'Voy a buscar el libro en segundos vuelvo...',
        imageUrl: bibloredImgUrl,
        text: splitter[0] + ' 💁',
        buttonText: 'Echa un vistazo a biblored',
        buttonUrl: 'http://catalogo.biblored.gov.co/'
      })
      );
    } else {
      agent.add('Especifica que quieres buscar por ejemplo "Buscar el libro <libro>,"');
    }
  }

  function authorSearch(agent) {
    var query = agent.query;
    var strQuery = JSON.stringify(query);
    if (!strQuery.includes('ToM')) {
      if (strQuery.includes('autor')) {
        var splitter = JSON.stringify(query).split("autor")[1].split(",");
        agent.add('Bibliobot soy yo,');
        agent.add(new Card({
          title: 'Voy a buscar el libros con ese autor en segundos vuelvo...',
          imageUrl: bibloredImgUrl,
          text: splitter[0] + ' 💁',
          buttonText: 'Echa un vistazo a biblored',
          buttonUrl: 'http://catalogo.biblored.gov.co/'
        })
        );
      } else {
        agent.add('Especifica que quieres buscar por ejemplo "Buscar el autor <autor>,"');
      }
    } else {

    }

  }

  function search(agent) {
    agent.add('Que quieres buscar?');
    agent.add("Escoge...");
    /* agent.add(new Suggestion('Buscar libro ToM'));
    agent.add(new Suggestion('Buscar autor ToM'));
    agent.add(new Suggestion('Buscar género ToM')); */
    
  }


  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set("Horarios bibliotecas", schedules);
  intentMap.set('Busqueda Libros', bookSearch);
  intentMap.set('Busqueda Autor', authorSearch);
  intentMap.set('Busqueda Generico', search);
  agent.handleRequest(intentMap);
});

app.use('/', router);

module.exports = app;

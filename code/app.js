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
//router.use(awsServerlessExpressMiddleware.eventContext());

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
    var context = agent.context.get('book-search') ? "yes" : "no";
    agent.add(context);
    var query = agent.query;
    var strQuery = JSON.stringify(query);
    if (strQuery.includes('libro')) {
      var splitter = JSON.stringify(query).split("libro")[1].split(",");
      agent.add('Bibliobot soy yo,');
      agent.add(
        generateCard('Voy a buscar el libro en segundos vuelvo...',
          bibloredImgUrl,
          splitter[0] + ' 💁',
          'Echa un vistazo a biblored',
          'http://catalogo.biblored.gov.co/')
      );
    } else {
      agent.add('Especifica que quieres buscar por ejemplo "Buscar el libro <libro>,"');
    }
  }

  function specificBookSearch(agent) {
    var book = agent.parameters.book;
    agent.add('Bibliobot soy yo,');
    agent.add(
      generateCard('Voy a buscar el libro en segundos vuelvo...',
        bibloredImgUrl,
        book + ' 💁',
        'Echa un vistazo a biblored',
        'http://catalogo.biblored.gov.co/')
    );
  }

  function authorSearch(agent) {
    var query = agent.query;
    var strQuery = JSON.stringify(query);
    if (strQuery.includes('autor')) {
      var splitter = JSON.stringify(query).split("autor")[1].split(",");
      agent.add('Bibliobot soy yo,');
      agent.add(
        generateCard('Voy a buscar libros con ese autor, en segundos vuelvo...',
          bibloredImgUrl,
          splitter[0] + ' 💁',
          'Echa un vistazo a biblored',
          'http://catalogo.biblored.gov.co/')
      );
    } else {
      agent.add('Especifica que quieres buscar por ejemplo "Buscar el autor <autor>,"');
    }
  }

  function specificAuthSearch(agent) {
    var author = agent.parameters.author;
    agent.add('Bibliobot soy yo,');
    agent.add(
      generateCard('Voy a buscar libros con el siguiente autor, en segundos vuelvo...',
        bibloredImgUrl,
        author + ' 💁',
        'Echa un vistazo a biblored',
        'http://catalogo.biblored.gov.co/')
    );
  }

  function specificRequestEvent(agent) {
    var event = agent.parameters.request;
    agent.add('request: ' + request);
  }

  function searchBookGen(agent) {
    agent.add('¿Cuál Libro?');
  }

  function searchAuthGen(agent) {
    agent.add('¿Cuál Autor?');
  }

  function requestEventGen(agent) {
    agent.add('Qué Evento?');
  }

  function welcome(agent) {
    //if (agent.requestSource === agent.TELEGRAM) {
    agent.add('Escoge una opción...');
    var x = Math.floor((Math.random() * 2) + 1);
    switch (x) {
      case 1:
        agent.add('Hola, soy blibliobot en que te puedo ayudar?');
        addQuestions(agent);
        break;
      case 2:
        agent.add('Qué hay de nuevo? Soy bibliobot, alguna consulta el día de hoy?');
        addQuestions(agent);
        break;
    }
  }


  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Saludo', welcome);

  intentMap.set('Buscar Libro Gen', searchBookGen);
  intentMap.set('Buscar Libro Guiado', specificBookSearch);
  intentMap.set('Busqueda Libros', bookSearch);

  intentMap.set('Buscar Autor Gen', searchAuthGen);
  intentMap.set('Buscar Autor Guiado', specificAuthSearch);
  intentMap.set('Busqueda Autor', authorSearch);

  intentMap.set('Consulta Eventos Gen', requestEventGen);
  intentMap.set('Consulta Eventos Guiado', specificRequestEvent);

  intentMap.set("Horarios bibliotecas", schedules);

  agent.handleRequest(intentMap);
});

function addQuestions(agent) {
  agent.add(new Suggestion('Búsqueda Libro ToM'));
  agent.add(new Suggestion('Búsqueda Autor ToM'));
  agent.add(new Suggestion('Búsqueda Género ToM'));
  agent.add(new Suggestion('Consulta Eventos ToM'));
}

function generateCard(title, image, text, buttonText, buttonUrl) {
  return new Card({
    title: title,
    imageUrl: image,
    text: text,
    buttonText: buttonText,
    buttonUrl: buttonUrl
  });
}

app.use('/', router);

module.exports = app;

/* var port = 4300;
app.listen(port);

console.log('Server started on: ' + port); */


/*
var
    port = process.env.PORT || 3000;
    */


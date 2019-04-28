'use strict';

const { WebhookClient, Suggestion, Card } = require('dialogflow-fulfillment');
const { dialogflow } = require('actions-on-google');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const AUTHOR_SEARCH = 1;
const BOOK_SEARCH = 2;
const GENERIC_SEARCH = 3;
const LIBRARY_SEARCH = 4;
const ELASTIC_URL = 'http://157.230.165.149:9200';
var unirest = require('unirest');
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
    //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    //console.log('Dialogflow Request body: ' + JSON.stringify(request.body.originalDetectIntentRequest.payload.data.message.chat.first_name));

    let userName;
    if (request.body.originalDetectIntentRequest.payload.data != undefined) {
        userName = (request.body.originalDetectIntentRequest.payload.data.message.chat.first_name);
    } else {
        userName = '';
    }


    function welcome(agent) {
        //if (agent.requestSource === agent.TELEGRAM) {
        agent.add('Escoge una opción...');
        var x = Math.floor((Math.random() * 2) + 1);
        switch (x) {
            case 1:
                agent.add('Hola ' + userName + ', soy blibliobot en que te puedo ayudar?');
                addQuestions(agent);
                break;
            case 2:
                agent.add('Qué hay de nuevo ' + userName + '? Soy bibliobot, alguna consulta el día de hoy?');
                addQuestions(agent);
                break;
        }
    }

    async function schedules(agent) {
        var biblioteca = agent.parameters.biblioteca;
        var result = await consultar(biblioteca, agent, LIBRARY_SEARCH);
        var res = JSON.parse(result);
        res = JSON.parse(res);
        var array = res['hits']['hits'];
        if (array.length <= 0) {
            agent.add('no se encontraron resultados de ' + book);
        } else {
            for (let i = 0; i < array.length; i++) {
                if (i < 1) {
                    const element = array[i];
                    var lib = element['_source'];
                    agent.add(
                        '*NOMBRE:* ' + lib['BIBLIOTECA'] + '\n' +
                        '*HORARIO:* \n' +
                        '\tLUN: ' + lib['lunes'] + '\n' +
                        '\tMAR: ' + lib['martes'] + '\n' +
                        '\tMIE: ' + lib['miercoles'] + '\n' +
                        '\tJUE: ' + lib['jueves'] + '\n' +
                        '\tVIE: ' + lib['viernes'] + '\n' +
                        '\tSAB: ' + lib['sabado'] + '\n' +
                        '\tDOM: ' + lib['domingo'] + '\n' + 
                        '*DIRECCIÒN:* ' + lib['DIRECCION'] + '\n' + 
                        '*ZONA: *' + lib['ZONA'] + '\n' +
                        '*LOCALIDAD: *' + lib['LOCALIDAD'] + '\n' + 
                        '*TELÈFONO:* ' + lib['TEL']
                    );
                }
            }
        }
    }

    async function searchBook(agent) {
        var book = agent.parameters.libro;
        //agent.add(book);
        var result = await consultar(book, agent, BOOK_SEARCH);
        var res = JSON.parse(result);
        res = JSON.parse(res);
        //console.log(res);
        console.log(res);
        var array = res['hits']['hits'];
        if (array.length <= 0) {
            agent.add('no se encontraron resultados de ' + book);
        } else {
            for (let i = 0; i < array.length; i++) {
                if (i < 3) {
                    const element = array[i];
                    var book = element['_source'];
                    agent.add('*LIBRO:*' + book['TITULO'] + '\n' +
                        '*AUTOR:*' + book['AUTOR'] + '\n' +
                        '*BIBLIOTECA:*' + book['BIBLIOTECA '] + '\n' +
                        '*COPIAS:*' + book['CANT']
                    );
                }
            }
        }
    }

    async function searchAuthor(agent) {
        var author = agent.parameters.autor;
        //agent.add(autor);
        var result = await consultar(author, agent, AUTHOR_SEARCH);
        var res = JSON.parse(result);
        res = JSON.parse(res);
        //console.log(res);
        console.log(res);
        var array = res['hits']['hits'];
        if (array.length <= 0) {
            agent.add('no se encontraron resultados de ' + author);
        } else {
            for (let i = 0; i < array.length; i++) {
                if (i < 3) {
                    const element = array[i];
                    var book = element['_source'];
                    agent.add('*LIBRO:*' + book['TITULO'] + '\n' +
                        '*AUTOR:*' + book['AUTOR'] + '\n' +
                        '*BIBLIOTECA:*' + book['BIBLIOTECA '] + '\n' +
                        '*COPIAS:*' + book['CANT']
                    );
                }
            }
        }
    }


    function searchCalendar(agent) {
        agent.add('searching in calendar...');
        //consume events biblored canlendar
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();

    intentMap.set("BuscarLibro", searchBook);
    intentMap.set("BuscarAutor", searchAuthor);
    intentMap.set("BuscarCalendario", searchCalendar);
    intentMap.set('Default Welcome Intent', welcome);

    intentMap.set("Horarios bibliotecas", schedules);

    agent.handleRequest(intentMap);
});

function addQuestions(agent) {
    agent.add(new Suggestion('Buscar libro'));
    agent.add(new Suggestion('Buscar Autor'));
    agent.add(new Suggestion('Buscar Género'));
    //agent.add(new Suggestion('Consulta Eventos ToM'));
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

function consultar(text, agent, type) {
    console.log("Consultando...");

    return new Promise((resolve) => {
        console.log(text);
        console.log("Entrando a promesa....");
        var url = '';
        switch (type) {
            case AUTHOR_SEARCH:
                agent.add('Buscando Libros por autor: ' + text + '...');
                url = ELASTIC_URL + '/libros/libro/_search?' + 'q=AUTOR:' + text;
                break;
            case BOOK_SEARCH:
                agent.add('Buscando Libros por titulo: ' + text + '...');
                url = ELASTIC_URL + '/libros/libro/_search?' + 'q=TITULO:' + text;
                break;
            case GENERIC_SEARCH:
                agent.add('Buscando Libros: ' + text + '...');
                url = ELASTIC_URL + '/libros/libro/_search?' + 'q:' + text;
                break;
            case LIBRARY_SEARCH:
                url = ELASTIC_URL + '/bibliotecasbiblored/biblioteca/_search?q=' + text;
                break;
        }

        unirest.get(url)
            .send()
            .end(function (response) {
                //console.log("Envia R:",response['raw_body']);
                resolve(JSON.stringify(response['raw_body']));
            });

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


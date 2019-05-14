'use strict';

const { WebhookClient, Suggestion, Card } = require('dialogflow-fulfillment');
const { dialogflow } = require('actions-on-google');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

/** GOOGLE CALENDAR */
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');


const AUTHOR_SEARCH = 1;
const BOOK_SEARCH = 2;
const GENERIC_SEARCH = 3;
const LIBRARY_SEARCH = 4;
const CALENDAR_SEARCH = 5;
const ELASTIC_URL = 'http://157.230.165.149:9200';
const SEARCH_PATH = '/javerianalibros/javerianalibro/_search?';
const CALENDAR_PATH = '/calendarioprueba5/_search?';
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
    /* if (request.body.originalDetectIntentRequest.payload.data != undefined) {
        userName = (request.body.originalDetectIntentRequest.payload.data.message.chat.first_name);
    } else {
        userName = '';
    } */


    function welcome(agent) {
        //if (agent.requestSource === agent.TELEGRAM) {
        agent.add('Escoge una opción...');
        var x = Math.floor((Math.random() * 2) + 1);
        switch (x) {
            case 1:
                agent.add('Hola ' /* + userName */ + ', soy blibliobot-puj en que te puedo ayudar?');
                addQuestions(agent);
                break;
            case 2:
                agent.add('Qué hay de nuevo ' /* + userName */ + '? Soy bibliobot-puj, alguna consulta el día de hoy?');
                addQuestions(agent);
                break;
        }
    }

    async function searchBook(agent) {
        var book = agent.parameters.libro;
        //agent.add(book);
        var result = await consultar(book, agent, BOOK_SEARCH, "");
        var res = JSON.parse(result);
        res = JSON.parse(res);
        var array = res['hits']['hits'];
        if (array.length <= 0) {
            agent.add('no se encontraron resultados de ' + book);
        } else {
            for (let i = 0; i < array.length; i++) {
                if (i < 5) {
                    const element = array[i];
                    var book = element['_source'];
                    addBook2Agent(agent, book);
                }
            }
        }
    }

    async function searchAuthor(agent) {
        var author = agent.parameters.autor;
        //agent.add(autor);
        var result = await consultar(author, agent, AUTHOR_SEARCH, "");
        var res = JSON.parse(result);
        res = JSON.parse(res);
        var array = res['hits']['hits'];
        if (array.length <= 0) {
            agent.add('no se encontraron resultados de ' + author);
        } else {
            for (let i = 0; i < array.length; i++) {
                if (i < 5) {
                    const element = array[i];
                    var book = element['_source'];
                    addBook2Agent(agent, book);
                }
            }
        }
    }

    async function searchCalendar(agent) {
        agent.add('searching in calendar...');
        var date = agent.parameters.fecha;
        var dateObj = new Date(date);
        var strDate = dateObj.getFullYear() + "-" + (dateObj.getMonth() + 1) + "-" + dateObj.getDate();
        var hour = agent.parameters.hora;
        if (hour) {
            console.log(hour);
            var obj = new Date(hour);
            //var formattedNumber = ("0" + myNumber).slice(-2);
            var txtHR = ("0" + (obj.getHours() - 5)).slice(-2) + '-' + ("0" + obj.getMinutes()).slice(-2) + '-' + ("0" + obj.getSeconds()).slice(-2);
            strDate += " " + txtHR;
        }
        var type = "";
        if (agent.parameters.evento) {
            type = agent.parameters.evento;
        }
        agent.add(strDate);
        //ADD 
        console.log(strDate);
        var result = await consultar(strDate, agent, CALENDAR_SEARCH, type);
        var res = JSON.parse(result);
        res = JSON.parse(res);
        console.log(res);
        if (res['hits']) {
            var array = res['hits']['hits'];
            if (array.length <= 0) {
                agent.add('no se encontraron resultados en la fecha ' + strDate);
            } else {
                for (let i = 0; i < array.length; i++) {
                    if (i < 3) {
                        const element = array[i];
                        var event = element['_source'];
                        addEvent2Agent(agent, event);
                    }
                }
            }
        } else {
            agent.add('no se encontraron resultados en la fecha ' + strDate);
        }
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();

    intentMap.set("BuscarLibro", searchBook);
    intentMap.set("BuscarAutor", searchAuthor);
    intentMap.set("BuscarCalendario", searchCalendar);
    intentMap.set('Default Welcome Intent', welcome);

    agent.handleRequest(intentMap);
});

function addEvent2Agent(agent, event) {
    var des = '',
        site = '',
        date = '',
        resume = '',
        status = '';
    if (event['descripcion']) {
        var replaceStr = '*DESCRIPCIÓN:* ' + event['descripcion']
            .replace(/<br><br>/g, '\n')
            .replace(/<br>/g, '\n')
            .replace(/<br>/g, '')
            .replace(/\"/g, '')
            .replace(/<a/g, '')
            .replace(/href=/g, '')
            .replace(/id=(.*?)>aquí/g, '')
            .replace(/<(.*?)>/g, '')
            .replace(/target=_blank>aquí/g, '')
            .replace(/&nbsp;/g, '')
            .replace(/>aquí/g, '');
        des = replaceStr + '\n';
    }
    if (event['lugar']) {
        site = '*LUGAR:* ' + event['lugar'] + '\n';
    }
    if (event['inicio']) {
        date = '*FECHA:* ' + event['inicio'] + '\n';
    }
    if (event['resumen']) {
        resume = '*RESUMEN:* ' + event['resumen'] + '\n';
    }
    if (event['status']) {
        status = '*ESTADO:* ' + event['status'] + '';
    }
    agent.add(
        date +
        site +
        des +
        resume +
        status
    );
}

function addBook2Agent(agent, book) {
    var libro = '',
        autor = '',
        adi = '',
        cop = '',
        cat = '',
        ubi = '',
        cod = '',
        ed = '';
    if (book['LIBRO']) {
        libro = '*LIBRO:* ' + book['LIBRO'] + '\n';
    }
    if (book['AUTOR']) {
        autor = '*AUTOR:* ' + book['AUTOR'] + '\n';
    }
    if (book['ADICIONAL']) {
        adi = '*ADICIONAL:* ' + book['ADICIONAL'] + '\n';
    }
    if (book['Copia']) {
        cop = '*COPIAS:* ' + book['Copia'] + '\n';
    }
    if (book['Cat. 1']) {
        cat = '*CATEGORÍA:* ' + book['Cat. 1'] + '\n';
    }
    if (book['No. De Ubicación'] || book['Ubicación Habitual']) {
        ubi =
            '*UBICACIÒN:* ' + '\n' +
            book['No. De Ubicación'] + '\n' +
            book['Ubicación Habitual'] + '\n';
    }
    if (book['Código ID']) {
        cod = '*CÓDIGO:* ' + book['Código ID'] + '\n';
    }
    if (book['Edición']) {
        ed = '*EDICIÓN:* ' + book['Edición'] + '\n';
    }
    agent.add(
        libro +
        autor +
        adi +
        cop +
        cat +
        ubi +
        cod +
        ed
    );
}

function addQuestions(agent) {
    agent.add(new Suggestion('Buscar libro'));
    agent.add(new Suggestion('Buscar Autor'));
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

function consultar(text, agent, type, event) {

    return new Promise((resolve) => {
        console.log('in promise')
        var url = '';
        switch (type) {
            case AUTHOR_SEARCH:
                agent.add('Buscando Libros por autor: ' + text + '...');
                url = ELASTIC_URL + SEARCH_PATH + 'q=AUTOR:' + text;
                break;
            case BOOK_SEARCH:
                agent.add('Buscando Libros por titulo: ' + text + '...');
                url = ELASTIC_URL + SEARCH_PATH + 'q=LIBRO:' + text;
                break;
            case GENERIC_SEARCH:
                agent.add('Buscando Libros: ' + text + '...');
                url = ELASTIC_URL + SEARCH_PATH + 'q:' + text;
                break;
            case CALENDAR_SEARCH:
                if (event != "") {
                    agent.add('Buscando eventos: ' + text + ' y evento ' + event + '...');
                    url = ELASTIC_URL + CALENDAR_PATH + 'q=resumen:' + event + 'inicio:' + text;
                } else {
                    agent.add('Buscando eventos: ' + text + '...');
                    url = ELASTIC_URL + CALENDAR_PATH + 'q=inicio:' + text;
                }
                break;

        }

        unirest.get(url)
            .send()
            .end(function(response) {
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
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
const GENRE_SEARCH = 5;
const CALENDAR_SEARCH = 6;
const BOOK_SEARCH_URL = '/librosbiblored/_search?';
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
                agent.add('Hola' /* + userName */ + ', soy blibliobot de biblored en que te puedo ayudar?');
                addQuestions(agent);
                break;
            case 2:
                agent.add('Qué hay de nuevo ' /* + userName */ + '? Soy bibliobot de biblored, alguna consulta el día de hoy?');
                addQuestions(agent);
                break;
        }
    }

    async function schedules(agent) {
        var biblioteca = agent.parameters.biblioteca;
        var result = await consultar(biblioteca, '', '', '', agent, LIBRARY_SEARCH);
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
        var result = await consultar(book, '', '', '', agent, BOOK_SEARCH);
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
                    addBook2Agent(book, agent);
                }
            }
        }
    }

    async function searchAuthor(agent) {
        var author = agent.parameters.autor;
        //agent.add(autor);
        var result = await consultar(author, '', '', '', agent, AUTHOR_SEARCH);
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
                    addBook2Agent(book, agent);
                }
            }
        }
    }

    async function searchGenre(agent) {
        var gen = agent.parameters.genero;
        var result = await consultar(gen, '', '', '', agent, GENRE_SEARCH);
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
                    addBook2Agent(book, agent);
                }
            }
        }
    }


    async function searchCalendar(agent) {
        var date = agent.parameters.fecha;
        var dateObj = new Date(date);
        var yearN = (dateObj.getFullYear());
        var year = (yearN + '').length == 1 ? '0' + '' + yearN : yearN;
        var mon = (dateObj.getMonth() + 1);
        var month = (mon + '').length == 1 ? '0' + '' + mon : mon;
        var dia = (dateObj.getDate());
        var day = (dia + '').length == 1 ? '0' + '' + dia : dia;
        var strDate = year + "-" + month + "-" + day;
        var hour = "";
        if (agent.parameters.hora) {
            //console.log(hour);
            var obj = new Date(agent.parameters.hora);
            //var formattedNumber = ("0" + myNumber).slice(-2);
            var hourN = (obj.getHours() - 5);
            var horas = (hourN + '').length == 1 ? '0' + '' + hourN : hourN;
            var min = (obj.getMinutes());
            var minutes = (min + '').length == 1 ? '0' + '' + min : min;
            var sec = (obj.getSeconds());
            var seconds = (sec + '').length == 1 ? '0' + '' + sec : sec;
            var txtHR = ("0" + (obj.getHours() - 5)).slice(-2) + '-' + ("0" + obj.getMinutes()).slice(-2) + '-' + ("0" + obj.getSeconds()).slice(-2);
            hour = txtHR;
            console.log("the hour: " + obj.toDateString());
        }
        var type = "";
        if (agent.parameters.evento) {
            type = agent.parameters.evento;
        }
        var lib = agent.parameters.biblioteca;

	agent.add('Buscando eventos en la ' + lib + ' el día ' + strDate + '__' + hour + ' ' + type);
        //ADD 
        var result = await consultar(strDate, type, hour, lib, agent, CALENDAR_SEARCH);
        var res = JSON.parse(result);
        res = JSON.parse(res);
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
    intentMap.set("BuscarGenero", searchGenre);
    intentMap.set('Default Welcome Intent', welcome);

    intentMap.set("Horarios bibliotecas", schedules);

    agent.handleRequest(intentMap);
});

function addEvent2Agent(agent, event) {
    var desc = '',
        date = '',
        resume = '',
        mision = '',
        lib = '',
        hour = '',
        title = '';
    if (event['descripcion_larga']) {
        var replaceStr = '*DESCRIPCIÓN:* ' + event['descripcion_larga']
            .replace(/<br>/g, '\n')
            .replace(/<p>/g, '')
            .replace(/<\/p>|&nbsp;/g, ' ');
        desc = replaceStr + '\n';
    }
    if (event['fecha_evento']) {
        date = '*FECHA:* ' + event['fecha_evento'] + '\n';
    }
    if (event['hora_inicio']) {
        hour = '*HORA:* ' + event['hora_inicio'].replace(/-/g, ':') + '\n';
    }
    if (event['descripcion_corta']) {
        resume = '*RESUMEN:* ' + event['descripcion_corta'] + '\n';
    }
    if (event['titulo']) {
        title = '*TÍTULO:* ' + event['titulo'] + '\n';
    }
    if (event['linea_misional']) {
        mision = '*TEMA:* ' + event['linea_misional'] + '\n';
    }
    if (event['nombre_biblioteca']) {
        lib = '*BIBLIOTECA:* ' + event['nombre_biblioteca'].replace(/[0-9]/g, '').replace(/-/g, '');
    }
    agent.add(
        title +
        desc +
        resume +
        date +
        hour +
        mision +
        lib
    );
}

function addBook2Agent(book, agent) {
    var ed = '',
        isbn = '',
        desc = '',
        aut = '',
        barcode = '',
        desc2 = '',
        cat = '',
        matType = '',
        price = '',
        library = '',
        title = '';
    if (book['Publisher']) {
        ed = '*EDITOR:* ' + book['Publisher'] + '\n';
    }
    console.log(book['Publisher']);
    if (book['ISBN']) {
        isbn = '*ISBN:* ' + book['ISBN'] + '\n';
    }
    console.log(book['ISBN']);
    if (book['Description']) {
        desc = '*DESCRIPCIÓN:* ' + book['Description'] + '\n';
    }
    console.log(book['Description']);
    if (book['Author']) {
        aut = '*AUTOR:* ' + book['Author'] + '\n';
    }
    console.log(book['Author']);
    if (book['Barcode']) {
        barcode = '*CÓDIGO DE BARRAS:* ' + book['Barcode'];
    }
    console.log(book['Barcode']);
    if (book['Desc8']) {
        desc2 = '*ADICIONAL:* ' + book['Desc8'] + '\n';
    }
    console.log(book['Desc8']);
    if (book['Sec Call No Desc']) {
        cat = '*GÉNERO:* ' + book['Sec Call No Desc'] + '\n';
    }
    console.log(book['Sec Call No Desc']);
    if (book['Material Type Desc']) {
        matType = '*TIPO:* ' + book['Material Type Desc'] + '\n';
    }
    console.log(book['Material Type Desc']);
    if (book['ItemPrice']) {
        price = '*PRECIO:* ' + book['ItemPrice'] + '\n';
    }
    console.log(book['ItemPrice']);
    if (book['Current Sub Library Desc']) {
        library = '*BIBLIOTECA:* ' + book['Current Sub Library Desc'] + '\n';
    }
    console.log(book['Current Sub Library Desc']);
    if (book['Titulo']) {
        title = '*TÍTULO:* ' + book['Titulo'] + '\n';
    }
    console.log(book['Titulo']);
    agent.add(
        title +
        aut +
        ed +
        desc +
        desc2 +
        library +
        isbn +
        price +
        cat +
        matType +
        barcode
    );
}

function addQuestions(agent) {
    agent.add(new Suggestion('Buscar libro'));
    agent.add(new Suggestion('Buscar Autor'));
    agent.add(new Suggestion('Buscar Género'));
    agent.add(new Suggestion('Buscar Eventos'));
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

function consultar(text, event, hour, lib, agent, type) {
    console.log("Consultando...");

    return new Promise((resolve) => {
        console.log(text);
        console.log("Entrando a promesa....");
        var url = '';
        switch (type) {
            case AUTHOR_SEARCH:
                agent.add('Buscando Libros por autor: ' + text + '...');
                url = ELASTIC_URL + BOOK_SEARCH_URL + 'q=Author:' + text;
                break;
            case BOOK_SEARCH:
                agent.add('Buscando Libros por titulo: ' + text + '...');
                url = ELASTIC_URL + BOOK_SEARCH_URL + 'q=Titulo:' + text;
                break;
            case GENERIC_SEARCH:
                agent.add('Buscando Libros: ' + text + '...');
                url = ELASTIC_URL + BOOK_SEARCH_URL + 'q:' + text;
                break;
            case GENRE_SEARCH:
                agent.add('Buscando libros del género: ' + text);
                url = ELASTIC_URL + BOOK_SEARCH_URL + 'q=Sec Call No Desc:' + text;
                break;
            case LIBRARY_SEARCH:
                url = ELASTIC_URL + '/bibliotecasbiblored/biblioteca/_search?q=' + text;
                break;
            case CALENDAR_SEARCH:
		var searching = '';
                var sHour = '',
                    sEvent = '';
		searching += lib + ' ' + text + ' ';
                if (hour != '') {
                    searching += hour;
                }
                if (event != '') {
                    sEvent = '%20descripcion_larga:' + event;
                }
                url = ELASTIC_URL +
                    '/calendariobiblored/_search?q=nombre_biblioteca:' + searching +
                    sEvent;
                break;
        }
        console.log(url);
        unirest.get(url)
            .send()
            .end(function(response) {
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

// 'use strict';

// const { WebhookClient, Suggestion, Card } = require('dialogflow-fulfillment');
// const { dialogflow } = require('actions-on-google');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const compression = require('compression');
// const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// /** GOOGLE CALENDAR */
// const fs = require('fs');
// const readline = require('readline');
// const { google } = require('googleapis');

// async function searchInCalendarGoogle(agent) {
//   // Load client secrets from a local file.
//   fs.readFile('credentials.json', (err, content) => {
//     if (err) return console.log('Error loading client secret file:', err);
//     var credentials = JSON.parse(content);
//     // Authorize a client with credentials, then call the Google Calendar API.
//     const { client_secret, client_id, redirect_uris } = credentials.installed;
//     const oAuth2Client = new google.auth.OAuth2(
//       client_id, client_secret, redirect_uris[0]);

//     // Check if we have previously stored a token.
//     fs.readFile(TOKEN_PATH, (err, token) => {
//       if (err) return getAccessToken(oAuth2Client, callback, agent);
//       oAuth2Client.setCredentials(JSON.parse(token));
//       const calendar = google.calendar({ version: 'v3', oAuth2Client });
//       return calendar.events.list({
//           calendarId: 'primary',
//           timeMin: (new Date()).toISOString(),
//           maxResults: 10,
//           singleEvents: true,
//           orderBy: 'startTime',
//         }, (err, res) => {
//           if (err) return console.log('The API returned an error: ' + err);
//           const events = res.data.items;
//           if (events.length) {
//             console.log("last 10 events")
//             agent.add('Upcoming 10 events:');
//             events.map((event, i) => {
//               const start = event.start.dateTime || event.start.date;
//               agent.add(`${start} - ${event.summary}`);
//               console.log(`${start} - ${event.summary}`);
//             });
//           } else {
//             agent.add("no events");
//           }
//         });
//     });
//   });
// }

// // If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// // The file token.json stores the user's access and refresh tokens, and is
// // created automatically when the authorization flow completes for the first
// // time.
// const TOKEN_PATH = 'token.json';



// // FUNCTIONS

// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback, agent) {
//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(
//     client_id, client_secret, redirect_uris[0]);

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     //if (err) return getAccessToken(oAuth2Client, callback, agent);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     return callback(oAuth2Client, agent);
//   });
// }

// /**
//  * Lists the next 10 events on the user's primary calendar.
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */
// function listEvents(auth, agent) {
  
// }

// /** END GOOGLE CALENDAR */


// const AUTHOR_SEARCH = 1;
// const BOOK_SEARCH = 2;
// const GENERIC_SEARCH = 3;
// const ELASTIC_URL = 'http://157.230.165.149:9200/libros/libro/_search?';
// var unirest = require('unirest');
// var express = require('express');
// const app = express();
// const router = express.Router();
// const bibloredImgUrl = 'http://www.bogota.gov.co/sites/default/files/styles/large/public/field/image/logo-biblored-actualizado.jpg?itok=aiOgTXBa';

// router.use(compression());
// router.use(cors());
// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));
// router.use(awsServerlessExpressMiddleware.eventContext());

// const appDialogFlow = dialogflow();

// router.post('/', (request, response) => {
//   const agent = new WebhookClient({ request, response });
//   //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
//   //console.log('Dialogflow Request body: ' + JSON.stringify(request.body.originalDetectIntentRequest.payload.data.message.chat.first_name));

//   let userName;
//   if (request.body.originalDetectIntentRequest.payload.data != undefined) {
//     userName = (request.body.originalDetectIntentRequest.payload.data.message.chat.first_name);
//   } else {
//     userName = '';
//   }


//   function welcome(agent) {

//     //if (agent.requestSource === agent.TELEGRAM) {
//     agent.add('Escoge una opción...');
//     var x = Math.floor((Math.random() * 2) + 1);
//     switch (x) {
//       case 1:
//         agent.add('Hola ' + userName + ', soy blibliobot en que te puedo ayudar?');
//         addQuestions(agent);
//         break;
//       case 2:
//         agent.add('Qué hay de nuevo ' + userName + '? Soy bibliobot, alguna consulta el día de hoy?');
//         addQuestions(agent);
//         break;
//     }
//   }

//   function schedules(agent) {
//     var biblioteca = agent.parameters.biblioteca;
//     agent.add("Hola, soy bibliobot y voy a buscar el horario de la bilbioteca " + biblioteca);
//   }

//   async function searchBook(agent) {
//     var book = agent.parameters.libro;
//     //agent.add(book);
//     var result = await consultar(book, agent, BOOK_SEARCH);
//     var res = JSON.parse(result);
//     res = JSON.parse(res);
//     //console.log(res);
//     console.log(res);
//     var array = res['hits']['hits'];
//     if (array.length <= 0) {
//       agent.add('no se encontraron resultados de ' + book);
//     } else {
//       for (let i = 0; i < array.length; i++) {
//         if (i < 3) {
//           const element = array[i];
//           var book = element['_source'];
//           agent.add('*LIBRO:*' + book['TITULO'] + '\n' +
//             '*AUTOR:*' + book['AUTOR'] + '\n' +
//             '*BIBLIOTECA:*' + book['BIBLIOTECA '] + '\n' +
//             '*COPIAS:*' + book['CANT']
//           );
//         }
//       }
//     }
//   }

//   async function searchAuthor(agent) {
//     var author = agent.parameters.autor;
//     //agent.add(autor);
//     var result = await consultar(author, agent, AUTHOR_SEARCH);
//     var res = JSON.parse(result);
//     res = JSON.parse(res);
//     //console.log(res);
//     console.log(res);
//     var array = res['hits']['hits'];
//     if (array.length <= 0) {
//       agent.add('no se encontraron resultados de ' + author);
//     } else {
//       for (let i = 0; i < array.length; i++) {
//         if (i < 3) {
//           const element = array[i];
//           var book = element['_source'];
//           agent.add('*LIBRO:*' + book['TITULO'] + '\n' +
//             '*AUTOR:*' + book['AUTOR'] + '\n' +
//             '*BIBLIOTECA:*' + book['BIBLIOTECA '] + '\n' +
//             '*COPIAS:*' + book['CANT']
//           );
//         }
//       }
//     }
//   }


//   async function searchCalendar(agent) {
//     agent.add('searching in calendar...');
//     var res = await searchInCalendarGoogle(agent);
//     console.log("rs: " + res);
//   }



//   // Run the proper function handler based on the matched Dialogflow intent name
//   let intentMap = new Map();

//   intentMap.set("BuscarLibro", searchBook);
//   intentMap.set("BuscarAutor", searchAuthor);
//   intentMap.set("BuscarCalendario", searchCalendar);
//   intentMap.set('Default Welcome Intent', welcome);

//   intentMap.set("Horarios bibliotecas", schedules);

//   agent.handleRequest(intentMap);
// });

// function addQuestions(agent) {
//   agent.add(new Suggestion('Buscar libro'));
//   agent.add(new Suggestion('Buscar Autor'));
//   agent.add(new Suggestion('Buscar Género'));
//   //agent.add(new Suggestion('Consulta Eventos ToM'));
// }


// function generateCard(title, image, text, buttonText, buttonUrl) {
//   return new Card({
//     title: title,
//     imageUrl: image,
//     text: text,
//     buttonText: buttonText,
//     buttonUrl: buttonUrl
//   });
// }

// function consultar(text, agent, type) {
//   console.log("Consultando...");

//   return new Promise((resolve) => {
//     console.log(text);
//     console.log("Entrando a promesa....");
//     var url = '';
//     switch (type) {
//       case AUTHOR_SEARCH:
//         agent.add('Buscando Libros por autor: ' + text + '...');
//         url = ELASTIC_URL + 'q=AUTOR:' + text;
//         break;
//       case BOOK_SEARCH:
//         agent.add('Buscando Libros por titulo: ' + text + '...');
//         url = ELASTIC_URL + 'q=TITULO:' + text;
//         break;
//       case GENERIC_SEARCH:
//         agent.add('Buscando Libros: ' + text + '...');
//         url = ELASTIC_URL + 'q:' + text;
//         break;
//     }

//     unirest.get(url)
//       .send()
//       .end(function (response) {
//         //console.log("Envia R:",response['raw_body']);
//         resolve(JSON.stringify(response['raw_body']));
//       });

//   });
// }

// app.use('/', router);

// module.exports = app;

// /* var port = 4300;
// app.listen(port);

// console.log('Server started on: ' + port); */


// /*
// var
//     port = process.env.PORT || 3000;
//     */

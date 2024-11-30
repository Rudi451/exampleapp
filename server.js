import express from 'express';
import path from 'path';
import serveFavicon from 'serve-favicon';
import https from 'https';
import serverSetup from './middlewares/setup-server-router.js';
import fs from 'fs/promises';
import CatchError from './models/catch-error.js';
import routerMember from './routes/members-routes.js';
import routerGuest from './routes/guests-routes.js';
import routerPayment from './routes/payment-routers.js';
import routerCourse from './routes/course-routers.js';
import routerSslCert from './routes/sslCertificate-route.js';
import {redirectIfLogged} from './controllers/users-controllers.js';

import {generateFitnessCourses} from './utils/daten-faken.js';

const app = express();
const KEY_PATH = path.join(
	process.cwd(),
	'cert',
	'my-yoga.work',
	'my-yoga.work.key'
);
const CERT_PATH = path.join(
	process.cwd(),
	'cert',
	'my-yoga.work',
	'my-yoga.work.crt'
);
const __dirname = process.cwd();
// Die einstellungen für's hosten

const options = {
	key: await fs.readFile(KEY_PATH),
	cert: await fs.readFile(CERT_PATH),
};

const httpServer = https.createServer(
	options ? options : {key: null, cert: null},
	app
);

app.use(serverSetup);
// const PORT = process.env.PORT || 5000;
const PORT = 8080;

//////////////////////////////////////////////////
//  Geschützter Member Bereich
//////////////////////////////////////////////////

/**
 * Ausgeführte Middleware - Funktion.Fügt allen Responses, deren Request - Pfad mit '/members' beginnt, No - Cache - Headers hinzu.
 * Dadurch wird verhindert, dass man nach erfolgtem Logout über den Back-Button des Browsers
 * zu den geCACHEten Member-HTML-Dateien zurückkehren kann.
 */

app.use('/api/users/members', (req, res, next) => {
	res.set({
		'Cache-Control': 'no-cache, no-store, must-revalidate',
		Pragma: 'no-cache',
		Expires: '0',
	});
	next();
});
// routers für Members
app.use('/api/users/members', routerMember);
app.use('/api/payments', routerPayment);
app.use('/api/courses', routerCourse);

//////////////////////////////////////////////////
//  Öffentlicher Bereich
//////////////////////////////////////////////////

// Middleware, statische Dateien aus dem Verzeichnis 'public' ausgeben
app.get('/', redirectIfLogged);
app.use(express.static('public'));
//favicon.ico angeben, sonst reagiert server mit 404 Fehler für dieses Datei
app.use(serveFavicon(path.join(process.cwd(), 'public', 'favicon.ico')));
// routes für guests
app.use('/api/users', routerGuest);
//
// NOTE: Checken ob, es so angerichtet, dass wenn man auf irgendeine Seite geht -> wird überprüft ob der User angemeldet ist oder nicht, wenn nicht ->auf login/register Seite -> wenn ja dann auf Profil Seite
//
//DONE: User beim requests prüfen

//_______________________________________________________
app.use(express.static(__dirname, {dotfiles: 'allow'})); //
app.use(express.static(path.join(__dirname, '.well-known/acme-challenge')));

// Serve ACME challenge files
app.use(
	'/.well-known/acme-challenge',
	express.static(path.join(__dirname, '.well-known/acme-challenge'))
);

// app.use('/.well-known', express.static('/home/rodion_shap/exampleapp/cert'));
// app.use(express.static('/.well-known'));
// app.use(
// 	'/.well-known/acme-challenge/cLe-dvx1haBae9-Ak-lrdYNMUtWHA0AB1kAysxG-tn0',
// 	routerSslCert
// );
//
// ___________Zentrale Fehler Behandlung ________________
//_404_
app.use((req, res, next) => {
	next(new CatchError('Seite nicht gefunden', 404));
});
//
//_Error_catching
//
//wenn als erster Parameter ein Fehlerobjekt kommt, wird folgende Middleware ausgeführt
app.use((error, req, res, next) => {
	//wenn schon ein Serverheader gesetzt wurde(zB ein Statuscode oder .send oder .json usw. verwendet ist)
	if (res.headerSent) {
		return next(error);
	}
	if (
		error.message ===
		'Username muss von 2 bis 50 Zeichen erhalten. Sonderzeichen sind nicht erlaubt.,Passwort muss von 8 bis 50 Zeichen erhalten. Sonderzeichen sind erlaubt.'
	) {
		res.redirect('/index.html#failedRegistration');
	}
	if (error.message === 'Seite nicht gefunden') {
		res.sendFile(path.join(process.cwd(), 'public', 'status404.html'));
	} else if (error.message === 'Login failed') {
		// res.sendFile(			path.join(process.cwd(), 'public', 'status404.html')		);
		res.redirect('/status404.html#failedLogin');
	} else if (error.message === 'Username is already exist') {
		res.redirect('/index.html#usernameIsAlreadyExist');
	} else {
		res.status(error.errorCode ?? 500);
		res.json({
			message: error.message ?? 'Unknown server error',
		});
	}
});
// _____________________________________________________
//
// Webserver erzeugen / starten
// //
app.listen(PORT, () => {
	// generateFitnessCourses();
	console.log('Server is running with port ' + PORT);
});

httpServer.listen(443, () => {
	console.log('Server listening on port 443');
});

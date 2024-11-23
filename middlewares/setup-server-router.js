import express, {Router} from 'express';

import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import {fakerDE_AT as faker} from '@faker-js/faker';
import serveFavicon from 'serve-favicon';

import CatchError from '../models/catch-error.js';

/**************************************************
 *
 * Die verschiedene Server Einstellungen
 *
 **************************************************/

const router = new Router();

dotenv.config();

router.use(cookieParser());
//_______________________________Start Variable Definition___________________________________________//
const PORT = process.env.PORT || 5000;
const sessionOptions = {
	secret: process.env.SECRET_KEY_SESSION_ID,
	// Laufende Sessions werden NICHT abermals überschrieben:
	resave: false,
	// Uninitialisierte Sitzungen speichern (also ohne login wird die Session trotzdem im Cookie gespeichert)
	saveUninitialized: true,
	// Cookie-Daten:
	cookie: {
		// Bei Engegennahme von HTTPS-Requests: true
		// Bei Engegennahme von HTTP-Requests: false (gilt auch bei HTTPS-Hosting mit internen HTTP Forwarding an den Express Server)
		secure: false,
		// Cookie Gültigkeitsdauer:
		// maxAge in ms (60*60*1000 = 3600000ms = 1 Stunde)
		// In Chrome aktuell max. 400 Tage (https://developer.chrome.com/blog/cookie-max-age-expires?hl=de)
		maxAge: 60 * 60 * 1000,
		expires: new Date(Date.now() + 3600000),
	},
	// Weitere selbstdefinierte Eigenschaften
	// Im Session-Objekt können am Server beliebige weitere Eigenschaften gebildet
	// und damit in der Session verfügbar gemacht werden (z.B. loggedIn)
	loggedIn: false,
	sinnloseInfo: 42,
};
//_______________________________Ende Variable Definition____________________________________________//

// mit Helmet Server absichern
router.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				// Erlaubt das Laden von Skripten aus dem eigenen Server ('self') und inline Skripten (unsicher)
				'script-src': ["'self'", "'unsafe-inline'", 'lib/', 'js/'],

				// Erlaubt die Verwendung von Inline-Event-Handlern wie `onclick`, `onchange`, etc.
				'script-src-attr': ["'unsafe-inline'"],

				// Optional: Styles von der gleichen Quelle erlauben
				'style-src': ["'self'", "'unsafe-inline'"],

				// Optional: Erlaubt das Laden von Ressourcen von spezifischen externen URLs
				// 'script-src': ["'self'", "'unsafe-inline'", 'https://example.com'],
				// Falls Skripte von externen Domains geladen werden
			},
		},
	})
);

// CORS für die Browser erlauben
router.use(cors());

// Bodyparser einrichten
// parst URL Parameter und Standard Formular Daten
router.use(express.urlencoded({extended: true}));

// parst JSON
router.use(express.json());

// Session anrichten
router.use(session(sessionOptions));

export default router;

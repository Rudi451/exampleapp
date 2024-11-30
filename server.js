import fs from 'fs';
import http from 'http';
import https from 'https';
import express from 'express';
import path from 'path';

const app = express();

// Weiterleitung von HTTP auf HTTPS
app.all('*', (req, res) => {
	const httpsUrl = 'https://' + req.headers.host + req.url;
	res.redirect(301, httpsUrl); // Permanent Redirect
});

// Erstelle einen HTTP-Server (Port 80)
const httpServer = http.createServer(app);
httpServer.listen(8080, () => {
	console.log('HTTP-Server läuft auf Port 80, Weiterleitung aktiv.');
});

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
const CA_PATH = path.join(process.cwd(), 'cert', 'my-yoga.work', 'chain.crt');
// Lade das Zertifikat, den privaten Schlüssel und das Zwischenzertifikat
const options = {
	key: fs.readFileSync(KEY_PATH),
	cert: fs.readFileSync(CERT_PATH),
};

// Starte den HTTPS-Server
https.createServer(options, app).listen(7001, () => {
	console.log('Server läuft auf https://my-yoga.work');
});

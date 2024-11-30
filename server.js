import fs from 'fs';
import https from 'https';
import express from 'express';
import path from 'path';

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
// Lade das Zertifikat, den privaten Schlüssel und das Zwischenzertifikat
const options = {
	key: fs.readFileSync(KEY_PATH),
	cert: fs.readFileSync(CERT_PATH),
};

// Starte den HTTPS-Server
https.createServer(options, app).listen(7001, () => {
	console.log('Server läuft auf https://my-yoga.work');
});

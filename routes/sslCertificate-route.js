import {Router} from 'express';
import path from 'path';

const router = new Router();

router.get('/', (req, res, next) => {
	const fileName = 'a-string';
	// const filePath = __dirname + '/.well-know/acme-challenge/' + fileName;
	const filePath = path.join(
		process.cwd(),
		'.well-know',
		'acme-challenge',
		fileName
	);
	fs.readFile(filePath, (err, data) => {
		if (err) {
			console.error(err);
			return res.status(404).send('Datei nicht gefunden');
		}

		// Setze den Content-Type und sende die Datei
		res.setHeader('Content-Type', 'text/plain');
		res.send(data);
	});
});

export default router;

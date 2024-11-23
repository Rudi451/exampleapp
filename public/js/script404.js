/**
 * Prüfen ob ein Hash im link gibt, wenn ja
 * wird geprüft ob das Login Failed ist
 * wenn ja -> wird der text der 404 Seite geändert
 */
function handleHashChange() {
	const currentHash = window.location.hash;

	if (currentHash === '#failedLogin') {
		document.getElementById('message').innerText =
			'Login failed. Please try again.';
	}
}

window.addEventListener('load', handleHashChange);

window.addEventListener('hashchange', handleHashChange);

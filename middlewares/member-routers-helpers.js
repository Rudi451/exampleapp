//______________________#Start Hilfsfunktionen Abteilung_______________
/** Eingeloggte User werden bei Aufruf von root('/')
 *  auf den Members-Bereich weitergeleitet (/members/index.html). */
const redirectMembersHome = (req, res, next) => {
	console.log('in redirect MembersHome');
	if (isLoggedIn(req)) res.redirect('/members');
	else next(); // Weiter zu den statischen Datein im Verzeichnis 'public'
};

/** Middleware-Funktion zur Überprüfung, ob ein User eingeloggt ist (mit Redirect auf die Login-Seite) */
const ensureLoggedIn = (req, res, next) => {
	console.log('req.session.loggedIn: ', req.session.loggedIn);
	req.session.loggedIn ? next() : res.redirect('/');
};

/** Hilfs-Funktion zur Überprüfung, ob ein User eingeloggt */
const isLoggedIn = (req) => req.session.loggedIn;

//______________________#Ende Hilfsfunktionen Abteilung__________________

export {redirectMembersHome, ensureLoggedIn, isLoggedIn};

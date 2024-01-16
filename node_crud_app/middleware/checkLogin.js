
const checkLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        // User is logged in, proceed to the next middleware or route handler
        next();
    } else {
        // User is not logged in, send an error response
        // res.status(401).json({ error: 'Unauthorized access. Please log in.' });
        res.redirect('/login_form'); 
    }
};
module.exports = checkLogin;
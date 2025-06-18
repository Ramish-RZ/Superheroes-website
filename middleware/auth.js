// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

// Middleware to check if user is not authenticated (for login/register pages)
exports.isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    next();
}; 
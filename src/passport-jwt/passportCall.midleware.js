const passport = require('passport');

exports.passportCall = strategy => {
    return (req, res, next) => {
        passport.authenticate(strategy, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({ status: 'error', error: info.message ? info.message : info.toString() });
            }
            req.user = user; // Attach user object to the request
            next(); // Proceed to the next middleware or route handler
        })(req, res, next);
    };
};

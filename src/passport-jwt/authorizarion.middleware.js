exports.authorization = roleArray => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).send({ status: 'error', message: 'Unauthorized' });
            }

            // Check if the user has a role that is allowed
            const userRole = req.user.role.toUpperCase();

            // Allow access if the role is PUBLIC or ADMIN
            if (roleArray.includes(userRole)) {
                return next(); // User is authorized
            }

            return res.status(403).send({ status: 'error', message: 'Not permissions' });
        } catch (error) {
            next(error); // Pass any error to the error handler
        }
    };
};

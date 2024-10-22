const { EErrors } = require("../../services/errors/eum");
const { logger } = require("../../utils/logger");

exports.handleError = ( err, req, res, next ) => {
    logger.error(err)
    switch (err.code) {
        case EErrors.DATABASE_ERROR:
            return res.send({status: 'error', error: err.message})
            break;
    
        default:
            return res.status(500).send({status: 'error', error: 'error server'})
            break;
    }
}
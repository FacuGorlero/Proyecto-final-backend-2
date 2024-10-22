const {Router} = require('express')

const productRouter = require('./products.route.js')
const cartRouter = require('./cart.route.js')
const viewsRouter = require('./views.route.js')
const sessionRouter = require('./session.route.js')
const mailRouter = require('./mail.router.js')
const pruebasRouter = require('./pruebas.router.js')
const { handleError } = require('../midlewares/errors/handleerror.js')

const router = Router()

router.use('/api/products', productRouter)
router.use('/api/carts', cartRouter)
router.use('/', viewsRouter)
router.use('/api/session', sessionRouter)
router.use('/api', mailRouter)
router.use('/pruebas', pruebasRouter)
//payment method


router.use(handleError)
/* router.use(( err, req, res, next ) => {
    console.error(err)
    res.status(500).send(`Error server ${err}`)
}) */

module.exports = router
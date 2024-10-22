const { Router } = require('express')
const { sendEmail } = require('../utils/sendmail')

const router = Router()

router.get('/mail', (req, res) => {
    sendEmail()
    res.send('mail sent')
})


module.exports = router
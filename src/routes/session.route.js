const { Router } = require('express')
const passport = require('passport')
const { passportCall } = require('../passport-jwt/passportCall.midleware')
const { authorization } = require('../passport-jwt/authorizarion.middleware')
const SessionController = require('../controller/session.controller')
const { isAuthenticated } = require('../midlewares/auth.midleware')
const { isAdmin } = require('../midlewares/roleverification')

const router = Router()

const {
    register,
    login,
    logout,
    current,
    github,
    githubCallback,
    user,
    getAllUsers,
    deleteInactiveUsers,
    deleteUser
} = new SessionController()


router.post('/register', register)

router.post('/login', login)

router.get('/logout', logout)

router.get('/current', [passportCall('jwt'), authorization(['ADMIN', 'PUBLIC'])], current)

router.get('/github', passport.authenticate('github', {scope: ['user:email']}), github)

router.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), githubCallback)

router.get('/protected-route', isAuthenticated, (req, res) => {
    res.json({ message: 'Protected route' })
})

router.get('/', isAdmin , getAllUsers)

router.delete('/', isAdmin, deleteInactiveUsers)

router.get('/user/:uid', user)

router.delete('/users/:userId', deleteUser)

module.exports = router
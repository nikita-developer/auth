const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()
const {body} = require('express-validator')
const authMiddleware = require('../middleware/auth-middleware')
const adminMiddleware = require('../middleware/admin-middleware')

router.post('/registration', body('email').isEmail(), body('password').isLength({min: 8, max: 32}), userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/refresh', userController.refresh)

router.post('/add-recovery-password-link', userController.addRecoveryPasswordLink)
router.get('/redirect-rcovery-password/:link', userController.redirectRecoveryPassword)
router.post('/recovery-password', userController.recoveryPassword)

// На стадии обдумывания
router.get('/activate/:link', userController.activate)

// список пользователей
router.post('/users', authMiddleware, adminMiddleware, userController.getUsers)
router.delete('/delete-user', authMiddleware, adminMiddleware, userController.deleteUser)
router.post('/edit-role', userController.editRole)

module.exports = router
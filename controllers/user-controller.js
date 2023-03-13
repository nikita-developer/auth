const userService = require('../service/user-service')
const {validationResult} = require('express-validator')
const ApiError = require('../exceptions/api-error')

class UserController {
    async registration(req, res, next) {
        try {
            // проверка на ошибки
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            // получаем email и password
            const {email, password} = req.body
            // вызывваем функцию и регистрируем пользователя
            const userData = await userService.registration(email, password)
            // записываем в куки
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            // получаем почту и пароль
            const {email, password} = req.body
            // запускаем функцию и передаем параметры
            const userData = await userService.login(email, password)
            // записываем в куки токен
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            // получаем рефрештокен из кук
            const {refreshToken} = req.cookies
            // вызываем функцию и передаем рефрештокен
            const token = await userService.logout(refreshToken)
            // удаляем куку с рефрештокеном
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (e) {
            next(e)
        }
    }

    async activate(req, res, next) {
        try {
            // получаем ссылку активации
            const activationLink = req.params.link
            // вызываем функцию и передаем ей ссылку активации
            await userService.activate(activationLink)
            // перенаправляем пользователя
            return res.redirect(process.env.CLIENT_URL)
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies
            // запускаем функцию и передаем рефрештокен
            const userData = await userService.refresh(refreshToken)
            // записываем в куки токен
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers()
            return res.json({users})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()
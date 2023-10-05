const userService = require('../service/user-service')
const {validationResult} = require('express-validator')
const ApiError = require('../exceptions/api-error')

class UserController {
    async registration(req, res, next) {
        try {
            // проверка на ошибки
            const errors = validationResult(req)

            if(!errors.isEmpty()) return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))

            // получаем email и password
            const {email, password, firstName} = req.body

            // вызывваем функцию и регистрируем пользователя
            const userData = await userService.registration(email, password, firstName)

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
            const users = await userService.getUsers()
            return res.json({users})
        } catch (e) {
            next(e)
        }
    }

    async deleteUser(req, res, next) {
        try {
            const {email, id} = req.body
            await userService.deleteUser(id)
            return res.json({message: `Пользователь с почтой ${email} был удален`})
        } catch (e) {
            next(e)
        }
    }

    async editRole(req, res, next) {
        try {
            const {id, role} = req.body
            const newRole = await userService.editRole(id, role)
            return res.json(newRole)
        } catch (e) {
            next(e)
        }
    }

    // функция отправки письма на почту для восстановления пароля
    async addRecoveryPasswordLink(req, res, next) {
        try {
            // получаем почту
            const {email} = req.body

            // вызываем функцию проверки и отправки ссылки на почту
            await userService.addRecoveryPasswordLink(email)

            // возвращаем ответ
            return res.json({message: 'Загялните в почту'})
        } catch (e) {
            next(e)
        }
    }

    // функция отрабатывает когда переходим по ссылке которая приходит на почту
    async redirectRecoveryPassword(req, res, next) {
        try {
            // получаем ссылку восстановления пароля
            const recoveryPasswordLink = req.params.link

            // функция для проверки и смены флага восстановления пароля
            await userService.redirectRecoveryPassword(recoveryPasswordLink)

            // редиректим на восстановление пароля
            return res.redirect(`${process.env.CLIENT_URL}recovery-password`)
        } catch (e) {
            next(e)
        }
    }

    // отрабатывает когда придумываем новый пароль
    async recoveryPassword(req, res, next) {
        try {
            // проверка на ошибки
            const errors = validationResult(req)

            if(!errors.isEmpty()) return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))

            // получаем почту и пароль
            const {email, password} = req.body

            // отрабатывает когда придумываем новый пароль
            await userService.recoveryPassword(email, password)

            // редиректим на главную
            return res.json({message: 'Пароль изменен!'})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()
const ApiError = require('../exceptions/api-error')

module.exports = function (req, res, next) {
    try {
        // достаем токен из заголовка
        const {role} = req.body

        // проверяем роль пользователя
        if (role !== 'admin') return next(ApiError.BadRequest('Может только админ'))

        // передаем управление следующему middleware
        next()
    } catch (e) {
        return next(ApiError.BadRequest(`Ошибка в middleware ${e}`))
    }
}
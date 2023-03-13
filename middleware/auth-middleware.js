const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
    try {
        // достаем токен из заголовка
        const authorizationHeader = req.headers.authorization
        // проверяем есть ли токен
        if(!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }
        // из токена забираем токен а "Bearer" отсеиваем
        const accessToken = authorizationHeader.split(' ')[1]
        // проверяем есть ли токен уже без "Bearer"
        if(!accessToken) {
            return next(ApiError.UnauthorizedError())
        }
        // запускаем функцию проверки токена
        const userData = tokenService.validateAccessToken(accessToken)
        // если при валидации токена произошла ошибка
        if(!userData) {
            return next(ApiError.UnauthorizedError())
        }
        // помещаем в поле user данные о пользователе который лежал в токене
        req.user = userData
        // передаем управление следующему middleware
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}
const jwt = require('jsonwebtoken')
const tokenModel = require('../models/token-model')

class TokenService {
    // генерация токенов
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30s'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            // проверяем протух ли токен или нет
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            // проверяем протух ли токен или нет
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    async saveToken(userId, refreshToken) {
        // поиск токена у пользователя
        const tokenData = await tokenModel.findOne({user: userId})
        // если токен у пользователя есть, мы его перезаписывем
        if(tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }

        // создаем рефреш токен
        const token = await tokenModel.create({user: userId, refreshToken})
        return token
    }

    async removeToken(refreshToken){
        // ищем токен и удаляем
        const tokenData = await tokenModel.deleteOne({refreshToken})
        return tokenData
    }

    async findToken(refreshToken){
        // ищем токен в базе и возвращаем
        const tokenData = await tokenModel.findOne({refreshToken})
        return tokenData
    }
}

module.exports = new TokenService()
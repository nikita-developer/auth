const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration(email, password) {
        // поиск пользователя в базу
        const candidate = await UserModel.findOne({email})

        // проверка на существования в базе пользователя
        if(candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }

        // хешируем пароль
        const hashPassword = await bcrypt.hash(password, 3)
        // получаем рандомную строку для генерации ссылки активации аккаунта
        const activationLink = uuid.v4()
        // создаем пользователя
        const user = await UserModel.create({email, password: hashPassword, activationLink})
        // отправляем письмо для активации
        await mailService.sendActivationMail(email, `${process.env.API_URL}api/activate/${activationLink}`)
        // фильтруем объект и отдаем только те данные которые прописаны в dto
        const userDto = new UserDto(user)
        // генерируем токены
        const tokens = tokenService.generateTokens({...userDto})
        // сохраняем токены в базу
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        // поиск пользователя по ссылке
        const user = await UserModel.findOne({activationLink})

        // проверка на существование пользователя
        if(!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }

        // меняем состояние акккаунта
        user.isActivated = true
        // сохраняем
        await user.save()
    }

    async login(email, password) {
        // поиск пользователя в базу
        const user = await UserModel.findOne({email})

        // проверка на существования в базе пользователя
        if(!user) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не найден`)
        }
        // функция compare принимает пароль который ввели и хеширует его, затем вторым параметром передаем пароль с базы в хешированном виде и сравнивает их
        const isPassEquals = await bcrypt.compare(password, user.password)
        // если пароль не равны
        if(!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }
        // фильтруем объект и отдаем только те данные которые прописаны в dto
        const userDto = new UserDto(user)
        // генерируем токены
        const tokens = tokenService.generateTokens({...userDto})
        // сохраняем токены в базу
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        // вызываем функцию удаления токена с базы
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken) {
        // проверяем есть ли токен
        if(!refreshToken) {
            throw ApiError.UnauthorizedError()
        }
        // вызываем функцию проверки токена
        const userData = tokenService.validateRefreshToken(refreshToken)
        // ищем токен в базе
        const tokenFromDb = await tokenService.findToken(refreshToken)
        // если токен протух или нет в базе
        if(!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }
        // достаем пользователя по id из базы
        const user = await UserModel.findById(userData.id)
        // фильтруем объект и отдаем только те данные которые прописаны в dto
        const userDto = new UserDto(user)
        // генерируем токены
        const tokens = tokenService.generateTokens({...userDto})
        // сохраняем токены в базу
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find()
        return users
    }
}

module.exports = new UserService()
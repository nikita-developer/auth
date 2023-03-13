require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddleware = require('./middleware/error-middleware')

// порт нашего сервера
const PORT = process.env.PORT || 5000
// инициализируем express
const app = express()

// учим базу работать с json
app.use(express.json())
// работа с куками
app.use(cookieParser())
// cors
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
// роуты
app.use('/api', router)
// обработка ошибок
app.use(errorMiddleware)

// функция запуска сервера
const start = async () => {
    try {
        // подключаемся к базу
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        // стартуем сервер
        app.listen(PORT, () => console.log(`Сервер запущен по адресу http://localhost:${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()
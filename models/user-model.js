const {Schema, model} = require('mongoose')

const UserSchema = new Schema({
    firstName: {type: String, require: true},
    lastName: {type: String},
    age: {type: String},
    avatarImg: {type: String, default: "avatar-default.png"},
    email: {type: String, unique: true, require: true},
    password: {type: String, require: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    role: {type: String, default: 'default'},
    recoveryPasswordLink: {type: String},
})

module.exports = model('User', UserSchema)
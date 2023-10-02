module.exports = class UserDto {
    id;
    firstName;
    lastName;
    age;
    avatarImg;
    email;
    isActivated;
    role;

    constructor(model) {
        this.id = model._id;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.age = model.age;
        this.avatarImg = model.avatarImg;
        this.email = model.email;
        this.isActivated = model.isActivated;
        this.role = model.role;
    }
}
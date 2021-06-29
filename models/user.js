const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { NotAuthError } = require('../errors/not-auth-error');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'Email некорректный',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator(password) {
        return validator.isStrongPassword(password);
      },
      message: 'Не является надежным паролем. Длина должна быть не менее 8 символов',
    },
    select: false,
  },
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: [],
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(avatar) {
        return /^(http:|https:)\/\/w*\w/.test(avatar);
      },
      message: 'Ссылка на аватар некорректна',
    },
  },
});

userSchema.statics.findUserByCredentials = function fn(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new NotAuthError('Передан неверный логин или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new NotAuthError('Передан неверный логин или пароль'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);

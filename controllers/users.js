const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { OK_CODE_200 } = require('../utils/constants');

const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const NotAuthError = require('../errors/not-auth-error');

const { NODE_ENV, JWT_SECRET } = process.env;

function login(req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res
        .status(OK_CODE_200)
        .cookie(
          'jwt',
          token,
          {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: true,
          },
        )
        .send({ message: 'Вход успешно выполнен' });
    })
    .catch(() => {
      throw new NotAuthError('Передан неверный логин или пароль');
    })
    .catch(next);
}

function getUsers(req, res, next) {
  User.find({})
    .then((users) => res.status(OK_CODE_200).send(users))
    .catch(next);
}

function getUserById(req, res, next) {
  User.findById(req.params.userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
      }
      next(err);
    })
    .catch(next);
}

function getCurrentUser(req, res, next) {
  const { _id } = req.user;

  User.findById(_id)
    .orFail(new Error('NotValidId'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
      }
      next(err);
    })
    .catch(next);
}

function createUser(req, res, next) {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании пользователя');
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError(`Пользователь с Email ${req.body.email} уже существует`);
      }
      return next(err);
    })
    .catch(next);
}

function updateUser(req, res, next) {
  const { name, about } = req.body;
  const id = req.user._id;
  User.findByIdAndUpdate(
    id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
      }
      next(err);
    })
    .catch(next);
}

function updateAvatar(req, res, next) {
  const { avatar } = req.body;
  const id = req.user._id;
  User.findByIdAndUpdate(
    id,
    { avatar },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
      }
      next(err);
    })
    .catch(next);
}

module.exports = {
  login,
  getUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  updateAvatar,
};

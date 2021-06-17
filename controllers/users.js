const User = require('../models/user');

const {
  OK_CODE_200,
  ERROR_CODE_400,
  ERROR_CODE_404,
  ERROR_CODE_500,
} = require('../utils/constants');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK_CODE_200).send(users))
    .catch(() => {
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

const getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(ERROR_CODE_404).send({ message: 'Пользователь по указанному _ID не найден' });
        return;
      }
      res.status(OK_CODE_200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при поиске пользователя' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(OK_CODE_200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при создании пользователя' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

const updateUserProfile = (req, res) => {
  const id = req.user._id;
  const { name, about } = req.body;
  User.findOneAndUpdate({ _id: id }, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(ERROR_CODE_404).send({ message: 'Пользователь по указанному _id не найден' });
        return;
      }
      res.status(OK_CODE_200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

const updateUserAvatar = (req, res) => {
  const id = req.user._id;
  const { avatar } = req.body;
  User.findOneAndUpdate({ _id: id }, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(ERROR_CODE_404).send({ message: 'Пользователь по указанному _id не найден' });
        return;
      }
      res.status(OK_CODE_200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
};

const Card = require('../models/card');

const {
  OK_CODE_200,
  ERROR_CODE_400,
  ERROR_CODE_404,
  ERROR_CODE_500,
} = require('../utils/constants');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(OK_CODE_200).send(cards))
    .catch(() => res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' }));
};

const createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(OK_CODE_200).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при создании карточки' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res.status(ERROR_CODE_404).send({ message: 'Карточка с указанным _id не найдена' });
        return;
      }
      res.status(OK_CODE_200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при удалении карточки.' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(ERROR_CODE_404).send({ message: 'Карточка с указанным _ID не найдена' });
        return;
      }
      res.status(OK_CODE_200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные для постановки лайка' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(ERROR_CODE_404).send({ message: 'Карточка с указанным _ID не найдена' });
        return;
      }
      res.status(OK_CODE_200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные для снятии лайка' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: 'Внутренняя ошибка сервера' });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};

const Card = require('../models/card');

const { OK_CODE_200 } = require('../utils/constants');

const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

function getCards(req, res, next) {
  Card.find({})
    .then((cards) => res.status(OK_CODE_200).send(cards))
    .catch(next);
}

function createCard(req, res, next) {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(OK_CODE_200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные в метод создания карточки');
      }
      next(err);
    })
    .catch(next);
}

function deleteCard(req, res, next) {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(new Error('NotFoundById'))
    .then((card) => {
      const userId = req.user._id;
      const cardOwnerId = card.owner.toString();
      if (cardOwnerId === userId) {
        card.remove()
          .catch(next);
      } else {
        throw new ForbiddenError('Попытка удалить чужую карточку');
      }
    })
    .then(() => res.status(OK_CODE_200).send({ message: 'Карточка удалена' }))
    .catch((err) => {
      if (err.message === 'NotFoundById') {
        throw new NotFoundError('Карточка не найдена');
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные в метод удаления карточки');
      }
      next(err);
    })
    .catch(next);
}

function likeCard(req, res, next) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotFoundById'))
    .then((card) => res.status(OK_CODE_200).send(card))
    .catch((err) => {
      if (err.message === 'NotFoundById') {
        throw new NotFoundError('Карточка не найдена');
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные для постановки лайка');
      }
      next(err);
    })
    .catch(next);
}

function dislikeCard(req, res, next) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotFoundById'))
    .then((card) => res.status(OK_CODE_200).send(card))
    .catch((err) => {
      if (err.message === 'NotFoundById') {
        throw new NotFoundError('Карточка не найдена');
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные для снятия лайка');
      }
      next(err);
    })
    .catch(next);
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};

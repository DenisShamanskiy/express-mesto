// eslint-disable-next-line max-len
// 400 — переданы некорректные данные в метод создания карточки, пользователя, обновления аватара пользователя и профиля

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;

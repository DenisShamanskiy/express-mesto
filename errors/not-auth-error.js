// eslint-disable-next-line max-len
// 401 — передан неверный логин или пароль. Ещё эту ошибку возвращает авторизационный мидлвэр, если передан неверный JWT

class NotAuthError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = NotAuthError;

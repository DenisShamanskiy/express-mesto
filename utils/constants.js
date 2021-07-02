const validator = require('validator');

const OK_CODE_200 = 200;
const urlServer = 'localhost:27017';
const database = 'mestodb';

const validIsURL = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new Error('Ссылка некорректна');
};

module.exports = {
  urlServer,
  database,
  OK_CODE_200,
  validIsURL,
};

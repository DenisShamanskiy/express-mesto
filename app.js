const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cardsRoutes = require('./routes/cards');
const usersRoutes = require('./routes/users');

const { ERROR_CODE_400 } = require('./utils/constants');

const app = express();

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = { _id: '60c61ede904981052a8d76ee' };
  next();
});

app.use('/', cardsRoutes);

app.use('/', usersRoutes);

app.use('*', (req, res) => res.status(ERROR_CODE_400).send({ message: 'Запрашиваемый ресурс не найден' }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});

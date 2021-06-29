const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
const dotenv = require('dotenv');

dotenv.config();

const auth = require('./middlewares/auth');
const customErrorsHandler = require('./middlewares/customErrorsHandler');
const cardRouter = require('./routes/cards');
const userRouter = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const { server, database } = require('./utils/constants');
const NotFoundError = require('./errors/not-found-error');

const app = express();
const { PORT = 3000 } = process.env;

async function connectDB() {
  try {
    await mongoose.connect(`mongodb://${server}/${database}`, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    // eslint-disable-next-line no-console
    console.log('==== База данных MongoDB подключена!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Ошибка подключения к MongoDB', error);
    process.exit(1);
  }
}
connectDB();

app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).trim(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^(http:|https:)\/\/w*\w/),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).required(),
  }),
}), login);

app.use(auth);
app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.use(errors());
app.use('*', () => {
  throw new NotFoundError('Страница не найдена.');
});
app.use(customErrorsHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`==== Сервер запущен и доступен тут: http://localhost:${PORT}`);
});

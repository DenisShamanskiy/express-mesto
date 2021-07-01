const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors, celebrate, Joi } = require('celebrate');
const dotenv = require('dotenv');

dotenv.config();

const NotFoundError = require('./errors/not-found-error');
const auth = require('./middlewares/auth');
const cardRouter = require('./routes/cards');
const userRouter = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const { urlServer, database } = require('./utils/constants');

const app = express();
const { PORT = 3000 } = process.env;

async function connectMongoose() {
  try {
    await mongoose.connect(`mongodb://${urlServer}/${database}`, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    // eslint-disable-next-line no-console
    console.log('Связь с MongoDB установлена');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Ошибка подключения к MongoDB', error);
    process.exit(1);
  }
}
connectMongoose();

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
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use((error, req, res, next) => {
  const { ERROR_CODE_500 = 500, message } = error;
  res.status(ERROR_CODE_500).send({ message: ERROR_CODE_500 === 500 ? 'На сервере произошла ошибка' : message });
  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
});

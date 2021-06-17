const usersRouter = require('express').Router();

const {
  getUsers, getUserById, createUser, updateUserProfile, updateUserAvatar,
} = require('../controllers/users');

usersRouter.get('/users', getUsers);
usersRouter.get('/users/:id', getUserById);
usersRouter.post('/users', createUser);
usersRouter.patch('/users/me/', updateUserProfile);
usersRouter.patch('/users/me/avatar/', updateUserAvatar);

module.exports = usersRouter;

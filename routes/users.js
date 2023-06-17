const express = require('express');

const router = express.Router();
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

router.post('/sigup', AuthController.signup)
router.post('/login', AuthController.login)


router
  .route('/')
  .get(UsersController.getUsers)
  .post(UsersController.addUser);

router
  .route('/:id')
  .get(UsersController.getUser)
  .patch(UsersController.updateUser)
  .delete(UsersController.deleteUser);


  module.exports = router; 
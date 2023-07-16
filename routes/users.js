const express = require('express');

const router = express.Router();
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

router.post('/sigup', AuthController.signup)
router.post('/login', AuthController.login)


router.post('/forggtoPassword', AuthController.forggotPassword)
router.patch('/resetPassword/:token', AuthController.resetPasswrod)
router.patch('/updateMyPassword', AuthController.protect , AuthController.updatePassword);
router.patch('/updateMe', AuthController.protect, UsersController.exportUserPhoto , UsersController.resizeUserPhoto ,UsersController.updateMe);



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
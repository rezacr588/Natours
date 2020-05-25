const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.use(authController.protect);
router.patch(
  '/updateMe',
  userController.uploadSingle,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.use(authController.restrict('admin'));
router.route('/').get(userController.getUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);
module.exports = router;

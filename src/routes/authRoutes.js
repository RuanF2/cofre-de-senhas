const express = require('express');
const router = express.Router();
const passport = require('passport');
const verificarToken = require('../middlewares/verificarToken')
const {register, login, perfil, googleCallback} = require ('../controllers/authController');

router.get('/perfil', verificarToken, perfil)
router.post('/register', register);
router.post('/login', login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);
module.exports = router;
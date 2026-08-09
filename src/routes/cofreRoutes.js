const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/verificarToken');
const { criarSenha, listarSenhas, revelarSenha, excluirSenha } = require('../controllers/cofreController');

router.post('/', verificarToken, criarSenha);
router.get('/', verificarToken, listarSenhas);
router.get('/:id/revelar', verificarToken, revelarSenha);
router.delete('/:id', verificarToken, excluirSenha);

module.exports = router;

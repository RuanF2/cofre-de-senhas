const pool = require('../db');
const { criptografar, descriptografar } = require('../utils/crypto');

// Cria uma nova senha guardada no cofre, vinculada ao usuário logado
async function criarSenha(req, res) {
    const { site, usuario_site, senha_site } = req.body;
    const usuarioId = req.usuarioId; // isso vem do middleware verificarToken (veremos como conectar isso)

    if (!site || !usuario_site || !senha_site) {
        res.status(400).json({ mensagem: 'Preencha site, usuario_site e senha_site' });
        return;
    }

    const senhaCriptografada = criptografar(senha_site);

    const resultado = await pool.query(
        'INSERT INTO senhas_cofre (usuario_id, site, usuario_site, senha_criptografada) VALUES ($1, $2, $3, $4) RETURNING id, site, usuario_site, criado_em',
        [usuarioId, site, usuario_site, senhaCriptografada]
    );

    res.status(201).json({ mensagem: 'Senha salva com sucesso', senha: resultado.rows[0] });
}

// Lista todas as senhas do usuário logado, SEM revelar o valor (só metadados)
async function listarSenhas(req, res) {
    const usuarioId = req.usuarioId;

    const resultado = await pool.query(
        'SELECT id, site, usuario_site, criado_em FROM senhas_cofre WHERE usuario_id = $1 ORDER BY site ASC',
        [usuarioId]
    );

    res.status(200).json({ senhas: resultado.rows });
}

// Revela (descriptografa) uma senha específica, verificando que pertence ao usuário logado
async function revelarSenha(req, res) {
    const usuarioId = req.usuarioId;
    const { id } = req.params;

    const resultado = await pool.query(
        'SELECT senha_criptografada FROM senhas_cofre WHERE id = $1 AND usuario_id = $2',
        [id, usuarioId]
    );

    const registro = resultado.rows[0];

    if (!registro) {
        res.status(404).json({ mensagem: 'Senha não encontrada' });
        return;
    }

    const senhaOriginal = descriptografar(registro.senha_criptografada);
    res.status(200).json({ senha: senhaOriginal });
}

// Remove uma senha do cofre
async function excluirSenha(req, res) {
    const usuarioId = req.usuarioId;
    const { id } = req.params;

    const resultado = await pool.query(
        'DELETE FROM senhas_cofre WHERE id = $1 AND usuario_id = $2 RETURNING id',
        [id, usuarioId]
    );

    if (resultado.rows.length === 0) {
        res.status(404).json({ mensagem: 'Senha não encontrada' });
        return;
    }

    res.status(200).json({ mensagem: 'Senha excluída com sucesso' });
}

module.exports = { criarSenha, listarSenhas, revelarSenha, excluirSenha };

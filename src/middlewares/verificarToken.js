const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    if (!req.headers.authorization) {
        res.status(401).json({ mensagem: 'Token não fornecido' });
        return;
    }

    const headers = req.headers.authorization;
    const partes = headers.split(' ');
    const token = partes[1];

    try {
        const dadosDoToken = jwt.verify(token, process.env.JWT_SECRET);

        // Anexa o id do usuário na própria requisição, pra qualquer rota protegida
        // conseguir usar (ex: cofreController usa req.usuarioId pra saber de quem são as senhas)
        req.usuarioId = dadosDoToken.id;

        next();
    } catch (erro) {
        res.status(401).json({ mensagem: 'Token inválido' });
        return;
    }
}

module.exports = verificarToken;

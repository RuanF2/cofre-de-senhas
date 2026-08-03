const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db')

async function register (req, res) {
    const {email,senha} = req.body;
    const tamanho = senha;

    console.log(tamanho.length);

    if(tamanho.length <8){
      res.status(400).json({mensagem: 'A senha precisas ter no mínimo 8 caracteres'});
      return
    }

    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuarioExistente = resultado.rows[0];

    if(usuarioExistente){
      res.status(400).json({mensagem: 'O email utilizado já está cadastrado'})
      return
    }

    if(!email.includes('@')){
      res.status(400).json({mensagem: 'Email invalído'})
      return
    }

    console.log('E-mail recebido: ', email);
    console.log('Senha recebida: ', senha);

 const saltRounds = 10;

 const hash = await bcrypt.hash(senha, saltRounds);
 console.log(hash);

await pool.query('INSERT INTO usuarios (email, senha) VALUES($1, $2)', [email, hash]);

 res.status(201).json({mensagem: 'Usuário recebido com sucesso'});
}

async function login(req, res) {
   const {email, senha} = req.body;
   const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
   const busca = resultado.rows[0];
   if(!busca){
   res.status(401).json({mensagem: "Usuário não encontrado"})
   return
}

const verificacao = await bcrypt.compare(senha, busca.senha);

if(verificacao === false){
   res.status(401).json({mensagem: "Senha inválida"})
   return
}

const token = jwt.sign({
   id: busca.id, email: email},
   process.env.JWT_SECRET,
   {expiresIn: '1h'}
)

res.status(200).json({mensagem: `Token ${token} gerado`})

}

function perfil(req, res) { res.status(200).json({mensagem: 'Acesso autorizado'}) }

function googleCallback(req, res){
   const usuario = req.user

   const tk = jwt.sign({
      id: usuario.id, email: usuario.email},
      process.env.JWT_SECRET,
      {expiresIn: '30min'}
   )
   res.redirect(`http://localhost:3000/dashboard.html?token=${tk}`);
}


 module.exports = { register, login, perfil, googleCallback };



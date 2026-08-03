// Utilitário de criptografia REVERSÍVEL (diferente do bcrypt, que é hash e não pode ser revertido).
// Usamos AES-256-GCM: o mesmo algoritmo usado por gerenciadores de senha de verdade.
//
// Diferença importante pro resto do projeto:
// - bcrypt (register/login) -> hash, NUNCA reversível, serve só pra comparar
// - crypto (cofre de senhas) -> criptografia reversível, porque o usuário precisa VER a senha salva depois

const crypto = require('crypto');

const ALGORITMO = 'aes-256-gcm';

// A chave precisa ter exatamente 32 bytes (256 bits). Vem do .env, em hexadecimal.
function obterChave() {
  const chaveHex = process.env.CRYPTO_SECRET;
  if (!chaveHex || chaveHex.length !== 64) {
    throw new Error('CRYPTO_SECRET precisa existir no .env e ter 64 caracteres hexadecimais (32 bytes)');
  }
  return Buffer.from(chaveHex, 'hex');
}

// Criptografa um texto puro (ex: a senha que o usuário quer guardar no cofre)
function criptografar(textoPuro) {
  const chave = obterChave();
  const iv = crypto.randomBytes(12); // vetor de inicialização, único a cada criptografia
  const cifra = crypto.createCipheriv(ALGORITMO, chave, iv);

  const criptografado = Buffer.concat([cifra.update(textoPuro, 'utf8'), cifra.final()]);
  const authTag = cifra.getAuthTag(); // usado pra garantir que o dado não foi adulterado

  // Guardamos tudo junto, separado por ':', em hexadecimal, pra salvar como texto no banco
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${criptografado.toString('hex')}`;
}

// Descriptografa de volta pro texto original
function descriptografar(textoCriptografado) {
  const chave = obterChave();
  const [ivHex, authTagHex, dadosHex] = textoCriptografado.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const dados = Buffer.from(dadosHex, 'hex');

  const decifra = crypto.createDecipheriv(ALGORITMO, chave, iv);
  decifra.setAuthTag(authTag);

  const textoPuro = Buffer.concat([decifra.update(dados), decifra.final()]);
  return textoPuro.toString('utf8');
}

module.exports = { criptografar, descriptografar };

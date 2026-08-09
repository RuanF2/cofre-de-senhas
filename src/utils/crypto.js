const crypto = require('crypto');

const ALGORITMO = 'aes-256-gcm';

function obterChave() {
  const chaveHex = process.env.CRYPTO_SECRET;
  if (!chaveHex || chaveHex.length !== 64) {
    throw new Error('CRYPTO_SECRET precisa existir no .env e ter 64 caracteres hexadecimais (32 bytes)');
  }
  return Buffer.from(chaveHex, 'hex');
}

function criptografar(textoPuro) {
  const chave = obterChave();
  const iv = crypto.randomBytes(12); 
  const cifra = crypto.createCipheriv(ALGORITMO, chave, iv);

  const criptografado = Buffer.concat([cifra.update(textoPuro, 'utf8'), cifra.final()]);
  const authTag = cifra.getAuthTag(); 

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${criptografado.toString('hex')}`;
}

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

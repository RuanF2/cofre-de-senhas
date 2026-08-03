CREATE TABLE senhas_cofre (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  site VARCHAR(255) NOT NULL,
  usuario_site VARCHAR(255) NOT NULL,
  senha_criptografada TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);
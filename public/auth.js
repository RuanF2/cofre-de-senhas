// Esse arquivo conversa com as rotas que você já construiu: /auth/register e /auth/login

const URL_BASE = 'http://localhost:3000';

const abas = document.querySelectorAll('.aba');
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const mensagemAuth = document.getElementById('mensagemAuth');

// Alterna entre a aba "Entrar" e "Criar conta"
abas.forEach((aba) => {
  aba.addEventListener('click', () => {
    abas.forEach((a) => a.classList.remove('ativa'));
    aba.classList.add('ativa');

    limparMensagem();

    if (aba.dataset.aba === 'login') {
      formLogin.classList.remove('oculto');
      formRegistro.classList.add('oculto');
    } else {
      formRegistro.classList.remove('oculto');
      formLogin.classList.add('oculto');
    }
  });
});

function mostrarMensagem(texto, tipo = 'erro') {
  mensagemAuth.textContent = texto;
  mensagemAuth.className = 'linha-status' + (tipo === 'sucesso' ? ' sucesso' : '');
}

function limparMensagem() {
  mensagemAuth.textContent = '';
  mensagemAuth.className = 'linha-status';
}

// Se a pessoa já estiver logada (token salvo), manda direto pro dashboard
if (localStorage.getItem('cofre_token')) {
  window.location.href = 'dashboard.html';
}

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparMensagem();

  const dados = new FormData(formLogin);
  const email = dados.get('email');
  const senha = dados.get('senha');

  const botao = formLogin.querySelector('button[type="submit"]');
  botao.disabled = true;

  try {
    const resposta = await fetch(`${URL_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const corpo = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagem(corpo.mensagem || 'Não foi possível entrar');
      return;
    }

    // A resposta atual do seu backend vem como { mensagem: "Token XYZ gerado" }.
    // Extraímos só o token de dentro dessa frase.
    const token = extrairTokenDaMensagem(corpo.mensagem);

    if (!token) {
      mostrarMensagem('Login funcionou, mas não consegui ler o token da resposta');
      return;
    }

    localStorage.setItem('cofre_token', token);
    window.location.href = 'dashboard.html';
  } catch (erro) {
    mostrarMensagem('Não consegui falar com o servidor. Ele está rodando?');
  } finally {
    botao.disabled = false;
  }
});

formRegistro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparMensagem();

  const dados = new FormData(formRegistro);
  const email = dados.get('email');
  const senha = dados.get('senha');

  const botao = formRegistro.querySelector('button[type="submit"]');
  botao.disabled = true;

  try {
    const resposta = await fetch(`${URL_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const corpo = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagem(corpo.mensagem || 'Não foi possível criar a conta');
      return;
    }

    mostrarMensagem('Conta criada! Já pode entrar.', 'sucesso');
    formRegistro.reset();

    // leva a pessoa de volta pra aba de login automaticamente
    document.querySelector('.aba[data-aba="login"]').click();
  } catch (erro) {
    mostrarMensagem('Não consegui falar com o servidor. Ele está rodando?');
  } finally {
    botao.disabled = false;
  }
});

// Ajuda temporária: hoje o backend devolve o token dentro de uma frase
// (`Token ${token} gerado`). Essa função isola só o token.
// Quando você ajustar o backend pra devolver { token: "..." } direto, pode simplificar isso.
function extrairTokenDaMensagem(mensagem) {
  if (!mensagem) return null;
  const partes = mensagem.split(' ');
  return partes.length >= 2 ? partes[1] : null;
}

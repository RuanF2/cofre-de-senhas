const URL_BASE = 'http://localhost:3000';


const parametrosURL = new URLSearchParams(window.location.search);
const tokenDaURL = parametrosURL.get('token');

if (tokenDaURL) {
    localStorage.setItem('cofre_token', tokenDaURL);
    window.history.replaceState({}, document.title, 'dashboard.html');
}

const token = localStorage.getItem('cofre_token');
if (!token) {
    window.location.href = 'index.html';
}


const listaCofre = document.getElementById('listaCofre');
const estadoVazio = document.getElementById('estadoVazio');
const contagemSenhas = document.getElementById('contagemSenhas');
const mensagemDashboard = document.getElementById('mensagemDashboard');
const buscaSite = document.getElementById('buscaSite');
const templateItem = document.getElementById('templateItemCofre');

const modalNovo = document.getElementById('modalNovo');
const botaoNovo = document.getElementById('botaoNovo');
const fecharModal = document.getElementById('fecharModal');
const formNovaSenha = document.getElementById('formNovaSenha');
const mensagemModal = document.getElementById('mensagemModal');
const inputSenhaNova = document.getElementById('inputSenhaNova');
const botaoGerarSenha = document.getElementById('gerarSenha');
const botaoSair = document.getElementById('botaoSair');

let senhasCarregadas = [];

// ---------- requisições autenticadas ----------

async function requisicaoAutenticada(caminho, opcoes = {}) {
  const resposta = await fetch(`${URL_BASE}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opcoes.headers || {}),
    },
  });

  if (resposta.status === 401) {
    // token expirou ou é inválido — manda de volta pro login
    localStorage.removeItem('cofre_token');
    window.location.href = 'index.html';
    return null;
  }

  return resposta;
}

// ---------- carregar e renderizar a lista ----------

async function carregarSenhas() {
  mensagemDashboard.textContent = '';

  const resposta = await requisicaoAutenticada('/cofre');
  if (!resposta) return;

  const corpo = await resposta.json();

  if (!resposta.ok) {
    mensagemDashboard.textContent = corpo.mensagem || 'Não foi possível carregar seus acessos';
    return;
  }

  senhasCarregadas = corpo.senhas;
  renderizarLista(senhasCarregadas);
}

function renderizarLista(senhas) {
  listaCofre.innerHTML = '';

  contagemSenhas.textContent =
    senhas.length === 0
      ? 'Nenhum acesso guardado ainda'
      : `${senhas.length} acesso${senhas.length > 1 ? 's' : ''} guardado${senhas.length > 1 ? 's' : ''}`;

  estadoVazio.classList.toggle('oculto', senhas.length > 0);

  senhas.forEach((item) => {
    const clone = templateItem.content.cloneNode(true);
    const li = clone.querySelector('.item-cofre');

    li.dataset.id = item.id;
    clone.querySelector('[data-inicial]').textContent = item.site.charAt(0);
    clone.querySelector('[data-site]').textContent = item.site;
    clone.querySelector('[data-usuario]').textContent = item.usuario_site;

    const textoSenha = clone.querySelector('[data-senha-texto]');
    const botaoRevelar = clone.querySelector('[data-botao-revelar]');
    const botaoCopiar = clone.querySelector('[data-botao-copiar]');
    const botaoExcluir = clone.querySelector('[data-botao-excluir]');

    let senhaRevelada = null;
    let visivel = false;

    botaoRevelar.addEventListener('click', async () => {
      if (!senhaRevelada) {
        const resposta = await requisicaoAutenticada(`/cofre/${item.id}/revelar`);
        if (!resposta) return;
        const corpo = await resposta.json();
        if (!resposta.ok) {
          mensagemDashboard.textContent = corpo.mensagem || 'Não foi possível revelar a senha';
          return;
        }
        senhaRevelada = corpo.senha;
      }

      visivel = !visivel;
      textoSenha.textContent = visivel ? senhaRevelada : '••••••••';
      botaoRevelar.textContent = visivel ? '🙈' : '👁';
    });

    botaoCopiar.addEventListener('click', async () => {
      if (!senhaRevelada) {
        const resposta = await requisicaoAutenticada(`/cofre/${item.id}/revelar`);
        if (!resposta) return;
        const corpo = await resposta.json();
        if (!resposta.ok) {
          mensagemDashboard.textContent = corpo.mensagem || 'Não foi possível copiar a senha';
          return;
        }
        senhaRevelada = corpo.senha;
      }

      await navigator.clipboard.writeText(senhaRevelada);
      const originalIcone = botaoCopiar.textContent;
      botaoCopiar.textContent = '✓';
      setTimeout(() => (botaoCopiar.textContent = originalIcone), 1200);
    });

    botaoExcluir.addEventListener('click', async () => {
      const confirmar = confirm(`Excluir o acesso de "${item.site}"? Essa ação não pode ser desfeita.`);
      if (!confirmar) return;

      const resposta = await requisicaoAutenticada(`/cofre/${item.id}`, { method: 'DELETE' });
      if (!resposta) return;

      if (!resposta.ok) {
        const corpo = await resposta.json();
        mensagemDashboard.textContent = corpo.mensagem || 'Não foi possível excluir';
        return;
      }

      carregarSenhas();
    });

    listaCofre.appendChild(clone);
  });
}

// ---------- busca local ----------

buscaSite.addEventListener('input', () => {
  const termo = buscaSite.value.trim().toLowerCase();
  const filtradas = senhasCarregadas.filter((item) => item.site.toLowerCase().includes(termo));
  renderizarLista(filtradas);
});

// ---------- modal de novo acesso ----------

function abrirModal() {
  modalNovo.classList.remove('oculto');
  mensagemModal.textContent = '';
  formNovaSenha.reset();
}

function fecharModalNovo() {
  modalNovo.classList.add('oculto');
}

botaoNovo.addEventListener('click', abrirModal);
fecharModal.addEventListener('click', fecharModalNovo);
modalNovo.addEventListener('click', (evento) => {
  if (evento.target === modalNovo) fecharModalNovo();
});

botaoGerarSenha.addEventListener('click', () => {
  inputSenhaNova.value = gerarSenhaForte();
});

function gerarSenhaForte() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let senha = '';
  for (let i = 0; i < 16; i++) {
    senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return senha;
}

formNovaSenha.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagemModal.textContent = '';

  const dados = new FormData(formNovaSenha);
  const corpoRequisicao = {
    site: dados.get('site'),
    usuario_site: dados.get('usuario_site'),
    senha_site: dados.get('senha_site'),
  };

  const botao = formNovaSenha.querySelector('button[type="submit"]');
  botao.disabled = true;

  try {
    const resposta = await requisicaoAutenticada('/cofre', {
      method: 'POST',
      body: JSON.stringify(corpoRequisicao),
    });
    if (!resposta) return;

    const corpo = await resposta.json();

    if (!resposta.ok) {
      mensagemModal.textContent = corpo.mensagem || 'Não foi possível salvar';
      return;
    }

    fecharModalNovo();
    carregarSenhas();
  } catch (erro) {
    mensagemModal.textContent = 'Não consegui falar com o servidor.';
  } finally {
    botao.disabled = false;
  }
});

// ---------- sair ----------

botaoSair.addEventListener('click', () => {
  localStorage.removeItem('cofre_token');
  window.location.href = 'index.html';
});

// ---------- inicialização ----------

carregarSenhas();

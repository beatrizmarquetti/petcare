
const ESPECIES = {
  dog:     { nome: 'Cachorro', emoji: '🐶' },
  cat:     { nome: 'Gato',     emoji: '🐱' },
  rabbit:  { nome: 'Coelho',   emoji: '🐰' },
  bird:    { nome: 'Pássaro',  emoji: '🦜' },
  fish:    { nome: 'Peixe',    emoji: '🐟' },
  hamster: { nome: 'Hamster',  emoji: '🐹' },
  reptile: { nome: 'Réptil',   emoji: '🦎' },
  other:   { nome: 'Outro',    emoji: '🐾' }
};

const TIPOS_CUIDADO = {
  feeding:    { nome: 'Alimentação', icone: '🍖', classe: 'tipo-feeding' },
  cleaning:   { nome: 'Limpeza',     icone: '🧹', classe: 'tipo-cleaning' },
  vet:        { nome: 'Veterinário', icone: '🩺', classe: 'tipo-vet' },
  medication: { nome: 'Medicação',   icone: '💊', classe: 'tipo-medication' },
  exercise:   { nome: 'Exercício',   icone: '🏃', classe: 'tipo-exercise' },
  grooming:   { nome: 'Tosa/Banho',  icone: '✂️', classe: 'tipo-grooming' },
  other:      { nome: 'Outro',       icone: '📝', classe: 'tipo-other' }
};

const RACAS = {
  dog: [
    'Border Collie', 'Bulldog Francês', 'Dachshund', 'Golden Retriever',
    'Husky Siberiano', 'Labrador', 'Lhasa Apso', 'Maltês', 'Pastor Alemão',
    'Pinscher', 'Poodle', 'Pug', 'Rottweiler', 'Shih Tzu', 'Spitz Alemão',
    'Yorkshire', 'Vira-lata', 'Outra'
  ],
  cat: [
    'Angorá', 'Bengal', 'Britânico de Pelo Curto', 'Maine Coon',
    'Persa', 'Ragdoll', 'Scottish Fold', 'Siamês', 'Sphynx',
    'Vira-lata', 'Outra'
  ],
  rabbit: [
    'Angorá', 'Dutch', 'Gigante de Flandres', 'Holland Lop',
    'Leão', 'Mini Rex', 'Nova Zelândia', 'Rex', 'Outra'
  ],
  bird: [
    'Agapornis', 'Calopsita', 'Canário', 'Cardeal', 'Cockatoo',
    'Curió', 'Diamante', 'Manon', 'Papagaio', 'Periquito',
    'Pombo', 'Sabiá', 'Outra'
  ],
  fish: [
    'Acará Bandeira', 'Betta', 'Carpas Koi', 'Ciclídeo',
    'Disco', 'Guppy', 'Molinésia', 'Neon Tetra', 'Oscar',
    'Plati', 'Tetra', 'Outro'
  ],
  hamster: [
    'Anão Russo', 'Anão Chinês', 'Campbell', 'Roborovski',
    'Sírio (Dourado)', 'Outro'
  ],
  reptile: [
    'Bearded Dragon', 'Blue Tongue Skink', 'Camaleão', 'Cobra do Milho',
    'Gecko Leopardo', 'Iguana', 'Jabuti', 'Monitor', 'Python Ball', 'Outro'
  ],
  other: ['Outro']
};

const estado = {
  telaAtual:       'dashboard',
  petAtivo:        null,   
  editandoPet:     null,   
  editandoRegistro: null,  
  callbackConfirmar: null  
};

function porId(id) {
  return document.getElementById(id);
}

function porSeletor(seletor) {
  return document.querySelectorAll(seletor);
}

async function chamarAPI(caminho, opcoes = {}) {
  const resposta = await fetch(caminho, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes
  });
  return resposta.json();
}

function formatarData(str) {
  if (!str) return '—';
  const [ano, mes, dia] = str.split('-');
  return `${dia}/${mes}/${ano}`;
}

function calcularIdade(nascimento) {
  if (!nascimento) return null;

  const hoje = new Date();
  const dataNasc = new Date(nascimento);

  const mesesTotal = (hoje.getFullYear() - dataNasc.getFullYear()) * 12
                   + (hoje.getMonth() - dataNasc.getMonth());

  if (mesesTotal < 1)  return 'Recém-nascido';
  if (mesesTotal < 12) return `${mesesTotal} ${mesesTotal > 1 ? 'meses' : 'mês'}`;

  const anos  = Math.floor(mesesTotal / 12);
  const meses = mesesTotal % 12;

  if (meses > 0) return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} ${meses > 1 ? 'meses' : 'mês'}`;
  return `${anos} ano${anos > 1 ? 's' : ''}`;
}

function mostrarAviso(mensagem, tipo = 'sucesso') {
  const container = porId('container-toast');

  const aviso = document.createElement('div');
  aviso.className = `toast ${tipo}`;

  const icones = { sucesso: '✅', erro: '❌', aviso: '⚠️' };
  aviso.innerHTML = `<span>${icones[tipo] || '💬'}</span><span>${mensagem}</span>`;

  container.appendChild(aviso);

  setTimeout(function() {
    aviso.style.animation = 'sairToast 0.3s ease forwards';
    setTimeout(function() { aviso.remove(); }, 300);
  }, 3200);
}

function pedirConfirmacao(titulo, descricao, callback) {
  porId('titulo-confirmar').textContent  = titulo;
  porId('desc-confirmar').textContent    = descricao;
  estado.callbackConfirmar               = callback;
  porId('fundo-confirmar').classList.add('aberto');
}

function mostrarTela(nomeTela, petId = null) {
  // Esconde todas as telas
  porSeletor('.tela').forEach(function(tela) {
    tela.classList.remove('ativa');
  });

  porSeletor('.btn-nav').forEach(function(btn) {
    btn.classList.remove('ativo');
  });

  porId('tela-' + nomeTela).classList.add('ativa');

  var btnNav = document.querySelector('.btn-nav[data-tela="' + nomeTela + '"]');
  if (btnNav) btnNav.classList.add('ativo');

  estado.telaAtual = nomeTela;

  if (nomeTela === 'dashboard') carregarDashboard();
  if (nomeTela === 'pets')      carregarPets();
  if (nomeTela === 'registros') carregarTodosRegistros();
  if (nomeTela === 'detalhe' && petId) carregarDetalhePet(petId);
}

async function carregarDashboard() {
  var resultados = await Promise.all([
    chamarAPI('api/pets.php'),
    chamarAPI('api/records.php')
  ]);

  var pets      = resultados[0].dados || [];
  var registros = resultados[1].dados || [];

  porId('stat-pets').textContent     = pets.length;
  porId('stat-registros').textContent = registros.length;

  var hoje = new Date().toISOString().split('T')[0];
  var cuidadosHoje = registros.filter(function(r) { return r.data === hoje; });
  porId('stat-hoje').textContent = cuidadosHoje.length;

  var proximos = registros.filter(function(r) { return r.proximo && r.proximo >= hoje; });
  porId('stat-proximos').textContent = proximos.length;

  var containerRecente = porId('atividade-recente');
  if (registros.length === 0) {
    containerRecente.innerHTML = criarEstadoVazio('📋', 'Nenhuma atividade', 'Adicione pets e registros de cuidados!');
  } else {
    var html = '';
    var ultimos = registros.slice(0, 5);
    for (var i = 0; i < ultimos.length; i++) {
      html += criarItemRegistro(ultimos[i], false);
    }
    containerRecente.innerHTML = html;
  }

  var containerPets = porId('pets-dashboard');
  if (pets.length === 0) {
    containerPets.innerHTML = criarEstadoVazio('🐾', 'Nenhum pet cadastrado', 'Clique em "Novo Pet" para começar!');
  } else {
    var html = '';
    var primeiros = pets.slice(0, 4);
    for (var j = 0; j < primeiros.length; j++) {
      html += criarCardPet(primeiros[j]);
    }
    containerPets.innerHTML = html;
  }
}

async function carregarPets() {
  var busca   = porId('input-busca-pet')?.value || '';
  var especie = porId('filtro-especie')?.value   || '';

  var url = 'api/pets.php?busca=' + encodeURIComponent(busca) + '&especie=' + especie;
  var resultado = await chamarAPI(url);
  var pets = resultado.dados || [];

  var grid = porId('grid-pets');

  if (pets.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1">' +
      criarEstadoVazio('🐾', 'Nenhum pet encontrado', 'Tente outro filtro ou cadastre um novo pet!') +
      '</div>';
  } else {
    var html = '';
    for (var i = 0; i < pets.length; i++) {
      html += criarCardPet(pets[i]);
    }
    grid.innerHTML = html;
  }
}

function criarCardPet(pet) {
  var especie = ESPECIES[pet.especie] || ESPECIES.other;
  var idade   = calcularIdade(pet.nascimento);

  var badgeIdade = idade
    ? '<span class="badge idade">🎂 ' + idade + '</span>'
    : '';

  var badgePeso = pet.peso
    ? '<span class="badge">⚖️ ' + pet.peso + 'kg</span>'
    : '';

  var totalReg = pet.total_registros || 0;
  var badgeReg = '<span class="badge registros">📋 ' + totalReg + ' registro' + (totalReg != 1 ? 's' : '') + '</span>';

  var racaHtml = pet.raca
    ? '<div class="pet-raca">' + pet.raca + '</div>'
    : '';

  return `
    <div class="card-pet" onclick="mostrarTela('detalhe', ${pet.id})">
      <div class="card-pet-topo">
        <div class="pet-emoji">${pet.emoji || especie.emoji}</div>
        <div class="pet-info">
          <div class="pet-nome">${pet.nome}</div>
          <div class="pet-especie">${especie.nome}</div>
          ${racaHtml}
        </div>
        <div class="acoes-card" onclick="event.stopPropagation()">
          <button class="btn btn-pequeno btn-secundario" onclick="abrirModalPet(${pet.id})" title="Editar">✏️</button>
          <button class="btn btn-pequeno btn-perigo"     onclick="excluirPet(${pet.id}, '${pet.nome}')" title="Excluir">🗑️</button>
        </div>
      </div>
      <div class="pet-badges">
        ${badgeIdade}
        ${badgePeso}
        ${badgeReg}
      </div>
    </div>`;
}

async function abrirModalPet(petId = null) {
  estado.editandoPet = petId;


  porId('form-pet').reset();
  porSeletor('#form-pet .msg-erro').forEach(function(e) { e.textContent = ''; });
  porSeletor('#form-pet .input-form, #form-pet .select-form').forEach(function(el) { el.classList.remove('erro'); });
  porSeletor('.opcao-emoji').forEach(function(e) { e.classList.remove('selecionado'); });

  if (petId) {
    porId('titulo-modal-pet').textContent = 'Editar Pet';
    var resultado = await chamarAPI('api/pets.php?id=' + petId);

    if (resultado.sucesso) {
      var pet = resultado.dados;
      porId('nome-pet').value        = pet.nome;
      porId('especie-pet').value     = pet.especie;
      atualizarRacas(pet.especie);
      porId('raca-pet').value = pet.raca || '';
      porId('nascimento-pet').value  = pet.nascimento || '';
      porId('peso-pet').value        = pet.peso || '';
      porId('observacoes-pet').value = pet.observacoes || '';

      porSeletor('.opcao-emoji').forEach(function(e) {
        if (e.dataset.emoji === pet.emoji) e.classList.add('selecionado');
      });
    }
  } else {

    porId('titulo-modal-pet').textContent = 'Novo Pet';
    var primeiroEmoji = document.querySelector('.opcao-emoji');
    if (primeiroEmoji) primeiroEmoji.classList.add('selecionado');
  }

  porSeletor('#form-pet [data-contador]').forEach(function(c) {
    c.dispatchEvent(new Event('input'));
  });

  porId('modal-pet').classList.add('aberto');
}

function fecharModalPet() {
  porId('modal-pet').classList.remove('aberto');
  estado.editandoPet = null;
}

function validarFormPet() {
  var valido = true;

  // Limpa erros anteriores
  ['erro-nome-pet', 'erro-especie-pet', 'erro-peso-pet', 'erro-nasc-pet'].forEach(function(id) {
    porId(id).textContent = '';
  });
  ['nome-pet', 'especie-pet', 'peso-pet', 'nascimento-pet'].forEach(function(id) {
    porId(id).classList.remove('erro');
  });

  var nome = porId('nome-pet').value.trim();
  if (!nome) {
    porId('erro-nome-pet').textContent = 'Nome é obrigatório.';
    porId('nome-pet').classList.add('erro');
    valido = false;
  } else if (nome.length < 2) {
    porId('erro-nome-pet').textContent = 'O nome deve ter pelo menos 2 caracteres.';
    porId('nome-pet').classList.add('erro');
    valido = false;
  }

  if (!porId('especie-pet').value) {
    porId('erro-especie-pet').textContent = 'Selecione uma espécie.';
    porId('especie-pet').classList.add('erro');
    valido = false;
  }

  var peso = porId('peso-pet').value;
  if (peso !== '' && (isNaN(peso) || Number(peso) <= 0 || Number(peso) > 999)) {
    porId('erro-peso-pet').textContent = 'Peso deve ser entre 0.1 e 999 kg.';
    porId('peso-pet').classList.add('erro');
    valido = false;
  }

  var nasc = porId('nascimento-pet').value;
  if (nasc && new Date(nasc) > new Date()) {
    porId('erro-nasc-pet').textContent = 'A data não pode ser no futuro.';
    porId('nascimento-pet').classList.add('erro');
    valido = false;
  }

  return valido;
}

async function salvarPet() {
  if (!validarFormPet()) return;

  var emojiSelecionado = document.querySelector('.opcao-emoji.selecionado');
  var emoji = emojiSelecionado ? emojiSelecionado.dataset.emoji : '🐾';

  var dados = {
    nome:        porId('nome-pet').value.trim(),
    especie:     porId('especie-pet').value,
    raca:        porId('raca-pet').value.trim(),
    nascimento:  porId('nascimento-pet').value,
    peso:        porId('peso-pet').value,
    emoji:       emoji,
    observacoes: porId('observacoes-pet').value.trim()
  };

  var btnSalvar = porId('btn-salvar-pet');
  btnSalvar.disabled = true;
  btnSalvar.innerHTML = '<span class="spinner"></span> Salvando...';

  try {
    var resultado;

    if (estado.editandoPet) {
      // Atualiza pet existente (PUT)
      resultado = await chamarAPI('api/pets.php?id=' + estado.editandoPet, {
        method: 'PUT',
        body: JSON.stringify(dados)
      });
    } else {
      // Cria novo pet (POST)
      resultado = await chamarAPI('api/pets.php', {
        method: 'POST',
        body: JSON.stringify(dados)
      });
    }

    if (resultado.sucesso) {
      mostrarAviso(resultado.mensagem, 'sucesso');
      fecharModalPet();
      // Recarrega a tela atual
      if (estado.telaAtual === 'pets')      carregarPets();
      if (estado.telaAtual === 'dashboard') carregarDashboard();
    } else {
      mostrarAviso(resultado.mensagem || 'Erro ao salvar.', 'erro');
    }

  } catch (e) {
    mostrarAviso('Erro de conexão com o servidor.', 'erro');
  }

  btnSalvar.disabled = false;
  btnSalvar.innerHTML = 'Salvar';
}

async function excluirPet(id, nome) {
  pedirConfirmacao(
    'Excluir ' + nome + '?',
    'Todos os registros deste pet também serão removidos. Esta ação não pode ser desfeita.',
    async function() {
      var resultado = await chamarAPI('api/pets.php?id=' + id, { method: 'DELETE' });

      if (resultado.sucesso) {
        mostrarAviso(resultado.mensagem, 'sucesso');
        if (estado.telaAtual === 'detalhe') mostrarTela('pets');
        else if (estado.telaAtual === 'pets') carregarPets();
        else carregarDashboard();
      } else {
        mostrarAviso(resultado.mensagem, 'erro');
      }
    }
  );
}

async function carregarDetalhePet(petId) {
  estado.petAtivo = petId;

  var resultados = await Promise.all([
    chamarAPI('api/pets.php?id=' + petId),
    chamarAPI('api/records.php?pet_id=' + petId)
  ]);

  if (!resultados[0].sucesso) { mostrarTela('pets'); return; }

  var pet       = resultados[0].dados;
  var registros = resultados[1].dados || [];
  var especie   = ESPECIES[pet.especie] || ESPECIES.other;
  var idade     = calcularIdade(pet.nascimento);

  var subtitulo = especie.nome;
  if (pet.raca)  subtitulo += ' • ' + pet.raca;
  if (idade)     subtitulo += ' • ' + idade;
  if (pet.peso)  subtitulo += ' • ' + pet.peso + 'kg';

  document.querySelector('#tela-detalhe .detalhe-topo').innerHTML = `
    <div class="detalhe-emoji">${pet.emoji || especie.emoji}</div>
    <div style="flex:1">
      <div class="detalhe-nome">${pet.nome}</div>
      <div class="detalhe-sub">${subtitulo}</div>
    </div>
    <div class="detalhe-acoes">
      <button class="btn btn-secundario" onclick="abrirModalPet(${pet.id})">✏️ Editar</button>
      <button class="btn btn-perigo"     onclick="excluirPet(${pet.id}, '${pet.nome}')">🗑️ Excluir</button>
    </div>`;

  var caixaObs = porId('obs-detalhe');
  if (pet.observacoes) {
    caixaObs.style.display = 'block';
    caixaObs.textContent   = pet.observacoes;
  } else {
    caixaObs.style.display = 'none';
  }

  renderizarRegistrosDetalhe(registros, 'all');

  porSeletor('#tela-detalhe .aba').forEach(function(aba) {
    aba.onclick = function() {
      porSeletor('#tela-detalhe .aba').forEach(function(a) { a.classList.remove('ativa'); });
      aba.classList.add('ativa');
      renderizarRegistrosDetalhe(registros, aba.dataset.tipo);
    };
  });
}

function renderizarRegistrosDetalhe(registros, tipo) {
  var filtrados = tipo === 'all'
    ? registros
    : registros.filter(function(r) { return r.tipo === tipo; });

  var container = porId('registros-detalhe');

  if (filtrados.length === 0) {
    container.innerHTML = criarEstadoVazio('📋', 'Sem registros', 'Adicione um cuidado clicando no botão acima!');
  } else {
    var html = '<div class="lista-registros">';
    for (var i = 0; i < filtrados.length; i++) {
      html += criarItemRegistro(filtrados[i], true);
    }
    html += '</div>';
    container.innerHTML = html;
  }
}

function criarItemRegistro(registro, mostrarAcoes) {
  var tipo      = TIPOS_CUIDADO[registro.tipo] || TIPOS_CUIDADO.other;
  var concluido = registro.concluido == 1;

  var hojeStr = new Date().toISOString().split('T')[0];
  var vencido = registro.proximo && registro.proximo < hojeStr && !concluido;

  var badgeVencido = vencido ? ' <span class="badge-vencido">⚠️ Vencido</span>' : '';
  var proximo   = registro.proximo ? ' • Próximo: ' + formatarData(registro.proximo) + badgeVencido : '';
  var nomePet   = registro.nome_pet ? '🐾 ' + registro.nome_pet + ' • ' : '';
  var horario   = registro.horario ? ' às ' + registro.horario : '';

  var descricao = registro.descricao
    ? '<div class="desc-registro">' + registro.descricao + '</div>'
    : '';

  var btnConcluir = '';
  var acoes       = '';

  if (mostrarAcoes) {
    var petId = registro.pet_id || estado.petAtivo;
    btnConcluir = `
      <button
        class="btn-concluir ${concluido ? 'marcado' : ''}"
        onclick="alternarConcluido(${registro.id}, ${concluido ? 1 : 0})"
        title="${concluido ? 'Marcar como pendente' : 'Marcar como concluído'}">
        ${concluido ? '✓' : ''}
      </button>`;

    acoes = `
      <div class="acoes-registro">
        <button class="btn btn-pequeno btn-secundario" onclick="abrirModalRegistro(${petId}, ${registro.id})" title="Editar">✏️</button>
        <button class="btn btn-pequeno btn-perigo"     onclick="excluirRegistro(${registro.id})" title="Excluir">🗑️</button>
      </div>`;
  }

  var classes = 'item-registro';
  if (concluido) classes += ' concluido';
  if (vencido)   classes += ' vencido';

  return `
    <div class="${classes}">
      ${btnConcluir}
      <div class="icone-tipo ${tipo.classe}">${tipo.icone}</div>
      <div class="corpo-registro">
        <div class="titulo-registro">${registro.titulo}</div>
        <div class="meta-registro">${nomePet}${formatarData(registro.data)}${horario}${proximo}</div>
        ${descricao}
      </div>
      ${acoes}
    </div>`;
}

async function carregarTodosRegistros() {
  var tipo  = porId('filtro-tipo')?.value   || '';
  var petId = porId('filtro-pet')?.value    || '';

  var url = 'api/records.php?tipo=' + tipo + '&pet_id=' + petId;
  var resultado = await chamarAPI(url);
  var registros = resultado.dados || [];

  var container = porId('lista-todos-registros');

  if (registros.length === 0) {
    container.innerHTML = criarEstadoVazio('📋', 'Nenhum registro encontrado', 'Tente outro filtro ou adicione registros!');
  } else {
    var html = '<div class="lista-registros">';
    for (var i = 0; i < registros.length; i++) {
      html += criarItemRegistro(registros[i], true);
    }
    html += '</div>';
    container.innerHTML = html;
  }

  var selectPet = porId('filtro-pet');
  if (selectPet && !selectPet.dataset.carregado) {
    var resPets = await chamarAPI('api/pets.php');
    (resPets.dados || []).forEach(function(pet) {
      var opcao = document.createElement('option');
      opcao.value       = pet.id;
      opcao.textContent = pet.emoji + ' ' + pet.nome;
      selectPet.appendChild(opcao);
    });
    selectPet.dataset.carregado = '1';
  }
}

async function abrirModalRegistro(petId = null, registroId = null) {
  estado.editandoRegistro = registroId;

  porId('form-registro').reset();
  porSeletor('#form-registro .msg-erro').forEach(function(e) { e.textContent = ''; });
  porSeletor('#form-registro .input-form, #form-registro .select-form').forEach(function(el) { el.classList.remove('erro'); });

  porId('titulo-modal-registro').textContent = registroId ? 'Editar Registro' : 'Novo Cuidado';

  porId('data-registro').value = new Date().toISOString().split('T')[0];

  var selectPet = porId('pet-id-registro');
  selectPet.innerHTML = '<option value="">Selecione o pet...</option>';

  var resPets = await chamarAPI('api/pets.php');
  (resPets.dados || []).forEach(function(pet) {
    var opcao = document.createElement('option');
    opcao.value       = pet.id;
    opcao.textContent = pet.emoji + ' ' + pet.nome;
    // Pré-seleciona o pet atual se vier da tela de detalhe
    if (pet.id == petId || pet.id == estado.petAtivo) {
      opcao.selected = true;
    }
    selectPet.appendChild(opcao);
  });

  if (registroId) {
    var resReg = await chamarAPI('api/records.php?id=' + registroId);
    if (resReg.sucesso) {
      var r = resReg.dados;
      porId('pet-id-registro').value    = r.pet_id;
      porId('tipo-registro').value      = r.tipo;
      porId('titulo-registro').value    = r.titulo;
      porId('desc-registro').value      = r.descricao || '';
      porId('data-registro').value      = r.data;
      porId('horario-registro').value   = r.horario || '';
      porId('proximo-registro').value   = r.proximo || '';
    }
  }

  porSeletor('#form-registro [data-contador]').forEach(function(c) {
    c.dispatchEvent(new Event('input'));
  });

  porId('modal-registro').classList.add('aberto');
}

function fecharModalRegistro() {
  porId('modal-registro').classList.remove('aberto');
  estado.editandoRegistro = null;
}

function validarFormRegistro() {
  var valido = true;

  ['erro-pet-reg', 'erro-tipo-reg', 'erro-titulo-reg', 'erro-data-reg'].forEach(function(id) {
    porId(id).textContent = '';
  });
  porSeletor('#form-registro .input-form, #form-registro .select-form').forEach(function(el) {
    el.classList.remove('erro');
  });

  if (!porId('pet-id-registro').value) {
    porId('erro-pet-reg').textContent = 'Selecione um pet.';
    porId('pet-id-registro').classList.add('erro');
    valido = false;
  }

  if (!porId('tipo-registro').value) {
    porId('erro-tipo-reg').textContent = 'Selecione o tipo de cuidado.';
    porId('tipo-registro').classList.add('erro');
    valido = false;
  }

  var titulo = porId('titulo-registro').value.trim();
  if (!titulo) {
    porId('erro-titulo-reg').textContent = 'O título é obrigatório.';
    porId('titulo-registro').classList.add('erro');
    valido = false;
  } else if (titulo.length > 100) {
    porId('erro-titulo-reg').textContent = 'O título deve ter no máximo 100 caracteres.';
    porId('titulo-registro').classList.add('erro');
    valido = false;
  }

  if (!porId('data-registro').value) {
    porId('erro-data-reg').textContent = 'A data é obrigatória.';
    porId('data-registro').classList.add('erro');
    valido = false;
  }

  return valido;
}

async function salvarRegistro() {
  if (!validarFormRegistro()) return;

  var dados = {
    pet_id:    porId('pet-id-registro').value,
    tipo:      porId('tipo-registro').value,
    titulo:    porId('titulo-registro').value.trim(),
    descricao: porId('desc-registro').value.trim(),
    data:      porId('data-registro').value,
    horario:   porId('horario-registro').value || null,
    proximo:   porId('proximo-registro').value || null
  };

  var btnSalvar = porId('btn-salvar-registro');
  btnSalvar.disabled = true;
  btnSalvar.innerHTML = '<span class="spinner"></span> Salvando...';

  try {
    var resultado;

    if (estado.editandoRegistro) {
      resultado = await chamarAPI('api/records.php?id=' + estado.editandoRegistro, {
        method: 'PUT',
        body: JSON.stringify(dados)
      });
    } else {
      resultado = await chamarAPI('api/records.php', {
        method: 'POST',
        body: JSON.stringify(dados)
      });
    }

    if (resultado.sucesso) {
      mostrarAviso(resultado.mensagem, 'sucesso');
      fecharModalRegistro();
      if (estado.telaAtual === 'detalhe')   carregarDetalhePet(estado.petAtivo);
      else if (estado.telaAtual === 'registros') carregarTodosRegistros();
      else carregarDashboard();
    } else {
      mostrarAviso(resultado.mensagem || 'Erro ao salvar.', 'erro');
    }

  } catch (e) {
    mostrarAviso('Erro de conexão com o servidor.', 'erro');
  }

  btnSalvar.disabled = false;
  btnSalvar.innerHTML = 'Salvar';
}

async function excluirRegistro(id) {
  pedirConfirmacao(
    'Excluir registro?',
    'Esta ação não pode ser desfeita.',
    async function() {
      var resultado = await chamarAPI('api/records.php?id=' + id, { method: 'DELETE' });

      if (resultado.sucesso) {
        mostrarAviso(resultado.mensagem, 'sucesso');
        if (estado.telaAtual === 'detalhe')        carregarDetalhePet(estado.petAtivo);
        else if (estado.telaAtual === 'registros') carregarTodosRegistros();
        else carregarDashboard();
      } else {
        mostrarAviso(resultado.mensagem, 'erro');
      }
    }
  );
}
function atualizarRacas(especie) {
  var selectRaca = porId('raca-pet');
  var racas = RACAS[especie] || [];

  // Limpa as opções atuais
  selectRaca.innerHTML = '';

  if (racas.length === 0) {
    selectRaca.innerHTML = '<option value="">Selecione a espécie primeiro...</option>';
    return;
  }

  var opcaoPadrao = document.createElement('option');
  opcaoPadrao.value       = '';
  opcaoPadrao.textContent = 'Selecione a raça...';
  selectRaca.appendChild(opcaoPadrao);

  racas.forEach(function(raca) {
    var opcao = document.createElement('option');
    opcao.value       = raca;
    opcao.textContent = raca;
    selectRaca.appendChild(opcao);
  });
}

function criarEstadoVazio(icone, titulo, texto) {
  return `
    <div class="estado-vazio">
      <div class="icone-vazio">${icone}</div>
      <h3>${titulo}</h3>
      <p>${texto}</p>
    </div>`;
}
async function alternarConcluido(id, concluido) {
  var novoValor = concluido ? 0 : 1;

  var resultado = await chamarAPI('api/records.php?id=' + id, {
    method: 'PATCH',
    body: JSON.stringify({ concluido: novoValor })
  });

  if (resultado.sucesso) {
    if (estado.telaAtual === 'detalhe')        carregarDetalhePet(estado.petAtivo);
    else if (estado.telaAtual === 'registros') carregarTodosRegistros();
    else carregarDashboard();
  } else {
    mostrarAviso('Erro ao atualizar registro.', 'erro');
  }
}
function inicializarTema() {
  var temaSalvo = localStorage.getItem('petcare-tema');
  if (temaSalvo === 'escuro') document.body.classList.add('modo-escuro');
  atualizarIconeTema();

  var btn = porId('btn-tema');
  if (!btn) return;
  btn.addEventListener('click', function() {
    document.body.classList.toggle('modo-escuro');
    var escuro = document.body.classList.contains('modo-escuro');
    localStorage.setItem('petcare-tema', escuro ? 'escuro' : 'claro');
    atualizarIconeTema();
  });
}

function atualizarIconeTema() {
  var btn = porId('btn-tema');
  if (!btn) return;
  var escuro = document.body.classList.contains('modo-escuro');
  btn.textContent = escuro ? '☀️' : '🌙';
  btn.title = escuro ? 'Voltar ao modo claro' : 'Alternar para modo escuro';
}

function inicializarBotaoTopo() {
  var btn = porId('btn-topo');
  if (!btn) return;

  function checar() {
    if (window.scrollY > 300) btn.classList.add('visivel');
    else                       btn.classList.remove('visivel');
  }
  window.addEventListener('scroll', checar);
  checar();

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function inicializarContadores() {
  porSeletor('[data-contador]').forEach(function(campo) {
    var max = parseInt(campo.getAttribute('maxlength'), 10);
    if (!max) return;

    var contador = document.createElement('span');
    contador.className = 'contador-chars';
    campo.parentNode.insertBefore(contador, campo.nextSibling);

    function atualizar() {
      var atual = campo.value.length;
      contador.textContent = atual + ' / ' + max;
      contador.classList.remove('proximo-limite', 'no-limite');
      if (atual >= max)            contador.classList.add('no-limite');
      else if (atual >= max * 0.9) contador.classList.add('proximo-limite');
    }

    campo.addEventListener('input', atualizar);
    // Atualiza também quando o form é resetado (modal de edição)
    var form = campo.closest('form');
    if (form) form.addEventListener('reset', function() { setTimeout(atualizar, 0); });

    atualizar();
  });
}

document.addEventListener('DOMContentLoaded', function() {

  inicializarTema();
  inicializarBotaoTopo();
  inicializarContadores();

  var campaNascimento = porId('nascimento-pet');
  if (campaNascimento) {
    var hoje = new Date().toISOString().split('T')[0];
    campaNascimento.setAttribute('max', hoje);
  }

  porSeletor('.btn-nav[data-tela]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      mostrarTela(btn.dataset.tela);
    });
  });

  porId('btn-confirmar-sim').addEventListener('click', async function() {
    porId('fundo-confirmar').classList.remove('aberto');
    if (estado.callbackConfirmar) {
      await estado.callbackConfirmar();
    }
    estado.callbackConfirmar = null;
  });

  porId('btn-confirmar-nao').addEventListener('click', function() {
    porId('fundo-confirmar').classList.remove('aberto');
    estado.callbackConfirmar = null;
  });

  porSeletor('.opcao-emoji').forEach(function(opcao) {
    opcao.addEventListener('click', function() {
      // Remove seleção de todos
      porSeletor('.opcao-emoji').forEach(function(e) { e.classList.remove('selecionado'); });
      // Seleciona o clicado
      opcao.classList.add('selecionado');
    });
  });

  var timerBusca;
  var inputBusca = porId('input-busca-pet');
  if (inputBusca) {
    inputBusca.addEventListener('input', function() {
      clearTimeout(timerBusca);
      timerBusca = setTimeout(carregarPets, 400);
    });
  }

var filtroEspecie = porId('filtro-especie');
var especiePet = porId('especie-pet');
if (especiePet) {
  especiePet.addEventListener('change', function() {
    atualizarRacas(this.value);
  });
}
  if (filtroEspecie) {
    filtroEspecie.addEventListener('change', carregarPets);
  }

  var filtroTipo = porId('filtro-tipo');
  if (filtroTipo) filtroTipo.addEventListener('change', carregarTodosRegistros);

  var filtroPet = porId('filtro-pet');
  if (filtroPet) filtroPet.addEventListener('change', carregarTodosRegistros);

  // Fecha os modais ao clicar fora deles
  porId('modal-pet').addEventListener('click', function(e) {
    if (e.target === porId('modal-pet')) fecharModalPet();
  });

  porId('modal-registro').addEventListener('click', function(e) {
    if (e.target === porId('modal-registro')) fecharModalRegistro();
  });

  // Inicia na tela do dashboard
  mostrarTela('dashboard');
});
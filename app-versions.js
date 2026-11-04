// ===== Modo "frame" (comparação A/B lado a lado) =====
// Na tela comparar.html cada celular é um <iframe name="ab:A"> / <iframe name="ab:B">.
// Como os dois iframes são da mesma origem, eles dividiriam o mesmo sessionStorage (versão escolhida,
// endereço, complemento...) e o mesmo histórico. Aqui cada frame ganha o seu próprio "espaço":
//  - as chaves do sessionStorage ganham o prefixo do nome do frame;
//  - history.back() usa uma pilha de navegação própria do frame (não mexe no outro).
// Fora da comparação (window.name sem "ab:") nada disso é ativado.
(function () {
  var nome = window.name || '';
  if (nome.indexOf('ab:') !== 0) return;
  window.APP_FRAME = nome;
  var prefixo = nome + '|';
  var P = Storage.prototype;
  var get = P.getItem, set = P.setItem, rem = P.removeItem;
  P.getItem = function (k) { return this === window.sessionStorage ? get.call(this, prefixo + k) : get.call(this, k); };
  P.setItem = function (k, v) { return this === window.sessionStorage ? set.call(this, prefixo + k, v) : set.call(this, k, v); };
  P.removeItem = function (k) { return this === window.sessionStorage ? rem.call(this, prefixo + k) : rem.call(this, k); };

  // Pilha de páginas visitadas neste frame
  var CH = '__nav';
  var pilha = [];
  try { pilha = JSON.parse(sessionStorage.getItem(CH) || '[]'); } catch (e) {}
  var aqui = location.pathname.split('/').pop() + location.search;
  if (pilha[pilha.length - 1] !== aqui) pilha.push(aqui);
  try { sessionStorage.setItem(CH, JSON.stringify(pilha)); } catch (e) {}
  History.prototype.back = function () {
    var p = [];
    try { p = JSON.parse(sessionStorage.getItem(CH) || '[]'); } catch (e) {}
    p.pop();
    var anterior = p[p.length - 1];
    if (!anterior) return; // primeira tela do frame: não há para onde voltar
    try { sessionStorage.setItem(CH, JSON.stringify(p)); } catch (e) {}
    location.href = anterior;
  };
})();

// Versões do protótipo. Uma única base de código; cada versão liga/desliga
// melhorias por "flags". As telas só consultam window.APP_VERSION.flags.
// Para criar uma nova versão: adicionar um item em VERSOES e usar as flags nas telas.
(function () {
  var VERSOES = {
    v1: {
      id: 'v1',
      nome: 'V1 - As is',
      descricao: 'Cópia da jornada como está no ar hoje.',
      flags: {
        // Alterar endereço no checkout: no ar hoje refaz a jornada (inclusive dados pessoais)
        manterDadosAoAlterarEndereco: false,
        // Vitrine: link "Mais detalhes" no card, abaixo do botão "Eu quero".
        // TEMPORARIAMENTE DESLIGADO em todas as versões (V2 e testes A/B). Para voltar no futuro: maisDetalhesNoCard: true na versão desejada.
        maisDetalhesNoCard: false,
        // Depois do endereço, a V2 abre a PDP com toggle de fidelidade (pdp-v2) em vez da PDP/resumo antigos
        pdpV2: false,
        // Dados pessoais no checkout: V2 não pede RG nem nome da mãe
        dadosPessoaisSemRgMae: false,
        // Resumo dos dados pessoais com rótulo em cada dado (CPF, E-mail, Telefone...)
        dadosResumoComLabels: false,
        // Agendamento: primeiro a data, depois o período
        agendamentoDataPrimeiro: false,
        // Formas de pagamento: sem o texto de apoio "Sem desconto nesta forma de pagamento"
        pagamentoSemTextoApoio: false,
        // Tela de conclusão: layout "Pedido em análise" (data e número no topo, endereço detalhado)
        conclusaoV2: false,
        // Modal de cobertura (novo endereço): V1 mostra só "Número: …, CEP: …" como no ar; V2 mostra o endereço completo
        coberturaComEnderecoCompleto: false,
        // Teste 1: a PDP vem logo depois de escolher a oferta, antes de selecionar o endereço (depois do endereço vai direto aos dados pessoais)
        pdpAntesDoEndereco: false,
        // Teste 2: endereço tratado de uma vez no início — modal "Cobertura na região" já pede complemento/referência; sem etapa de endereço no checkout
        enderecoUnicoNoModal: false,
        // Teste 2: complemento obrigatório para todos (a API ainda não diz quais endereços precisam). false = opcional
        complementoObrigatorioParaTodos: true,
        // Teste 3: depois de adicionar um novo endereço, pula a volta à lista de endereços e segue direto para a PDP
        pularListaAposNovoEndereco: false,
        // Teste 4: o bloco de fidelidade (com/sem) sai da PDP e vai para a etapa de pagamento do checkout, seguido do total e do Continuar
        fidelidadeNoPagamento: false,
        // Teste 5: agendamento com botão "Ver mais datas" (mais 10 datas numa tela própria)
        maisDatas: false,
      },
    },
    v2: {
      id: 'v2',
      nome: 'V2 - Backlog Ing',
      descricao: 'Melhorias mapeadas pela Ingrid',
      flags: {
        // Melhorias entram aqui conforme forem definidas, tela a tela.
        manterDadosAoAlterarEndereco: false,
        maisDetalhesNoCard: false, // desligado por ora em todas as versões (voltar para true para reexibir o "Mais detalhes" nos cards)
        pdpV2: true,
        dadosPessoaisSemRgMae: true,
        dadosResumoComLabels: true,
        agendamentoDataPrimeiro: true,
        pagamentoSemTextoApoio: true,
        conclusaoV2: true,
        coberturaComEnderecoCompleto: true,
        // Teste 1: a PDP vem logo depois de escolher a oferta, antes de selecionar o endereço (depois do endereço vai direto aos dados pessoais)
        pdpAntesDoEndereco: false,
        enderecoUnicoNoModal: false,
        complementoObrigatorioParaTodos: true,
        // Teste 3: depois de adicionar um novo endereço, pula a volta à lista de endereços e segue direto para a PDP
        pularListaAposNovoEndereco: false,
        // Teste 4: o bloco de fidelidade (com/sem) sai da PDP e vai para a etapa de pagamento do checkout, com o total fixo no rodapé
        fidelidadeNoPagamento: false,
        // Teste 5: agendamento com botão "Ver mais datas" (mais 10 datas numa tela própria)
        maisDatas: false,
      },
    },
    // ---- Versões B dos testes A/B (ficam fora da lista de versões do index; aparecem só em comparar.html) ----
    t1: {
      id: 't1',
      nome: 'Teste 1 - PDP antes do endereço',
      descricao: 'V2 com a PDP logo após selecionar a oferta, antes do endereço.',
      oculta: true,
      flags: {
        maisDetalhesNoCard: false, // desligado por ora em todas as versões (voltar para true para reexibir o "Mais detalhes" nos cards)
        pdpV2: true,
        dadosPessoaisSemRgMae: true,
        dadosResumoComLabels: true,
        agendamentoDataPrimeiro: true,
        pagamentoSemTextoApoio: true,
        conclusaoV2: true,
        coberturaComEnderecoCompleto: true,
        manterDadosAoAlterarEndereco: false,
        pdpAntesDoEndereco: true,
        // Teste 2: endereço tratado de uma vez no início — modal "Cobertura na região" já pede complemento/referência; sem etapa de endereço no checkout
        enderecoUnicoNoModal: false,
        // Teste 2: complemento obrigatório para todos (a API ainda não diz quais endereços precisam). false = opcional
        complementoObrigatorioParaTodos: true,
        // Teste 3: depois de adicionar um novo endereço, pula a volta à lista de endereços e segue direto para a PDP
        pularListaAposNovoEndereco: false,
        // Teste 4: o bloco de fidelidade (com/sem) sai da PDP e vai para a etapa de pagamento do checkout, com o total fixo no rodapé
        fidelidadeNoPagamento: false,
        // Teste 5: agendamento com botão "Ver mais datas" (mais 10 datas numa tela própria)
        maisDatas: false,
      },
    },
    t2: {
      id: 't2',
      nome: 'Teste 2 - Endereço em um único modal',
      descricao: 'V2 com endereço tratado de uma vez: complemento no modal de cobertura e sem etapa de endereço no checkout.',
      oculta: true,
      flags: {
        maisDetalhesNoCard: false, // desligado por ora em todas as versões (voltar para true para reexibir o "Mais detalhes" nos cards)
        pdpV2: true,
        dadosPessoaisSemRgMae: true,
        dadosResumoComLabels: true,
        agendamentoDataPrimeiro: true,
        pagamentoSemTextoApoio: true,
        conclusaoV2: true,
        coberturaComEnderecoCompleto: true,
        manterDadosAoAlterarEndereco: false,
        pdpAntesDoEndereco: false,
        enderecoUnicoNoModal: true,
        complementoObrigatorioParaTodos: true,
        // Teste 3: depois de adicionar um novo endereço, pula a volta à lista de endereços e segue direto para a PDP
        pularListaAposNovoEndereco: false,
        // Teste 4: o bloco de fidelidade (com/sem) sai da PDP e vai para a etapa de pagamento do checkout, com o total fixo no rodapé
        fidelidadeNoPagamento: false,
        // Teste 5: agendamento com botão "Ver mais datas" (mais 10 datas numa tela própria)
        maisDatas: false,
      },
    },
    t3: {
      id: 't3',
      nome: 'Teste 3 - Pular a lista após novo endereço',
      descricao: 'V2 sem a volta à lista de endereços depois de adicionar um endereço novo.',
      oculta: true,
      flags: {
        maisDetalhesNoCard: false, // desligado por ora em todas as versões (voltar para true para reexibir o "Mais detalhes" nos cards)
        pdpV2: true,
        dadosPessoaisSemRgMae: true,
        dadosResumoComLabels: true,
        agendamentoDataPrimeiro: true,
        pagamentoSemTextoApoio: true,
        conclusaoV2: true,
        coberturaComEnderecoCompleto: true,
        manterDadosAoAlterarEndereco: false,
        pdpAntesDoEndereco: false,
        enderecoUnicoNoModal: false,
        complementoObrigatorioParaTodos: true,
        pularListaAposNovoEndereco: true,
        // Teste 4: o bloco de fidelidade (com/sem) sai da PDP e vai para a etapa de pagamento do checkout, com o total fixo no rodapé
        fidelidadeNoPagamento: false,
        // Teste 5: agendamento com botão "Ver mais datas" (mais 10 datas numa tela própria)
        maisDatas: false,
      },
    },
    t4: {
      id: 't4',
      nome: 'Teste 4 - Fidelidade no pagamento',
      descricao: 'V2 com a escolha de fidelidade na etapa de pagamento (e não na PDP), seguida do total e do Continuar.',
      oculta: true,
      flags: {
        maisDetalhesNoCard: false, // desligado por ora em todas as versões (voltar para true para reexibir o "Mais detalhes" nos cards)
        pdpV2: true,
        dadosPessoaisSemRgMae: true,
        dadosResumoComLabels: true,
        agendamentoDataPrimeiro: true,
        pagamentoSemTextoApoio: true,
        conclusaoV2: true,
        coberturaComEnderecoCompleto: true,
        manterDadosAoAlterarEndereco: false,
        pdpAntesDoEndereco: false,
        enderecoUnicoNoModal: false,
        complementoObrigatorioParaTodos: true,
        pularListaAposNovoEndereco: false,
        fidelidadeNoPagamento: true,
        // Teste 5: agendamento com botão "Ver mais datas" (mais 10 datas numa tela própria)
        maisDatas: false,
      },
    },
    t5: {
      id: 't5',
      nome: 'Teste 5 - Mais datas no agendamento',
      descricao: 'V2 com o botão "Ver mais datas" no agendamento (mais 10 datas em uma tela própria).',
      oculta: true,
      flags: {
        maisDetalhesNoCard: false, // desligado por ora em todas as versões (voltar para true para reexibir o "Mais detalhes" nos cards)
        pdpV2: true,
        dadosPessoaisSemRgMae: true,
        dadosResumoComLabels: true,
        agendamentoDataPrimeiro: true,
        pagamentoSemTextoApoio: true,
        conclusaoV2: true,
        coberturaComEnderecoCompleto: true,
        manterDadosAoAlterarEndereco: false,
        pdpAntesDoEndereco: false,
        enderecoUnicoNoModal: false,
        complementoObrigatorioParaTodos: true,
        pularListaAposNovoEndereco: false,
        fidelidadeNoPagamento: false,
        maisDatas: true,
      },
    },
  };
  var PADRAO = 'v1';
  var CHAVE = 'appVersao';
  var CHAVE_SELO = 'appMostrarSelo';

  function ler(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  // Ordem: ?v= na URL (link direto para teste) > escolha guardada na sessão > padrão (V1)
  var daUrl = null;
  try { daUrl = new URLSearchParams(location.search).get('v'); } catch (e) {}
  var id = (daUrl && VERSOES[daUrl]) ? daUrl : (VERSOES[ler(CHAVE)] ? ler(CHAVE) : PADRAO);
  gravar(CHAVE, id);

  var atual = VERSOES[id];
  window.APP_VERSOES = VERSOES;
  window.APP_VERSION = atual;
  window.setAppVersion = function (novoId) { if (VERSOES[novoId]) gravar(CHAVE, novoId); };
  window.setMostrarSelo = function (v) { try { localStorage.setItem(CHAVE_SELO, v ? '1' : '0'); } catch (e) {} };

  // Selo discreto no canto da tela com a versão ativa (pode ser escondido na index)
  var mostrar = true;
  try { mostrar = localStorage.getItem(CHAVE_SELO) !== '0'; } catch (e) {}
  var frame = document.querySelector('.app-frame');
  if (mostrar && frame) {
    var selo = document.createElement('div');
    selo.textContent = atual.nome;
    selo.setAttribute('aria-hidden', 'true');
    selo.style.cssText = 'position:absolute;top:3px;left:50%;transform:translateX(-50%);white-space:nowrap;z-index:100;font:500 9px/1 Roboto,sans-serif;'
      + 'color:#525252;background:rgba(255,255,255,.85);border:1px solid #dbdbdb;border-radius:8px;'
      + 'padding:3px 6px;pointer-events:none;opacity:.8;';
    frame.appendChild(selo);
  }
})();

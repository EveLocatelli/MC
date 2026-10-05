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
        // Vitrine: link "Mais detalhes" no card, abaixo do botão "Eu quero"
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
      },
    },
    v2: {
      id: 'v2',
      nome: 'V2 - Backlog Ing',
      descricao: 'Melhorias mapeadas pela Ingrid',
      flags: {
        // Melhorias entram aqui conforme forem definidas, tela a tela.
        manterDadosAoAlterarEndereco: false,
        maisDetalhesNoCard: true,
        pdpV2: true,
        dadosPessoaisSemRgMae: true,
        dadosResumoComLabels: true,
        agendamentoDataPrimeiro: true,
        pagamentoSemTextoApoio: true,
        conclusaoV2: true,
        coberturaComEnderecoCompleto: true,
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

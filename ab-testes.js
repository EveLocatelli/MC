// Testes A/B para comparar lado a lado (index.html -> comparar.html?teste=N).
// Cada teste tem dois lados:
//   versao: id de uma versão de app-versions.js (v1, v2...). Para testar uma variável nova,
//           crie uma versão nova lá (com a flag ligada) e aponte o lado B para ela.
//   inicio: página em que o frame começa (padrão: ofertas-fibra.html). Dá para começar direto numa etapa,
//           ex.: 'selecao-endereco.html?produto=fibra-1gb' ou, para o checkout já na etapa de pagamento,
//           'checkout.html?produto=fibra-1gb&etapa=pagamento' (ou '&etapa=agenda' para parar no agendamento).
// Lado A de todos os testes = V2 (melhorias mapeadas pela Ing). Lado B = versão com a melhoria
// em teste (por enquanto aponta para a V2 até cada variante ser criada).
// Preencha nome, descrição e hipótese de cada teste conforme forem sendo definidos.
(function () {
  function teste(id) {
    return {
      id: id,
      nome: 'Teste ' + id,
      descricao: 'A definir',
      hipotese: '',
      a: { rotulo: 'Controle', versao: 'v2', inicio: 'ofertas-fibra.html' },
      b: { rotulo: 'Variante', versao: 'v2', inicio: 'ofertas-fibra.html' },
    };
  }
  var t1 = teste(1);
  t1.nome = 'Teste 1 - Antecipação da PDP';
  t1.descricao = 'PDP logo após selecionar a oferta, antes do endereço';
  t1.hipotese = 'Antecipar a PDP reduz o abandono na etapa de endereço: o cliente sente falta de ver os detalhes do produto logo após escolher a oferta.';
  t1.a = { rotulo: 'Endereço antes da PDP', versao: 'v2', inicio: 'ofertas-fibra.html' };
  t1.b = { rotulo: 'PDP antes do endereço', versao: 't1', inicio: 'ofertas-fibra.html' };
  var t2 = teste(2);
  t2.nome = 'Teste 2 - Endereço em um único modal';
  t2.descricao = 'Endereço tratado de uma vez só, no início da jornada';
  t2.hipotese = 'Tratar o endereço em um único modal, no início da jornada, reduz o abandono sem impactar a instalação.';
  t2.a = { rotulo: 'Endereço em várias etapas', versao: 'v2', inicio: 'ofertas-fibra.html' };
  t2.b = { rotulo: 'Endereço em um único modal', versao: 't2', inicio: 'ofertas-fibra.html' };
  var t3 = teste(3);
  t3.nome = 'Teste 3 - Avançar após novo endereço';
  t3.descricao = 'Pula a volta à lista de endereços depois de adicionar um endereço novo';
  t3.hipotese = 'Avançar a jornada logo após a inclusão de um novo endereço, excluindo a tela adicional (lista de endereços), reduz o abandono.';
  t3.a = { rotulo: 'Volta à lista de endereços', versao: 'v2', inicio: 'ofertas-fibra.html' };
  t3.b = { rotulo: 'Segue direto para a PDP', versao: 't3', inicio: 'ofertas-fibra.html' };
  var t4 = teste(4);
  t4.nome = 'Teste 4 - Fidelidade no pagamento';
  t4.descricao = 'Mover o bloco de fidelidade da PDP para a etapa de pagamento';
  t4.hipotese = 'Mover a escolha com/sem fidelidade para o pagamento (última etapa antes da conclusão), com o total e o Continuar logo depois do bloco de fidelidade, simplifica a PDP.';
  // Este teste começa direto na etapa de pagamento do checkout (para apresentar sem refazer a jornada)
  var pagamento = 'checkout.html?produto=fibra-1gb&etapa=pagamento';
  t4.a = { rotulo: 'Fidelidade na PDP', versao: 'v2', inicio: pagamento };
  t4.b = { rotulo: 'Fidelidade no pagamento', versao: 't4', inicio: pagamento };
  var t5 = teste(5);
  t5.nome = 'Teste 5 - Mais datas no agendamento';
  t5.descricao = 'Botão "Ver mais datas" na etapa de agendamento (mais 10 datas)';
  t5.hipotese = 'Oferecer mais datas de agendamento, além das 10 exibidas, ajuda o cliente a encontrar um dia que sirva e a concluir o pedido.';
  // Começa direto na etapa de agendamento do checkout
  var agendamento = 'checkout.html?produto=fibra-1gb&etapa=agenda';
  t5.a = { rotulo: '10 datas', versao: 'v2', inicio: agendamento };
  t5.b = { rotulo: '10 datas + Ver mais datas', versao: 't5', inicio: agendamento };
  window.AB_TESTES = [t1, t2, t3, t4, t5];
})();

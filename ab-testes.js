// Testes A/B para comparar lado a lado (index.html -> comparar.html?teste=N).
// Cada teste tem dois lados:
//   versao: id de uma versão de app-versions.js (v1, v2...). Para testar uma variável nova,
//           crie uma versão nova lá (com a flag ligada) e aponte o lado B para ela.
//   inicio: página em que o frame começa (padrão: ofertas-fibra.html). Dá para começar direto
//           numa etapa, ex.: 'selecao-endereco.html?produto=fibra-1gb'.
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
  window.AB_TESTES = [t1, t2, t3, teste(4), teste(5)];
})();

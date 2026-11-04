// Teste 2 (flag enderecoUnicoNoModal): o modal "Cobertura na região" já traz o endereço, o complemento e a referência.
// É usado por selecao-endereco.html (endereço da lista) e adicionar-endereco.html (endereço novo via CEP).
(function () {
  // "RUA CEDRO ALTO, 20 - BRUSQUE/SC - CEP: 88359-700" -> "Rua Cedro Alto, 20 - Brusque/SC - CEP: 88359-700"
  function capitalizar(txt) {
    var minusculas = ['de', 'da', 'do', 'das', 'dos', 'e'];
    return String(txt || '').toLowerCase()
      .replace(/(^|[\s,(-])([a-zà-ú])/g, function (m, pre, c) { return pre + c.toUpperCase(); })
      .replace(/\b(De|Da|Do|Das|Dos|E)\b/g, function (m) { return minusculas.indexOf(m.toLowerCase()) >= 0 ? m.toLowerCase() : m; })
      .replace(/\/([a-z]{1,2})\b/gi, function (m, uf) { return '/' + uf.toUpperCase(); })
      .replace(/\bcep\b/i, 'CEP');
  }

  // Quem pede complemento é decidido pela API (endereço identificado como "precisa de complemento").
  // Enquanto a API não existe, a regra vem da flag complementoObrigatorioParaTodos da versão.
  function exigeComplemento(/* endereco */) {
    var f = (window.APP_VERSION && window.APP_VERSION.flags) || {};
    return f.complementoObrigatorioParaTodos !== false;
  }

  // Preenche o corpo do sheet. opts: { endereco, obrigatorio, referencia, onEditar(), onContinuar(complemento, referencia) }
  function render(corpo, opts) {
    corpo.innerHTML =
      '<p class="message is-success">Este plano tem cobertura no endereço selecionado.</p>'
      + '<div class="tag is-success"><i class="mdn-Icon-check-circulo" aria-hidden="true"></i>Disponível neste endereço</div>'
      + '<div class="address-box"><p></p>'
      + '<button type="button" class="edit-btn" aria-label="Editar endereço"><span class="mdn-Icon-lapis mdn-Icon--md" aria-hidden="true"></span></button></div>'
      + '<div class="campos">'
      + '<div class="mdn-Input"><select id="scComp" class="mdn-Input-field" data-mdn-type="select" style="background-image:none">'
      + '<option value="" selected>Selecione</option><option value="Apartamento 1">Apartamento 1</option><option value="Apartamento 2">Apartamento 2</option><option value="Apartamento 3">Apartamento 3</option><option value="outro">Quero informar meu complemento</option></select>'
      + '<span class="mdn-Icon-baixo mdn-Icon--md mdn-Input-select-arrow"></span>'
      + '<label for="scComp" class="mdn-Input-label"></label></div>'
      + '<div class="mdn-Input" id="scOutroWrap" hidden><input class="mdn-Input-field" id="scOutro" type="text" autocomplete="off"><label for="scOutro" class="mdn-Input-label">Complemento</label></div>'
      + '<div class="mdn-Input"><input class="mdn-Input-field" id="scRef" type="text" autocomplete="off"><label for="scRef" class="mdn-Input-label">Referência (opcional)</label></div>'
      + '</div>'
      + '<button type="button" class="sheet-cta" id="scContinuar">Continuar</button>';
    corpo.querySelector('.address-box p').textContent = opts.endereco;
    corpo.querySelector('label[for="scComp"]').textContent = opts.obrigatorio ? 'Complemento*' : 'Complemento (opcional)';
    var sel = corpo.querySelector('#scComp'), outroWrap = corpo.querySelector('#scOutroWrap'),
        outro = corpo.querySelector('#scOutro'), ref = corpo.querySelector('#scRef'), btn = corpo.querySelector('#scContinuar');
    if (opts.referencia) { ref.value = opts.referencia; ref.closest('.mdn-Input').classList.add('mdn-Input--activatedField'); }
    function validar() {
      var ok = !opts.obrigatorio || (sel.value === 'outro' ? outro.value.trim().length > 0 : sel.value.length > 0);
      // Opcional com "Quero informar" aberto e vazio: também exige o texto, para não perder a intenção do usuário
      if (!opts.obrigatorio && sel.value === 'outro') ok = outro.value.trim().length > 0;
      btn.disabled = !ok;
    }
    sel.addEventListener('change', function () {
      sel.closest('.mdn-Input').classList.toggle('mdn-Input--activatedField', !!sel.value);
      outroWrap.hidden = sel.value !== 'outro';
      if (sel.value !== 'outro') outro.value = '';
      validar();
    });
    ['input', 'keyup', 'blur'].forEach(function (e) { outro.addEventListener(e, validar); });
    ref.addEventListener('input', function () { ref.closest('.mdn-Input').classList.toggle('mdn-Input--activatedField', !!ref.value); });
    corpo.querySelector('.edit-btn').addEventListener('click', function () { opts.onEditar && opts.onEditar(); });
    btn.addEventListener('click', function () {
      validar();
      if (btn.disabled) return;
      var c = sel.value === 'outro' ? outro.value.trim() : sel.value;
      if (!c) c = 'Sem complemento'; // opcional e deixado em branco
      opts.onContinuar(c, ref.value.trim());
    });
    validar();
  }

  window.SheetComplemento = { capitalizar: capitalizar, exigeComplemento: exigeComplemento, render: render };
})();

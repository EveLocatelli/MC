#!/usr/bin/env python3
"""Converte catalogo-ofertas-TEMPLATE.xlsx em app-catalog.js (fonte de dados
lida em runtime pelas telas da jornada do app, ex: ofertas-fibra.html).
Reexecutar sempre que a planilha for atualizada.

Mesmo padrão do gen_catalog.py do projeto M6 (Mude M6/scripts/gen_catalog.py),
adaptado pro schema mais enxuto do App (planilha ainda cobre só a aba
Páginas + Produtos — cresce conforme novas telas forem desenhadas no Figma).
"""

import json
import re
import openpyxl

SRC = "/Users/hitss/Desktop/App/catalogo-ofertas-TEMPLATE.xlsx"
OUT = "/Users/hitss/Desktop/App/app-catalog.js"

# Nome de marca (como escrito na coluna "Marcas incluídas") -> slug real no
# catálogo Mondrian Brands (mondrian.claro.com.br/brands/app/32px-alternative/<slug>.svg).
# Confirmado um a um contra o catálogo ao vivo (curl), nunca inventado — mesma
# lista base do M6, só com as marcas que já apareceram no App até agora.
BRAND_SLUGS = {
    "globoplay": "globoplay",
    "claro video": "claro-video",
    "skeelo": "skeelo",
    "mcafee": "mcafee",
    "claro banca": "claro-banca",
}
BRANDS_URL = "https://mondrian.claro.com.br/brands/app/32px-alternative/{}.svg"


def clean(v):
    if v is None:
        return ""
    return re.sub(r"[\s\xa0 ]+", " ", str(v)).strip()


def sheet_rows(ws):
    headers = [clean(ws.cell(row=1, column=c).value) for c in range(1, ws.max_column + 1)]
    rows = []
    for r in range(2, ws.max_row + 1):
        vals = [ws.cell(row=r, column=c).value for c in range(1, ws.max_column + 1)]
        if all(v in (None, "") for v in vals):
            continue
        rows.append(dict(zip(headers, vals)))
    return rows


def resolve_brands(raw):
    names = [n.strip() for n in clean(raw).split(",") if n.strip()]
    resolved = []
    unresolved = []
    for n in names:
        slug = BRAND_SLUGS.get(n.lower())
        if slug:
            resolved.append({"nome": n, "src": BRANDS_URL.format(slug)})
        else:
            unresolved.append(n)
    return resolved, unresolved


wb = openpyxl.load_workbook(SRC, data_only=True)
pagina_rows = sheet_rows(wb["Paginas"])
produto_rows = sheet_rows(wb["Produtos"])
endereco_rows = sheet_rows(wb["Enderecos"])
detalhe_rows = sheet_rows(wb["Detalhes do produto"]) if "Detalhes do produto" in wb.sheetnames else []
carac_rows = sheet_rows(wb["Caracteristicas"]) if "Caracteristicas" in wb.sheetnames else []
resumo_rows = sheet_rows(wb["Resumo do pedido"]) if "Resumo do pedido" in wb.sheetnames else []
pagto_rows = sheet_rows(wb["Formas de pagamento"]) if "Formas de pagamento" in wb.sheetnames else []

unresolved_brands_seen = set()

paginas = {}
for row in pagina_rows:
    pid = clean(row.get("ID da página (chave única)"))
    if not pid:
        continue
    paginas[pid] = {
        "id": pid,
        "categoria": clean(row.get("Categoria de produto exibida")),
        "titulo": clean(row.get("Título da barra superior (breadcrumb)")),
        "tituloPrincipal": clean(row.get("Título principal (H2)")),
        "subtitulo": clean(row.get("Subtítulo (parágrafo abaixo do título)")),
        "barraSuperiorEndereco": clean(row.get("Barra superior — tela de seleção de endereço")),
        "subtituloEndereco": clean(row.get("Subtítulo do plano — tela de seleção de endereço")),
        "produtos": [],  # preenchido abaixo, na ordem da coluna "Ordem no carrossel"
    }

produtos = {}
produtos_by_pagina = {}
for row in produto_rows:
    pid = clean(row.get("ID do produto (chave única)"))
    pagina_id = clean(row.get("ID da página (chave em Paginas)"))
    if not pid or pagina_id not in paginas:
        continue
    marcas, unresolved = resolve_brands(row.get("Marcas incluídas (separadas por vírgula, na ordem)"))
    unresolved_brands_seen.update(unresolved)
    ordem = row.get("Ordem no carrossel") or 0
    produtos[pid] = {
        "id": pid,
        "paginaId": pagina_id,
        "ordem": ordem,
        "nome": clean(row.get("Nome do produto")),
        "descricaoCard": clean(row.get("Descrição do card (texto abaixo do nome)")),
        "preco": float(row.get("Preço mensal (R$)") or 0),
        "marcas": marcas,
        "textoBotao": clean(row.get("Texto do botão")) or "Eu quero",
        "tituloConfirmacao": clean(row.get("Título do plano — tela de seleção de endereço")),
    }
    produtos_by_pagina.setdefault(pagina_id, []).append((ordem, pid))

# Página de produto (PDP): "Detalhes do produto" + "Caracteristicas" viram
# produtos[id]["detalhe"]; "Formas de pagamento" vira paginas[id]["pagamento"].
# Produto sem linha em "Detalhes do produto" fica sem "detalhe" (a tela usa fallback).
for row in detalhe_rows:
    pid = clean(row.get("ID do produto (chave em Produtos)"))
    if pid not in produtos:
        continue
    marcas, unresolved = resolve_brands(row.get("Apps inclusos (marcas, separadas por vírgula)"))
    unresolved_brands_seen.update(unresolved)
    produtos[pid]["detalhe"] = {
        "titulo": clean(row.get("Título da página de produto (H1)")),
        "descricao": clean(row.get("Descrição do produto")),
        "textoApps": clean(row.get("Texto dos apps inclusos")),
        "apps": marcas,
        "caracteristicas": [],
    }
for row in sorted(carac_rows, key=lambda r: r.get("Ordem") or 0):
    pid = clean(row.get("ID do produto (chave em Produtos)"))
    if pid in produtos and "detalhe" in produtos[pid]:
        produtos[pid]["detalhe"]["caracteristicas"].append({
            "icone": clean(row.get("Ícone Mondrian (ex: download, upload, modem, wifi)")),
            "titulo": clean(row.get("Título")),
            "texto": clean(row.get("Texto")),
        })
# Aba "Resumo do pedido": modal do carrinho -> produtos[id]["resumo"]
for row in resumo_rows:
    pid = clean(row.get("ID do produto (chave em Produtos)"))
    if pid not in produtos:
        continue
    marcas, unresolved = resolve_brands(row.get("Benefícios inclusos (marcas, separadas por vírgula)"))
    unresolved_brands_seen.update(unresolved)
    produtos[pid]["resumo"] = {
        "titulo": clean(row.get("Título curto (ex: 1 Giga)")),
        "rotulo": clean(row.get("Rótulo do plano")),
        "itens": [t.strip() for t in clean(row.get("Itens da lista (separados por ;)")).split(";") if t.strip()],
        "beneficios": marcas,
        "instalacao": clean(row.get("Instalação (texto exibido)")) or "Grátis",
        "fidelidadeMeses": int(row.get("Fidelidade — meses") or 12),
        "taxaAdesao": float(row.get("Taxa de adesão sem fidelidade (R$)") or 0),
    }

# Aba "Conclusao": tela final do pedido -> produtos[id]["conclusao"]
for row in (sheet_rows(wb["Conclusao"]) if "Conclusao" in wb.sheetnames else []):
    pid = clean(row.get("ID do produto (chave em Produtos)"))
    if pid not in produtos:
        continue
    def marcas_de(col):
        m, unres = resolve_brands(row.get(col))
        unresolved_brands_seen.update(unres)
        return m
    produtos[pid]["conclusao"] = {
        "plano": clean(row.get("Nome do plano (título do bloco)")),
        "itens": [t.strip() for t in clean(row.get("Itens da lista (separados por ;)")).split(";") if t.strip()],
        "globoplay": marcas_de("Marcas — 'Globoplay incluso' (vírgula)"),
        "beneficios": marcas_de("Marcas — 'Benefícios inclusos' (vírgula)"),
        "servicos": marcas_de("Marcas — 'Serviços exclusivos' (vírgula)"),
        "codigoOferta": clean(row.get("Código da oferta (Anatel)")),
    }

# V2: abas "Mais detalhes (V2)" e "Apps e serviços (V2)"
def _lista(v, sep):
    return [t.strip() for t in clean(v).split(sep) if t.strip()]
for row in (sheet_rows(wb["Mais detalhes (V2)"]) if "Mais detalhes (V2)" in wb.sheetnames else []):
    pid = clean(row.get("ID do produto (chave em Produtos)"))
    if pid not in produtos:
        continue
    def marcas_de(col):
        m, unres = resolve_brands(row.get(col))
        unresolved_brands_seen.update(unres)
        return m
    rec = []
    for item in _lista(row.get("Recomendado para (texto|ícone Mondrian; separados por ;)"), ";"):
        texto, _, icone = item.partition("|")
        rec.append({"texto": texto.strip(), "icone": icone.strip()})
    produtos[pid]["maisDetalhes"] = {
        "recomendado": rec,
        "streaming": marcas_de("Streaming incluso (marcas, vírgula)"),
        "servicos": marcas_de("Serviços digitais (marcas, vírgula)"),
        "rotulo": clean(row.get("Rótulo acima do título (ex: Plano Claro pós-pago)")),
        "titulo": clean(row.get("Título do plano na oferta")),
        "textoPreco": clean(row.get("Texto abaixo do preço")),
        "apps": marcas_de("Apps na tela Serviços digitais (ordem, vírgula)"),
    }
# V2: aba "PDP (V2)" -> produtos[id]["pdpV2"]
for row in (sheet_rows(wb["PDP (V2)"]) if "PDP (V2)" in wb.sheetnames else []):
    pid = clean(row.get("ID do produto (chave em Produtos)"))
    if pid not in produtos:
        continue
    rec = []
    for item in _lista(row.get("Recomendado para (texto|ícone Mondrian; separados por ;)"), ";"):
        texto, _, icone = item.partition("|")
        rec.append({"texto": texto.strip(), "icone": icone.strip()})
    produtos[pid]["pdpV2"] = {
        "rotulo": clean(row.get("Rótulo abaixo do título")),
        "recomendado": rec,
        "textoApoio": clean(row.get("Texto de apoio (abaixo das etiquetas)")),
    }

apps_info = {}
for row in (sheet_rows(wb["Apps e serviços (V2)"]) if "Apps e serviços (V2)" in wb.sheetnames else []):
    marca = clean(row.get("Marca (como no catálogo)"))
    if marca:
        apps_info[marca.lower()] = {"nome": clean(row.get("Nome exibido")) or marca, "descricao": clean(row.get("Descrição"))}

for row in sorted(pagto_rows, key=lambda r: r.get("Ordem") or 0):
    pid = clean(row.get("ID da página (chave em Paginas)"))
    if pid in paginas:
        paginas[pid].setdefault("pagamento", []).append({
            "icone": clean(row.get("Ícone Mondrian")),
            "titulo": clean(row.get("Título")),
            "descricao": clean(row.get("Descrição (opcional)")),
        })

for pagina_id, items in produtos_by_pagina.items():
    items.sort(key=lambda t: t[0])
    paginas[pagina_id]["produtos"] = [pid for _, pid in items]

if unresolved_brands_seen:
    print("AVISO: marcas sem slug conhecido no Mondrian Brands — adicione em BRAND_SLUGS:")
    for n in sorted(unresolved_brands_seen):
        print(" -", n)

enderecos = []
for row in endereco_rows:
    eid = clean(row.get("ID do endereço (chave única)"))
    if not eid:
        continue
    disponivel_raw = clean(row.get("Disponível neste plano (SIM/NAO)")).upper()
    enderecos.append({
        "id": eid,
        "ordem": row.get("Ordem") or 0,
        "endereco": clean(row.get("Endereço completo")),
        "referencia": clean(row.get("Referência")),
        "disponivel": disponivel_raw == "SIM",
    })
enderecos.sort(key=lambda e: e["ordem"])

# Aba "Cliente": dados que já vêm preenchidos no checkout (1 cliente de exemplo)
cliente = {}
if "Cliente" in wb.sheetnames:
    rows = sheet_rows(wb["Cliente"])
    if rows:
        r0 = rows[0]
        cliente = {
            "cpf": clean(r0.get("CPF (não editável no checkout)")),
            "nome": clean(r0.get("Nome completo (editável)")),
            "celular": clean(r0.get("Celular (não editável no checkout)")),
            "nascimento": clean(r0.get("Data de nascimento (editável, dd/mm/aaaa)")),
        }

# Aba "Agendamento": períodos da visita técnica + regra das datas (D+N, quantidade)
agendamento = {"periodos": [], "diaInicial": 1, "quantidade": 10}
if "Agendamento" in wb.sheetnames:
    ag_rows = sorted(sheet_rows(wb["Agendamento"]), key=lambda r: r.get("Ordem") or 0)
    for r in ag_rows:
        nome = clean(r.get("Período (nome)"))
        if nome:
            agendamento["periodos"].append({"nome": nome, "horario": clean(r.get("Horário exibido"))})
        ini = r.get("Regra de datas — começa em D+ (dias a partir de hoje)")
        qtd = r.get("Regra de datas — quantidade de datas")
        if ini not in (None, ""):
            agendamento["diaInicial"] = int(ini)
        if qtd not in (None, ""):
            agendamento["quantidade"] = int(qtd)

# Aba "Checkout pagamento": bancos do débito em conta e dias de vencimento
pagamento = {"bancos": [], "diasVencimento": []}
if "Checkout pagamento" in wb.sheetnames:
    for r in sheet_rows(wb["Checkout pagamento"]):
        b = clean(r.get("Banco (na ordem da lista, exibido em maiúsculas)"))
        if b:
            pagamento["bancos"].append(b)
        d = r.get("Dia de vencimento da fatura (na ordem; o primeiro vem selecionado)")
        if d not in (None, ""):
            pagamento["diasVencimento"].append(int(d))

catalog = {"paginas": paginas, "produtos": produtos, "enderecos": enderecos, "cliente": cliente, "agendamento": agendamento, "checkoutPagamento": pagamento, "appsInfo": apps_info}

with open(OUT, "w", encoding="utf-8") as f:
    f.write("// Gerado automaticamente por scripts/gen_catalog.py a partir de\n")
    f.write("// catalogo-ofertas-TEMPLATE.xlsx — não editar à mão, reexecute o script.\n")
    f.write("window.APP_CATALOG = ")
    f.write(json.dumps(catalog, ensure_ascii=False, indent=2))
    f.write(";\n")

print(f"OK — {len(paginas)} página(s), {len(produtos)} produto(s) -> {OUT}")

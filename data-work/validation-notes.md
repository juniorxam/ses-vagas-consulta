# Validação da interface

## Verificação em tela ampla

A página renderizou com o cabeçalho de marca, hero cartográfico, painel lateral de filtros, indicadores, percurso territorial e tabela agrupada por região. A hierarquia de regiões, municípios e totais ficou visível na listagem, preservando a leitura dos dados em tabelas extensas.

## Verificação em tela móvel

O hero, os filtros e os indicadores passam a uma coluna única. A tabela mantém sua largura de leitura e pode ser deslocada horizontalmente dentro do contêiner, evitando o esmagamento das colunas de cotas e totais.

## Verificação técnica

O projeto passou na checagem de tipos e na compilação de produção. A base contém 386 registros, 15 municípios, 8 regiões de saúde e 5.124 vagas totais, conforme a extração consolidada do Anexo II.

## Atualização: comparação e PDF

A página passou a apresentar o comparador por municípios ou regiões de saúde, mantendo os filtros ativos como base para os totais. A visualização confirmou a sequência territorial, os totais de cada região e o botão de exportação em PDF na área de resultados. O acionamento do botão foi executado na consulta completa para validar o fluxo de geração do relatório.

O histórico de downloads do navegador confirmou a criação do arquivo `relatorio-vagas-ses-2026.pdf` pela aplicação.

Os controles do comparador foram testados nas duas visões. A leitura por regiões de saúde destacou Capim Dourado com 1.654 vagas, e a alternância de volta para municípios destacou Palmas com 1.351 vagas, confirmando a atualização dinâmica do gráfico e do ranking.

## Correção: rótulos e nomes territoriais

A visualização completa por município confirmou a exibição dos 15 municípios, inclusive os menores quantitativos, sem corte no eixo vertical. Cada barra passou a apresentar o total de vagas como rótulo à direita; por exemplo, Palmas aparece com 1.351, Porto Nacional com 571 e Alvorada com 94 vagas.

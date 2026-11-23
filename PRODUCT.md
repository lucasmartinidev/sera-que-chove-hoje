# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas que precisam consultar rapidamente o tempo de uma cidade antes de sair, planejar uma atividade ou decidir se levam guarda-chuva. O produto também atende pessoas em deslocamento que autorizam o uso da localização do navegador, pessoas que comparam cidades diferentes em sequência e pessoas com daltonismo, baixa visão, sensibilidade a movimento ou que navegam por teclado e leitor de tela.

## Product Purpose

Permitir a consulta do clima atual e da previsão resumida das próximas seis horas para responder se há possibilidade de chuva no local escolhido. Sucesso significa que o usuário reconhece cidade, condição, temperatura atual e probabilidade de chuva na primeira dobra da tela, em até três segundos de leitura, sem rolagem.

## Positioning

O produto combina uma busca global por cidade com uma leitura direta de chuva e clima atual, sem cadastro e com dados obtidos pelo backend a partir da Open-Meteo. O mecanismo distintivo aprovado é a identidade reativa: o céu da interface representa a condição do tempo e a temperatura da cidade consultada, de modo que a resposta a "será que chove hoje?" é percebida antes da leitura dos números.

## Operating Context

O usuário digita e envia uma cidade; escolhe uma correspondência quando há nomes ambíguos; e consulta clima atual e previsão das próximas seis horas na mesma tela. A localização do navegador é uma alternativa opcional. A interface precisa funcionar em desktop e celular. A cada nova cidade, o fundo e as cores mudam para representar aquela condição; sem consulta carregada, a tela não sugere nenhuma condição meteorológica. Uso típico inclui celular em deslocamento, sob luz ambiente variável e com expectativa de transição rápida entre cidades.

## Capabilities and Constraints

- A interface e as descrições são em português brasileiro.
- A busca aceita cidades globais e apresenta nome, região e país para desambiguação.
- O painel exibe clima atual, probabilidade de precipitação e previsão horária de seis horas.
- Temperatura e velocidade do vento podem ser alternadas entre unidades métricas e imperiais sem nova consulta; a mudança de unidade não altera a representação cromática da temperatura.
- Geolocalização depende de permissão explícita; se indisponível ou negada, a busca manual continua disponível.
- O frontend consome somente a API do backend; o backend consulta Open-Meteo.
- A identidade visual é alimentada exclusivamente pelos dados já fornecidos (temperatura, sensação térmica, umidade, probabilidade e volume de precipitação, código de condição, vento, pressão, indicador de dia/noite, fuso local e seis horas de previsão). Nenhuma variável meteorológica nova é exigida.
- Não há requisições do navegador a provedores externos de dados, mapas, imagens ou assets pagos por conta da identidade visual.
- O fundo é decorativo e animado, com transição de até 600 ms na troca de cidade; nunca bloqueia interação, rolagem, foco ou seleção de texto e não adiciona requisições de rede.
- A escala de representação da temperatura é estática e absoluta: a mesma temperatura tem sempre a mesma representação, independentemente de cidade, país, estação ou das demais temperaturas exibidas; valores além dos limites da escala são fixados nos extremos.
- Quando temperatura está ausente, a condição é desconhecida ou o estado é de erro, nenhuma cor ou atmosfera de condição inexistente pode ser sugerida.
- Não há contas, cidades favoritas ou histórico persistente.
- Sem temas alternativos ou seletor de aparência: a identidade futurista reativa substitui o visual anterior.

## Brand Commitments

O título aprovado para a interface é "Será que chove hoje?". A linguagem é clara e concisa em português brasileiro. Não há logo, tipografia ou outros ativos de marca existentes que precisem ser preservados.

A direção de interface aprovada e vinculante é um design futurista, com fundo inovador e marcante e cores de alto contraste que refletem a temperatura e as condições meteorológicas específicas de cada cidade. Ela substitui a preferência anterior por padrões familiares de dashboard meteorológico; Weather.com, AccuWeather e Google Weather permanecem apenas como referência de usabilidade e clareza, nunca de aparência, e sem copiar marcas ou ativos proprietários.

A paleta, a tipografia e a composição do fundo são decisões do mundo visual (DESIGN.md), não deste documento.

## Evidence on Hand

- Dados de geocodificação e clima fornecidos pela Open-Meteo por meio dos endpoints integrados no backend.
- PRD aprovado da identidade: `tasks/prd-identidade-futurista-reativa/prd.md`, com objetivos mensuráveis, faixas de temperatura rotuladas, famílias de condição, critérios de aceitação e escopo excluído.
- PRD do painel de clima: `tasks/prd-painel-de-clima/prd.md` (comportamentos funcionais vigentes).
- Convenções públicas de cor em meteorologia usadas como base das faixas: escala estática de temperatura do Met Office (−55 °C a +55 °C, variação de luminosidade além do matiz por acessibilidade) e faixas de temperatura do Apple Weather; WCAG 2.2 para contraste e animação; paletas seguras para daltonismo (Okabe-Ito) como referência categórica, não sequencial.
- Não há dados meteorológicos próprios, depoimentos, estudos comparativos ou ativos visuais de marca fornecidos. Não apresentar alegações de precisão ou superioridade além do que a fonte garante.

## Product Principles

- Responder primeiro à pergunta sobre chuva, inclusive pela aparência da tela.
- Manter busca manual e consulta de clima diretas, sem cadastro.
- Explicar estados de carregamento e falha com mensagens acionáveis, sem atmosfera que sugira dados inexistentes.
- Exigir consentimento antes de usar localização e não persistir coordenadas.
- Nunca usar cor como único canal de informação: rótulos, valores, ícones e descrições acompanham toda codificação cromática.
- Tratar a identidade reativa como derivada dos dados existentes, sem novas fontes, variáveis ou assets externos.

## Accessibility & Inclusion

Requisitos do produto: conformidade com WCAG 2.2 nível AA, incluindo contraste mínimo de 4,5:1 para texto e 3:1 para texto grande, componentes de interface e objetos gráficos essenciais, medidos sobre o fundo real em todas as combinações de condição, faixa de temperatura, período do dia e estado; nenhuma cintilação acima de três vezes por segundo; respeito à preferência de movimento reduzido do sistema com alternativa estática igualmente informativa; legibilidade em alto contraste/cores forçadas do sistema operacional e com zoom de 200%; representação da temperatura e da condição distinguível em tons de cinza e por pessoas com daltonismo, por variação de luminosidade e redundância textual; controles operáveis por teclado, nomes e estados acessíveis, foco visível, resultados assíncronos anunciados e fundo decorativo ignorado por tecnologias assistivas; layout utilizável em dispositivos móveis.

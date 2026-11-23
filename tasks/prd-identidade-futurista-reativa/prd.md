# Documento de Requisitos do Produto (PRD)

## Visão geral

A Identidade Futurista Reativa é um redesenho completo da interface do "Será que chove hoje?". Ela substitui o visual atual — um painel meteorológico convencional e neutro — por um mundo visual futurista, no qual o fundo da tela é vivo, inovador e marcante, e as cores de alto contraste mudam conforme a temperatura e a condição meteorológica específica de cada cidade consultada. A pergunta central do produto continua a mesma e continua sendo respondida primeiro: será que chove hoje? A diferença é que agora o usuário percebe o clima antes mesmo de ler os números: o céu da interface é o próprio resumo do tempo.

O público é o mesmo do produto atual: pessoas que consultam rapidamente o tempo de uma cidade antes de sair, planejar uma atividade ou decidir se levam guarda-chuva, incluindo usuários em deslocamento no celular e pessoas com daltonismo, baixa visão, sensibilidade a movimento ou que navegam por teclado e leitor de tela. O valor entregue é duplo. Primeiro, reconhecimento imediato: cidade, condição e temperatura são compreendidas em segundos, sem rolagem. Segundo, distinção perceptível entre cidades e horários, porque a escala de cores é estática e comparável — a mesma temperatura tem a mesma cor em qualquer cidade, estação ou hora do dia. Nenhuma informação nova é inventada: a identidade é alimentada exclusivamente pelos dados já fornecidos pelo backend (temperatura, sensação térmica, umidade, probabilidade e volume de precipitação, código de condição, vento, pressão, indicador de dia/noite e as próximas seis horas).

Premissas registradas na elaboração deste documento:

- Redesenho completo: o visual atual é descartado como referência estética e não é preservado como tema alternativo. Esta decisão substitui a preferência registrada em `PRODUCT.md` e no brief da superfície de seguir o cânone convencional de dashboard meteorológico (Weather.com, AccuWeather e Google Weather), que permanecem válidos apenas como referência de usabilidade e clareza, não de aparência.
- Fundo animado reativo, com respeito obrigatório à preferência de movimento reduzido do sistema.
- Critérios mensuráveis de sucesso aprovados pelo solicitante: contraste WCAG AA em todas as combinações, leitura da informação principal em até 3 segundos, fluidez na troca de cores entre cidades e ausência de regressão nos comportamentos e testes existentes.
- As faixas de temperatura e as famílias de condições usadas nas cores seguem convenções públicas de cartografia meteorológica (escala estática do Met Office, faixas de temperatura do Apple Weather e recomendações de acessibilidade de cor para daltonismo), adaptadas à direção futurista.

## Objetivos

- **Contraste garantido em todas as combinações.** 100% dos textos, ícones e elementos gráficos essenciais devem atingir o nível AA da WCAG 2.2 (mínimo de 4,5:1 para texto normal, 3:1 para texto grande e para componentes de interface e objetos gráficos) em todas as combinações possíveis de condição meteorológica, faixa de temperatura, dia/noite e estado da interface (carregando, sucesso, erro, vazio). Verificação por auditoria de contraste sobre a matriz completa de combinações.
- **Reconhecimento imediato.** Em 100% das consultas bem-sucedidas, cidade, condição do tempo, temperatura atual e probabilidade de chuva devem ser identificáveis na primeira dobra da tela, sem rolagem, em até 3 segundos de leitura, tanto em desktop (1440×900) quanto em celular (390×844).
- **Fluidez na troca de cidade.** A transição de cores e de fundo ao trocar de cidade deve começar imediatamente após a chegada dos dados, concluir em até 600 ms e nunca bloquear a interação: latência de resposta a novos cliques ou teclas inferior a 100 ms durante a transição, com zero travamentos perceptíveis relatados em teste de uso.
- **Cor nunca é o único canal.** 100% das informações codificadas por cor devem ter redundância textual ou numérica (rótulo da faixa de temperatura, descrição da condição, valores). Em visualização em tons de cinza, a interface deve manter 100% da informação compreensível.
- **Segurança e conforto visual.** Zero ocorrências de conteúdo que pisque mais de três vezes por segundo, e 100% dos elementos animados do fundo desativados ou substituídos por alternativa estática quando a preferência de movimento reduzido do sistema estiver ativa.
- **Sem regressão funcional.** 100% dos testes existentes de frontend, backend e E2E devem continuar passando, e todos os comportamentos atuais (busca, desambiguação de cidades, geolocalização, seletor de unidades, estados de erro, anúncios para leitores de tela) devem permanecer intactos.
- **Meta de desempenho.** O custo da nova identidade não pode degradar a consulta: o tempo de ponta a ponta da busca de clima deve permanecer em até 3 segundos (p95), e a interface deve se tornar utilizável antes do término de qualquer animação de fundo.

## Histórias de usuário

- **US1:** Como pessoa apressada antes de sair de casa, quero abrir o app e perceber o clima pela aparência da tela para ter uma primeira resposta imediata, antes mesmo de ler os números.
- **US2:** Como usuário comum, quero que as cores reflitam a temperatura da cidade consultada para sentir se está frio ou calor sem precisar interpretar valores.
- **US3:** Como usuário que decide se leva guarda-chuva, quero que o fundo represente a condição do tempo (limpo, nublado, chuva, neve, trovoada, nevoeiro) para reforçar visualmente a probabilidade de precipitação exibida.
- **US4:** Como pessoa que compara duas cidades (por exemplo, onde mora e para onde vai viajar), quero que a mesma temperatura tenha sempre a mesma cor para comparar as consultas de forma confiável, independentemente da estação ou do país.
- **US5:** Como usuário no celular em deslocamento, quero que a interface seja legível sob luz forte e que o fundo animado não consuma bateria nem trave a rolagem.
- **US6:** Como pessoa com daltonismo, quero que a informação não dependa apenas da cor para entender temperatura e condição sem ambiguidade.
- **US7:** Como pessoa com baixa visão ou que usa zoom de navegador em 200%, quero que o texto mantenha contraste e legibilidade sobre o fundo decorativo em qualquer combinação de cores.
- **US8:** Como pessoa com sensibilidade a movimento (vestibular), quero que a interface respeite minha preferência de movimento reduzido e apresente uma alternativa estática igualmente informativa, sem perda de conteúdo.
- **US9:** Como usuário de leitor de tela ou de navegação por teclado, quero que a nova identidade não remova rótulos, ordem lógica, anúncios de estado nem foco visível.
- **US10:** Como usuário que consulta o app à noite ou em cidade onde é noite, quero que o fundo considere o período do dia para que a representação faça sentido e não ofusque a leitura.
- **US11 (borda):** Como usuário que consulta uma cidade com temperatura extrema (abaixo de −10 °C ou acima de 38 °C), quero que a cor e o fundo representem o extremo de forma estável, sem sair da escala nem gerar combinações ilegíveis.
- **US12 (borda):** Como usuário que consulta uma cidade cujo dado de temperatura está ausente ou cuja condição é desconhecida, quero ver uma representação neutra e uma mensagem clara, em vez de um fundo colorido enganoso.
- **US13 (borda):** Como usuário em modo de alto contraste ou cores forçadas do sistema operacional, quero que a interface continue legível, com o fundo decorativo suprimido quando o sistema assim exigir.
- **US14 (borda):** Como usuário que alterna entre °C/°F e km/h/mph, quero que as cores continuem representando a mesma temperatura física, sem mudar de faixa apenas porque a unidade exibida mudou.

## Principais funcionalidades

### Mundo visual futurista (identidade do painel)

Define a nova linguagem visual de toda a tela e substitui o painel neutro atual. É importante porque é a base sobre a qual o fundo reativo e as cores de temperatura operam, e porque garante que a ousadia visual não sacrifique a leitura rápida.

- Em alto nível: a tela passa a ser composta por um fundo atmosférico em camadas, uma superfície de conteúdo que garante contraste e uma hierarquia tipográfica clara, mantendo o título aprovado "Será que chove hoje?" e todos os textos em português brasileiro.
- **RF1:** A nova identidade deve ser aplicada à tela como um todo, substituindo o visual anterior em todos os estados (inicial, carregando, sucesso, cidade não encontrada, erro de serviço, geolocalização em andamento/concedida/negada).
- **RF2:** O título aprovado "Será que chove hoje?" deve ser mantido, com linguagem clara e concisa em PT-BR em todos os textos, rótulos e mensagens.
- **RF3:** A hierarquia visual deve priorizar, nesta ordem: identificação da cidade, condição do tempo com ícone e descrição, temperatura atual, probabilidade de precipitação; as demais métricas (sensação térmica, umidade, vento, pressão, horário de referência) e a previsão de seis horas vêm em seguida.
- **RF4:** O conteúdo informativo deve permanecer sobre uma superfície que garanta contraste estável, independentemente do que esteja acontecendo no fundo decorativo.
- **RF5:** A direção estética deve ser futurista, inovadora e marcante, sem copiar marcas, logotipos, ícones proprietários ou ativos de serviços meteorológicos existentes.

### Fundo atmosférico reativo

É o elemento distintivo do redesenho: o fundo representa visualmente a condição do tempo da cidade consultada. É importante porque entrega a resposta "será que chove hoje?" de forma pré-atentiva e torna cada cidade visualmente única.

- Em alto nível: o fundo é composto por camadas decorativas animadas (céu, luz, partículas e fenômenos) selecionadas a partir da condição meteorológica e do período do dia da cidade, com transição suave ao trocar de cidade.
- **RF6:** O fundo deve refletir a condição meteorológica da cidade consultada, agrupada nas famílias: céu limpo, parcialmente nublado/nublado, nevoeiro, chuvisco/chuva, neve e trovoada.
- **RF7:** O fundo deve diferenciar dia e noite a partir do indicador de período do dia retornado para a cidade, com luminosidade e atmosfera distintas.
- **RF8:** A troca de cidade deve provocar uma transição suave de fundo e cores, com duração máxima de 600 ms, sem cortes abruptos, sem piscadas e sem bloquear a interação do usuário durante a transição.
- **RF9:** Nenhum elemento do fundo pode piscar, cintilar ou apresentar variações bruscas de luminosidade mais de três vezes por segundo, inclusive em trovoada.
- **RF10:** O fundo deve ser tratado como decorativo: não pode transportar informação exclusiva nem ser anunciado a leitores de tela.
- **RF11:** O fundo não pode exigir novas requisições de rede, novos provedores de dados nem assets externos pagos; não pode atrasar a exibição dos dados de clima nem a interatividade da tela.
- **RF12:** Quando não houver consulta carregada (estado inicial, erro ou cidade não encontrada), o fundo deve assumir uma atmosfera neutra, sem sugerir qualquer condição meteorológica inexistente.

### Escala de cores por temperatura

Converte a temperatura da cidade em cor de alto contraste. É importante porque dá ao usuário a sensação térmica imediata e porque permite comparar cidades e horas de forma consistente.

- Em alto nível: a temperatura atual define uma faixa de cor, aplicada a elementos de destaque da interface e à atmosfera do fundo. A mesma escala é reutilizada na previsão das próximas seis horas, permitindo comparar a evolução ao longo do dia.
- **RF13:** A escala de temperatura deve ser estática e absoluta: a mesma temperatura corresponde sempre à mesma faixa de cor, independentemente da cidade, do país, da estação do ano ou das outras temperaturas exibidas na tela.
- **RF14:** As faixas de temperatura e seus rótulos textuais obrigatórios são:

  | Faixa (°C) | Rótulo em PT-BR | Referência de cor |
  |---|---|---|
  | ≤ −10 | Frio extremo | azul profundo a violeta glacial |
  | > −10 até 0 | Muito frio | azul intenso |
  | > 0 até 10 | Frio | azul claro a ciano |
  | > 10 até 18 | Fresco | verde-água a verde frio |
  | > 18 até 24 | Ameno | verde a amarelo suave |
  | > 24 até 30 | Quente | laranja |
  | > 30 até 38 | Muito quente | laranja-avermelhado a vermelho |
  | > 38 | Calor extremo | vermelho profundo a magenta incandescente |

- **RF15:** Cada faixa deve variar também em luminosidade (não apenas em matiz), de modo que a ordenação frio→quente permaneça perceptível em tons de cinza e para pessoas com daltonismo.
- **RF16:** O rótulo textual da faixa (por exemplo, "Quente") deve ser exibido junto à temperatura, de forma que a cor nunca seja o único canal de informação.
- **RF17:** Temperaturas fora do intervalo coberto pela escala devem ser fixadas nas faixas extremas ("Frio extremo" ou "Calor extremo"), sem gerar cores fora da paleta definida.
- **RF18:** Quando a temperatura estiver ausente ou nula, nenhuma cor de temperatura deve ser aplicada; a interface deve usar a representação neutra e comunicar que o dado não está disponível.
- **RF19:** A escala de cores deve ser calculada sempre a partir da temperatura em graus Celsius, de modo que alternar a unidade exibida para °F não altere a faixa de cor correspondente.
- **RF20:** A previsão das próximas seis horas deve usar a mesma escala, com identificação visual de temperatura por hora coerente com a temperatura atual exibida.

### Paleta e alto contraste por condição

Garante que a expressividade cromática de cada condição continue legível. É importante porque cores saturadas sobre fundos dinâmicos são o principal risco de acessibilidade deste redesenho.

- Em alto nível: cada família de condição possui uma paleta de cores de destaque e uma atmosfera de fundo próprias; o texto e os componentes são renderizados com contraste verificado sobre essas paletas.
- **RF21:** Cada família de condição (céu limpo, nublado, nevoeiro, chuva/chuvisco, neve, trovoada, neutra) deve ter uma paleta própria e distinguível das demais também por luminosidade e por elementos gráficos, não apenas por matiz.
- **RF22:** Todas as combinações de condição, faixa de temperatura, período do dia e estado da interface devem atingir o nível AA de contraste da WCAG 2.2 para texto (4,5:1), texto grande (3:1) e componentes de interface e objetos gráficos essenciais (3:1).
- **RF23:** O contraste deve ser garantido considerando o fundo real sobre o qual o texto é exibido, inclusive sobre gradientes, camadas animadas e áreas claras ou escuras do fundo, e não apenas sobre uma cor plana de referência.
- **RF24:** Elementos decorativos que não transmitem informação ficam isentos de contraste, mas não podem reduzir a legibilidade do conteúdo.
- **RF25:** O indicador de status da API e os estados de erro devem manter cores semanticamente consistentes e distinguíveis das cores de condição e de temperatura, para não serem confundidos com dados meteorológicos.

### Movimento reduzido e preferências do sistema

Preserva o conforto e a inclusão sem abrir mão da identidade. É importante porque um fundo animado contínuo pode causar enjoos, distração e consumo excessivo de bateria.

- Em alto nível: a interface detecta a preferência de movimento reduzido do sistema e substitui a animação por uma alternativa estática equivalente; também respeita preferências de alto contraste/cores forçadas.
- **RF26:** Quando a preferência de movimento reduzido do sistema estiver ativa, todas as animações contínuas do fundo devem ser desativadas ou reduzidas a uma composição estática equivalente, sem perda de informação nem de identidade visual.
- **RF27:** Com movimento reduzido, as transições entre cidades devem ser instantâneas ou de duração mínima, mantendo a mudança de cor e de atmosfera correta para a cidade consultada.
- **RF28:** Nenhuma animação pode ser necessária para compreender a informação: todo conteúdo deve estar disponível imediatamente após o carregamento dos dados.
- **RF29:** Em modo de cores forçadas ou alto contraste do sistema operacional, o conteúdo deve permanecer legível e o fundo decorativo pode ser suprimido ou simplificado.
- **RF30:** A animação do fundo não deve impedir nem degradar a rolagem da página, o foco visível por teclado nem a seleção de texto.

### Responsividade e desempenho da identidade

Assegura que o efeito seja igualmente marcante e legível em qualquer tela. É importante porque o produto é usado principalmente no celular, em deslocamento.

- Em alto nível: a composição do fundo, a tipografia e a densidade de elementos decorativos se adaptam ao tamanho da viewport e à capacidade do dispositivo.
- **RF31:** O layout deve ser responsivo e utilizável em telas de celular e desktop, mantendo as informações prioritárias na primeira dobra em ambas as situações.
- **RF32:** Em telas pequenas, a densidade de elementos animados deve ser reduzida para preservar legibilidade, desempenho e consumo de energia, sem eliminar a identidade da condição e da temperatura.
- **RF33:** A identidade não pode degradar o desempenho da página: a tela deve se tornar interativa antes do término de qualquer animação de fundo, e o tempo de ponta a ponta da consulta de clima deve permanecer dentro da meta existente de até 3 segundos (p95).
- **RF34:** Textos devem permanecer legíveis com zoom de navegador de até 200%, sem sobreposição, corte ou perda de contraste.

## Critérios de aceitação

- **CA-01 (US1, US2, RF1–RF5):** Dado que o usuário abre o painel, quando a tela é exibida em qualquer estado, então a identidade futurista está aplicada de ponta a ponta, com o título "Será que chove hoje?" preservado, textos em PT-BR e hierarquia visual priorizando cidade, condição, temperatura atual e probabilidade de chuva.
- **CA-02 (US3, RF6–RF7):** Dado que uma cidade foi consultada com sucesso, quando o clima é exibido, então o fundo representa a família da condição retornada (céu limpo, nublado, nevoeiro, chuva/chuvisco, neve ou trovoada) e diferencia dia de noite conforme o período informado para a cidade.
- **CA-03 (US2, US4, RF13–RF16):** Dado que duas cidades diferentes apresentam a mesma temperatura, quando ambas são consultadas em momentos distintos, então a mesma faixa de cor e o mesmo rótulo textual são aplicados nas duas consultas.
- **CA-04 (US2, RF14, RF16):** Dado que a temperatura atual é exibida, quando o usuário lê o destaque de temperatura, então a cor corresponde à faixa definida na tabela da RF14 e o rótulo textual da faixa está visível ao lado da informação.
- **CA-05 (US8, RF9, RF26–RF28):** Dado que a preferência de movimento reduzido do sistema está ativa, quando o painel é exibido, então não há animação contínua no fundo, a composição estática equivalente é apresentada, a mudança de cor por cidade continua correta e nenhuma informação deixa de ser exibida.
- **CA-06 (RF9):** Dado qualquer estado da interface, quando o fundo está em movimento (inclusive em trovoada), então nenhum elemento pisca ou varia bruscamente de luminosidade mais de três vezes por segundo.
- **CA-07 (US5, RF8, RF33):** Dado que o usuário troca de cidade, quando os novos dados chegam, então a transição de fundo e cores começa imediatamente, conclui em até 600 ms, e cliques e teclas digitados durante a transição são respondidos em menos de 100 ms, sem travamento perceptível.
- **CA-08 (US7, RF22–RF24):** Dada qualquer combinação válida de condição, faixa de temperatura, período do dia e estado da interface, quando o contraste é medido sobre o fundo real, então texto normal atinge no mínimo 4,5:1, texto grande no mínimo 3:1 e componentes de interface e objetos gráficos essenciais no mínimo 3:1, em 100% das combinações da matriz auditada.
- **CA-09 (US6, RF15–RF16, RF21):** Dado que a interface é visualizada em tons de cinza ou por pessoa com daltonismo, quando o usuário consulta uma cidade, então a ordenação frio→quente e a família da condição permanecem distinguíveis por luminosidade, rótulos, ícones e descrições textuais, sem depender apenas de matiz.
- **CA-10 (US14, RF19):** Dado que o clima está exibido em °C e km/h, quando o usuário alterna para °F e mph, então os valores são atualizados sem nova busca e a faixa de cor da temperatura permanece a mesma.
- **CA-11 (US11, RF17):** Dado que a temperatura da cidade é inferior a −10 °C ou superior a 38 °C, quando o clima é exibido, então a cor é fixada na faixa extrema correspondente ("Frio extremo" ou "Calor extremo") e o texto mantém contraste AA.
- **CA-12 (US12, RF12, RF18):** Dado que a temperatura está ausente, a condição é desconhecida ou não há consulta carregada, quando a tela é exibida, então a atmosfera neutra é aplicada, nenhuma cor de temperatura ou condição inexistente é sugerida e a indisponibilidade do dado é comunicada de forma clara.
- **CA-13 (US9, RF4, RF10, RF30):** Dado um usuário que navega por teclado ou leitor de tela, quando interage com busca, lista de cidades, seletor de unidades e painel, então todos os elementos continuam alcançáveis, com rótulos e estados acessíveis, foco visível, resultados assíncronos anunciados e o fundo decorativo ignorado pela tecnologia assistiva.
- **CA-14 (US5, US13, RF29, RF31–RF32):** Dado o acesso por celular, por desktop ou com cores forçadas/alto contraste do sistema, quando o painel é exibido, então o layout é utilizável, as informações prioritárias aparecem na primeira dobra sem rolagem e o conteúdo permanece legível.
- **CA-15 (US7, RF34):** Dado que o usuário aplica zoom de navegador de 200%, quando o painel é exibido, então não há corte, sobreposição ou perda de contraste e todas as funcionalidades continuam operáveis.
- **CA-16 (US1, RF33):** Dado que o painel é aberto, quando os dados da cidade chegam, então a tela se torna interativa antes do fim de qualquer animação de fundo e o tempo de ponta a ponta da consulta permanece em até 3 segundos (p95).
- **CA-17 (RF11, RF25):** Dado qualquer uso do painel, quando os dados são obtidos e os estados são comunicados, então nenhuma nova requisição a provedores externos de dados ou imagens é feita pelo navegador além da API do backend já existente, e o status da API e os erros mantêm cores semanticamente distintas das cores de condição e temperatura.
- **CA-18 (Objetivo "sem regressão"):** Dado o conjunto de testes existente de frontend, backend e E2E, quando a nova identidade é entregue, então 100% dos testes continuam passando e os comportamentos atuais de busca, desambiguação de cidades, geolocalização, unidades e estados de erro permanecem inalterados.
- **CA-19 (Objetivo "leitura em 3s"):** Dado um participante de teste de usabilidade com uma consulta carregada, quando lhe é perguntado cidade, condição, temperatura atual e se há chance de chuva, então ele responde corretamente em até 3 segundos, sem rolar a página, em 100% das sessões avaliadas em desktop e celular.

## Experiência do usuário

Perfis e necessidades:

- **Usuário comum (principal):** quer uma resposta pré-atentiva e rápida; a aparência da tela deve antecipar o clima, e a leitura de temperatura e chance de chuva deve permanecer óbvia mesmo com o fundo expressivo.
- **Usuário em deslocamento no celular (principal):** usa o app em movimento, sob luz ambiente variável; precisa de alto contraste, transições rápidas e animação que não trave a rolagem nem drene a bateria.
- **Comparador de cidades (secundário):** consulta cidades distintas em sequência; depende da estabilidade da escala de cores para comparar e perceber a mudança de atmosfera a cada cidade.
- **Pessoa com daltonismo ou baixa visão (secundário):** depende de redundância textual, variação de luminosidade e contraste AA em todas as combinações.
- **Pessoa com sensibilidade a movimento (secundário):** depende do respeito a movimento reduzido, com alternativa estática completa.
- **Usuário de teclado e leitor de tela (secundário):** depende de rótulos, ordem lógica, foco visível e anúncios de estado preservados após o redesenho.

Fluxos principais e interações:

1. **Abertura:** o usuário vê a identidade futurista em atmosfera neutra, o título e o campo de busca; o fundo não sugere nenhuma condição antes da consulta.
2. **Consulta por digitação:** o usuário digita a cidade e envia; durante o carregamento o estado é comunicado; com os dados, o fundo e as cores assumem a condição, o período do dia e a temperatura daquela cidade, em transição de até 600 ms; a primeira dobra mostra cidade, condição, temperatura com rótulo de faixa e probabilidade de chuva, seguidas das demais métricas e das próximas seis horas.
3. **Desambiguação:** quando há múltiplas correspondências, a lista de cidades é exibida com nome, região e país, mantendo contraste e operabilidade por teclado sobre o novo fundo.
4. **Consulta por geolocalização:** o usuário autoriza a localização; a cidade é sugerida e o fundo passa a refletir as condições locais; se a permissão for negada ou indisponível, o fluxo por digitação continua normal e o estado é comunicado.
5. **Troca de cidade:** a cada nova cidade, o mundo visual muda de forma perceptível e suave, reforçando a diferença de clima entre locais.
6. **Ajuste de unidades:** o usuário alterna °C/°F e km/h/mph; os valores mudam imediatamente, sem nova busca e sem alteração da faixa de cor.
7. **Falhas e bordas:** cidade não encontrada, erro de serviço, temperatura ausente e condição desconhecida são comunicados com mensagens acionáveis sobre atmosfera neutra, sem cores que sugiram dados inexistentes.

Momento memorável: ao consultar a cidade, o céu da interface se transforma — a atmosfera, a luz e as cores de alto contraste passam a ser o retrato do tempo daquele lugar naquele momento, e a resposta a "será que chove hoje?" chega antes da leitura dos números.

Requisitos de UI/UX e acessibilidade:

- Direção estética futurista, ousada e distintiva, com fundo em camadas e cores de alto contraste derivadas dos dados, sem cópia de marcas, logotipos ou assets proprietários de terceiros.
- Conteúdo sempre sobre superfície que assegure contraste estável; texto decorativo ou de baixo contraste é proibido para qualquer informação relevante.
- Escala de temperatura estática, com faixas e rótulos textuais fixos; variação de luminosidade além do matiz.
- Paletas por família de condição distinguíveis também sem cor; ícones sempre acompanhados de descrição textual.
- Contraste WCAG 2.2 AA verificado sobre o fundo real em todas as combinações de condição, temperatura, período do dia e estado.
- Cor nunca como único canal: rótulos, valores numéricos, ícones e descrições acompanham toda codificação cromática.
- Movimento: nenhuma cintilação acima de três flashes por segundo; respeito a movimento reduzido com alternativa estática completa; animação jamais bloqueia interação, rolagem, foco ou seleção de texto.
- Preferências do sistema: alto contraste/cores forçadas mantêm legibilidade, com supressão ou simplificação do fundo decorativo quando necessário.
- Fundo decorativo marcado como tal para tecnologias assistivas; foco visível, rótulos acessíveis, regiões de status e anúncios de resultados assíncronos preservados.
- Responsividade real: prioridade de conteúdo na primeira dobra em celular e desktop, densidade decorativa reduzida em telas pequenas, legibilidade com zoom de 200%.
- Textos, rótulos e mensagens em PT-BR, claros e acionáveis, sem alegações de precisão ou superioridade além do que a fonte de dados garante.

## Restrições técnicas de alto nível

- **Fonte de dados inalterada:** a identidade deve ser alimentada exclusivamente pelos dados já fornecidos pelo backend a partir da Open-Meteo (temperatura, sensação térmica, umidade relativa, probabilidade e volume de precipitação, código de condição, velocidade e direção do vento, pressão, indicador de dia/noite, fuso local e previsão horária de seis horas). Nenhuma nova variável meteorológica pode ser exigida por este escopo.
- **Frontend consome somente o backend:** o navegador não faz chamadas diretas a serviços meteorológicos, de imagens, de mapas ou de assets externos pagos; nenhum novo provedor é introduzido.
- **Stack e estrutura existentes:** o redesenho deve ser implementado sobre o frontend existente (React 19, TypeScript, Vite, Tailwind CSS, ESLint), preservando a separação entre `frontend/` e `backend/` e a organização de pastas do projeto.
- **Compatibilidade com comportamentos vigentes:** busca, desambiguação de cidades, geolocalização opcional com consentimento, seletor de unidades, mensagens de erro e indicador de status da API devem continuar funcionando como hoje; o redesenho é visual e não altera contratos de dados nem regras de negócio.
- **Acessibilidade normativa:** conformidade com WCAG 2.2 nível AA, incluindo contraste mínimo (1.4.3), contraste não textual (1.4.11), uso de cor (1.4.1), redimensionamento de texto (1.4.4), animações (2.3.1) e preferências de movimento reduzido.
- **Desempenho e bateria:** sem degradação do tempo de ponta a ponta da consulta (meta de até 3 s p95); a tela deve se tornar interativa independentemente do término das animações; a animação não pode causar travamento de rolagem nem consumo anormal de bateria em dispositivos móveis.
- **Privacidade:** nenhuma nova coleta de dados pessoais, rastreamento ou analytics é permitida; a geolocalização continua sujeita a permissão explícita e sem persistência de coordenadas.
- **Idioma:** interface e descrições exclusivamente em PT-BR nesta versão.
- **Qualidade verificável:** os critérios de contraste, movimento reduzido, escala de temperatura e não regressão devem ser validáveis por testes automatizados e auditoria visual; a matriz completa de combinações (condição × faixa de temperatura × dia/noite × estado) deve ser auditável.
- **Propriedade intelectual:** proibido o uso de logotipos, ícones, imagens ou ativos proprietários de serviços meteorológicos ou de terceiros; referências do setor servem apenas como padrão de usabilidade.

## Fora do escopo

- Manter o visual atual como tema alternativo, oferecer múltiplos temas selecionáveis ou qualquer seletor de aparência para o usuário.
- Mapas, camadas de radar, imagens de satélite, previsão de precipitação em mapa ou qualquer visualização cartográfica.
- Vídeo, imagens fotográficas reais, cenas 3D imersivas, áudio ou ambientação sonora como parte do fundo.
- Geração de fundo por inteligência artificial, arte generativa dependente de serviço externo ou assets adquiridos/licenciados.
- Novas variáveis meteorológicas (UV, qualidade do ar, visibilidade, nascer/pôr do sol, fases da lua) e previsão estendida além das seis horas já cobertas.
- Notificações, alertas push ou avisos de condições severas.
- Cadastro, autenticação, contas, cidades favoritas, histórico persistente ou personalização salva entre sessões.
- Internacionalização além de PT-BR, incluindo tradução de rótulos de faixas de temperatura e condições.
- Alterações de contrato de API, novas rotas de backend, cache distribuído ou mudanças na fonte de dados.
- Aplicações nativas móveis, widgets de sistema, extensões de navegador ou versões para impressão.
- Criação de logotipo, manual de marca completo ou identidade para canais fora da interface web.
- Analytics de negócio, métricas de uso além das necessárias para validar os objetivos deste PRD e monetização.

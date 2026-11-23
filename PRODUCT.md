# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas que precisam consultar rapidamente o tempo de uma cidade antes de sair, planejar uma atividade ou decidir se levam guarda-chuva. O produto também atende pessoas em deslocamento que autorizam o uso da localização do navegador.

## Product Purpose

Permitir a consulta do clima atual e da previsão resumida das próximas seis horas para responder se há possibilidade de chuva no local escolhido.

## Positioning

O produto combina uma busca global por cidade com uma leitura direta de chuva e clima atual, sem cadastro e com dados obtidos pelo backend a partir da Open-Meteo.

## Operating Context

O usuário digita e envia uma cidade; escolhe uma correspondência quando há nomes ambíguos; e consulta clima atual e previsão das próximas seis horas na mesma tela. A localização do navegador é uma alternativa opcional. A interface precisa funcionar em desktop e celular.

## Capabilities and Constraints

- A interface e as descrições são em português brasileiro.
- A busca aceita cidades globais e apresenta nome, região e país para desambiguação.
- O painel exibe clima atual, probabilidade de precipitação e previsão horária de seis horas.
- Temperatura e velocidade do vento podem ser alternadas entre unidades métricas e imperiais sem nova consulta.
- Geolocalização depende de permissão explícita; se indisponível ou negada, a busca manual continua disponível.
- O frontend consome somente a API do backend; o backend consulta Open-Meteo.
- Não há contas, cidades favoritas ou histórico persistente.

## Brand Commitments

O título aprovado para a interface é "Será que chove hoje?". A linguagem é clara e concisa em português brasileiro. Não há logo, paleta, tipografia ou outros ativos de marca existentes que precisem ser preservados.

A preferência aprovada para a interface é seguir padrões familiares de dashboard meteorológico, com Weather.com, AccuWeather e Google Weather como referências de acabamento e usabilidade, sem copiar marcas ou ativos proprietários.

## Evidence on Hand

- Dados de geocodificação e clima fornecidos pela Open-Meteo por meio dos endpoints integrados no backend.
- Não há dados meteorológicos próprios, depoimentos, estudos comparativos ou ativos visuais de marca fornecidos. Não apresentar alegações de precisão ou superioridade além do que a fonte garante.

## Product Principles

- Responder primeiro à pergunta sobre chuva.
- Manter busca manual e consulta de clima diretas, sem cadastro.
- Explicar estados de carregamento e falha com mensagens acionáveis.
- Exigir consentimento antes de usar localização e não persistir coordenadas.

## Accessibility & Inclusion

Controles operáveis por teclado, nomes e estados acessíveis, resultados assíncronos anunciados, contraste adequado e layout utilizável em dispositivos móveis são requisitos do produto.

# Site da Atlética Academia NR

Site de uma página (HTML + CSS + JavaScript puros, sem build e sem bibliotecas), baseado no layout de
referência enviado, adaptado para a marca da Atlética (preto + amarelo) e para o público de Novo Repartimento (PA).

## Como ver o site

- **Mais simples:** dê dois cliques em `index.html` (abre direto no navegador).
- **Com servidor local** (se preferir): na pasta do site, rode `python -m http.server 8000` e abra http://localhost:8000

## O que há na pasta

```
index.html                  todo o conteúdo (textos, links, seções)
assets/css/style.css        visual (cores e medidas estão nos "tokens" no topo do arquivo)
assets/css/fonts.css        fontes hospedadas no próprio site (Barlow Condensed + Barlow)
assets/js/main.js           menu mobile, carrossel, acordeão, contadores, "aberto agora"
assets/img/                 imagens usadas pelo site (logo, fotos em WebP, mapa, ícones)
fotos-originais/            fotos de origem (hoje: fotos de banco de imagens PROVISÓRIAS)
tools/otimizar-imagens.py   gera as imagens leves de assets/img/ a partir de fotos-originais/
```

Para publicar, envie apenas `index.html` e a pasta `assets/` (as demais pastas não precisam ir para o servidor).

## Antes de publicar — o que ainda precisa ser confirmado/trocado

Procure por `EDITAR` no `index.html`: cada ponto está comentado.

| O quê | Situação |
|---|---|
| **Fotos** | As atuais são fotos de banco de imagens (Unsplash, uso livre) em preto e branco, só para o layout. Troque pelas fotos reais da academia (veja "Como trocar as fotos"). |
| **Planos e valores** | Os preços aparecem como `XX`, os benefícios são genéricos e o selo "Mais escolhido" (Trimestral) é só exemplo. Preencha com os planos reais. |
| **Serviços** | Musculação, funcional, cardio, personal e suplementos são exemplos — a academia confirma o que oferece. (Musculação e suplementos aparecem no perfil do Instagram.) |
| **Endereço** | Está só "Novo Repartimento — PA". Acrescente rua/número/bairro e, de preferência, troque o botão "Como chegar" pelo link exato do Google Maps. |
| **Nome** | A fachada e os posts usam **ATHLETICA** (com H); o logo e o @ usam **ATLETICA**. O site usa "Atlética" (como no logo). Para mudar, faça uma busca e substituição de "Atlética" no `index.html`. |
| **Números da seção "Sobre"** | 1º lugar, 3 mil seguidores, 16h30 por dia e 6 dias por semana vieram do Instagram e do horário. Troque por números reais (alunos, equipamentos, anos de história). |
| **Domingo** | O "aberto agora" considera domingo fechado (o post de horários só lista segunda a sábado). |
| **Compartilhamento** | Ao publicar, em `<meta property="og:image">` use o endereço completo (`https://seusite.com.br/assets/img/og-image.jpg`). |

## Dados que vieram da própria academia

- **WhatsApp:** (94) 99291-0199 — extraído do link da bio do Instagram (`nuzap.com.br/link/athletica`), que redireciona para esse número.
  Todos os botões abrem uma conversa com mensagem já preenchida (`https://wa.me/5594992910199?text=...`).
- **Horário:** segunda a sexta 5h às 21h30 · sábado 7h às 11h e 15h às 19h (post "Horário de funcionamento").
  Para mudar, edite o texto em `index.html` (seção "Onde estamos" e dados estruturados do topo) **e** a tabela `SCHEDULE` em `assets/js/main.js`.
- **Prêmio:** "Empresa Destaque 2026 — 1º lugar na categoria Academia de Musculação (Prêmio Marcas & Talentos)".
- **Instagram:** @academia.atleticanr

## Como trocar as fotos

1. Coloque as fotos originais (JPG/PNG, pode ser direto da câmera ou do celular) em `fotos-originais/` com estes nomes:
   `hero`, `sobre`, `porque`, `cta`, `servico-musculacao`, `servico-funcional`, `servico-cardio`, `servico-personal`
   (por exemplo `hero.jpg`). Substitua as que já estão lá.
2. Instale o Pillow uma única vez: `pip install pillow`
3. Na pasta do site, rode: `python tools/otimizar-imagens.py`

O script gera as versões em WebP (vários tamanhos para celular e desktop) dentro de `assets/img/`.
No celular o topo usa um recorte **vertical** da foto `hero`; se a pessoa principal da sua foto não estiver
mais ou menos na direita, ajuste `HERO_MOBILE_FOCO_X` no começo do script (0 = esquerda, 1 = direita).

Dicas: `hero` = foto horizontal com a pessoa à direita e espaço escuro à esquerda (o título fica por cima) ·
`porque` = foto vertical (retrato) · `cta` = foto escura, o texto fica por cima.
As fotos coloridas da academia (amarelo e preto) vão aparecer coloridas — o preto e branco de hoje é só das fotos provisórias.

## Onde mexer no visual

- **Cores:** `assets/css/style.css`, bloco `:root` (`--yellow` é o amarelo da marca).
- **Textos, links, seções:** `index.html`.
- **Faixa amarela que corre (marquee):** bloco `class="marquee"` no `index.html` (pode apagar se não quiser).
- **Mapa:** `assets/img/mapa-brasil.svg` (mapa de pontos do Brasil; o pino fica em Novo Repartimento).

## Qualidade verificada

HTML validado; Lighthouse: acessibilidade 100, boas práticas 100, SEO 100 e desempenho 100 no desktop (89 no celular, na simulação de 4G lento).
Testado no Chrome com emulação de celular (320 a 820 px), notebook e desktop; respeita "reduzir movimento" e o conteúdo continua visível sem JavaScript
(só o menu do celular depende dele). Ainda vale abrir no seu celular de verdade antes de publicar.

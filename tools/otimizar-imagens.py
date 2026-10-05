#!/usr/bin/env python3
"""
Gera as imagens otimizadas do site (WebP em vários tamanhos) a partir das fotos originais.

COMO USAR
  1. Coloque as fotos originais (JPG, PNG ou WebP; pode ser direto da câmera/celular) na pasta
     fotos-originais/  com estes nomes:

        hero                  foto principal do topo do site (horizontal)
        sobre                 foto ampla da academia, na seção "Sobre nós" (horizontal)
        porque                foto vertical (retrato), na seção "Por que escolher"
        cta                   foto escura/impactante, no fim da página
        servico-musculacao    \
        servico-funcional      |  fotos dos cartões da seção "Serviços"
        servico-cardio         |
        servico-personal      /

  2. Rode, na pasta do site:      python tools/otimizar-imagens.py
  3. Pronto: as versões leves ficam em assets/img/ (é o que o site usa). Só publique as pastas
     assets/ e o index.html — a pasta fotos-originais/ NÃO precisa ir para o servidor.

  Requer o Pillow (uma vez só):   pip install pillow

  Para o celular, o script também gera um recorte VERTICAL do hero (hero-mobile-*.webp), centralizado
  no ponto HERO_MOBILE_FOCO_X abaixo (0 = borda esquerda da foto, 1 = borda direita). Ajuste esse
  valor se a pessoa principal da sua foto estiver em outro lugar.
"""
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Falta instalar o Pillow. Rode uma vez:  pip install pillow")

RAIZ = Path(__file__).resolve().parent.parent
ORIGINAIS = RAIZ / "fotos-originais"
SAIDA = RAIZ / "assets" / "img"
QUALIDADE = 74  # WebP: 70-80 é um bom equilíbrio entre peso e nitidez

# nome da foto -> larguras (px) geradas. Se mudar aqui, ajuste também os srcset no index.html.
TAMANHOS = {
    "hero": [1000, 1600, 2200],
    "sobre": [700, 1200, 1800],
    "porque": [600, 1000],
    "cta": [900, 1600],
    "servico-musculacao": [500, 800],
    "servico-funcional": [500, 800],
    "servico-cardio": [500, 800],
    "servico-personal": [500, 800],
}

HERO_MOBILE_LARGURAS = [640, 960]
HERO_MOBILE_PROPORCAO = 0.55   # largura / altura do recorte vertical
HERO_MOBILE_FOCO_X = 0.66      # 0 = esquerda, 0.5 = centro, 1 = direita

EXTENSOES = (".jpg", ".jpeg", ".png", ".webp")


def achar_original(nome):
    for ext in EXTENSOES:
        for variante in (ext, ext.upper()):
            caminho = ORIGINAIS / f"{nome}{variante}"
            if caminho.exists():
                return caminho
    return None


def abrir(caminho):
    img = Image.open(caminho)
    img = ImageOps.exif_transpose(img)  # respeita a rotação das fotos de celular
    return img.convert("RGB")


def salvar(img, nome_arquivo, largura):
    altura = round(img.height * largura / img.width)
    saida = img.resize((largura, altura), Image.LANCZOS)
    destino = SAIDA / nome_arquivo
    saida.save(destino, "WEBP", quality=QUALIDADE, method=6)
    return destino.stat().st_size / 1024


def main():
    if not ORIGINAIS.exists():
        sys.exit(f"Pasta não encontrada: {ORIGINAIS}\nCrie a pasta fotos-originais/ e coloque as fotos nela.")
    SAIDA.mkdir(parents=True, exist_ok=True)

    faltando, total_kb = [], 0.0
    for nome, larguras in TAMANHOS.items():
        origem = achar_original(nome)
        if origem is None:
            faltando.append(nome)
            continue
        img = abrir(origem)
        aviso = ""
        if img.width < max(larguras):
            aviso = f"   (aviso: a foto original tem só {img.width}px de largura; use uma maior para ficar mais nítida)"
        print(f"{nome}  <-  {origem.name}  ({img.width}x{img.height}){aviso}")
        for largura in larguras:
            kb = salvar(img, f"{nome}-{largura}.webp", largura)
            total_kb += kb
            print(f"    {nome}-{largura}.webp  {kb:6.0f} KB")

        if nome == "hero":
            # recorte vertical para celular, em torno do ponto de foco
            largura_corte = round(img.height * HERO_MOBILE_PROPORCAO)
            largura_corte = min(largura_corte, img.width)
            centro = HERO_MOBILE_FOCO_X * img.width
            esquerda = int(max(0, min(img.width - largura_corte, centro - largura_corte / 2)))
            corte = img.crop((esquerda, 0, esquerda + largura_corte, img.height))
            for largura in HERO_MOBILE_LARGURAS:
                kb = salvar(corte, f"hero-mobile-{largura}.webp", largura)
                total_kb += kb
                print(f"    hero-mobile-{largura}.webp  {kb:6.0f} KB   (recorte vertical para celular)")

    print(f"\nTotal gerado: {total_kb:.0f} KB em assets/img/")
    if faltando:
        print("Sem foto original para: " + ", ".join(faltando) + "  (mantive as imagens que já existiam)")


if __name__ == "__main__":
    main()

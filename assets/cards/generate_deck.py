#!/usr/bin/env python3
"""Generate an original, resolution-independent Japanese-inspired blackjack deck."""
from pathlib import Path
from html import escape
import math

ROOT = Path(__file__).resolve().parent
FACE_DIR = ROOT / "faces"
W, H = 250, 350
PAPER = "#F7F2E2"
INK = "#26374A"
GOLD = "#B69A61"
SUITS = {
    "clubs":    {"glyph": "♣", "color": "#173F68", "accent": "#C49A4B", "light": "#4E7891", "suit_name": "Clubs"},
    "diamonds": {"glyph": "♦", "color": "#C33C36", "accent": "#D2A451", "light": "#E18A65", "suit_name": "Diamonds"},
    "hearts":   {"glyph": "♥", "color": "#B8323B", "accent": "#D7A04A", "light": "#E88775", "suit_name": "Hearts"},
    "spades":   {"glyph": "♠", "color": "#173553", "accent": "#B99B63", "light": "#6F8999", "suit_name": "Spades"},
}
RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
PIPS = {
    2: [(125, 112), (125, 238)],
    3: [(125, 84), (125, 175), (125, 266)],
    4: [(86, 108), (164, 108), (86, 242), (164, 242)],
    5: [(86, 108), (164, 108), (125, 175), (86, 242), (164, 242)],
    6: [(86, 89), (164, 89), (86, 175), (164, 175), (86, 261), (164, 261)],
    7: [(86, 89), (164, 89), (86, 175), (164, 175), (86, 261), (164, 261), (125, 175)],
    8: [(86, 89), (164, 89), (86, 175), (164, 175), (86, 261), (164, 261), (125, 132), (125, 218)],
    9: [(86, 81), (164, 81), (86, 137), (164, 137), (125, 175), (86, 213), (164, 213), (86, 269), (164, 269)],
    10: [(86, 73), (164, 73), (86, 124), (164, 124), (86, 175), (164, 175), (86, 226), (164, 226), (86, 277), (164, 277)],
}


def suit_shape(suit: str, x: float, y: float, w: float, h: float, color: str) -> str:
    """Return a self-contained path/group; no symbol font is needed."""
    scale = f"translate({x:.2f} {y:.2f}) scale({w/1000:.5f} {h/1000:.5f})"
    if suit == "diamonds":
        shape = '<path d="M500 0 L1000 500 500 1000 0 500 Z"/>'
    elif suit == "hearts":
        shape = '<path d="M500 930 C440 850 95 625 95 380 C95 130 400 60 500 260 C600 60 905 130 905 380 C905 625 560 850 500 930 Z"/>'
    elif suit == "spades":
        shape = '<path d="M500 35 C390 190 105 350 105 560 C105 745 355 815 478 630 C468 770 420 890 335 960 L665 960 C580 890 532 770 522 630 C645 815 895 745 895 560 C895 350 610 190 500 35 Z"/>'
    else:
        shape = '<circle cx="500" cy="300" r="260"/><circle cx="275" cy="570" r="250"/><circle cx="725" cy="570" r="250"/><path d="M420 590 Q500 540 580 590 L650 980 Q500 900 350 980 Z"/>'
    return f'<g transform="{scale}" fill="{color}">{shape}</g>'


def card_frame() -> str:
    return f'''<rect x="5.5" y="5.5" width="239" height="339" rx="17" fill="{PAPER}" stroke="{INK}" stroke-width="2.6"/>
<rect x="11" y="11" width="228" height="328" rx="13" fill="none" stroke="#B8AA89" stroke-width="1.15"/>
<path d="M22 76 V22 H76 M174 22 H228 V76 M22 274 V328 H76 M174 328 H228 V274" fill="none" stroke="#D8CBAE" stroke-width="1.2"/>'''


def corner_index(rank: str, suit: str, color: str) -> str:
    fs = 23 if rank == "10" else 27
    # The same index is rotated into the standard opposite corner.
    corner = f'''<g fill="{color}" text-anchor="middle">
<text x="34" y="42" font-family="Georgia, 'Times New Roman', serif" font-size="{fs}" font-weight="700">{escape(rank)}</text>
{suit_shape(suit, 25, 47, 18, 18, color)}
</g>'''
    return corner + f'<g transform="rotate(180 125 175)">{corner}</g>'


def pip_face(suit: str, rank: str, color: str) -> str:
    if rank == "A":
        return suit_shape(suit, 96, 146, 58, 58, color)
    n = int(rank)
    pieces = []
    for x, y in PIPS[n]:
        # Lower pip rows turn upside down, as on a traditional index card.
        shape = suit_shape(suit, x - 15, y - 15, 30, 30, color)
        if y > 180:
            shape = f'<g transform="rotate(180 {x} {y})">{shape}</g>'
        pieces.append(shape)
    return "\n".join(pieces)


def court_art(rank: str, suit: str, color: str, accent: str, light: str) -> str:
    """Original mirrored vector portraits: kabuto samurai, court lady, and shogun."""
    # Fine ornament behind the people makes every court card feel like one family.
    frame = f'''<rect x="46" y="51" width="158" height="248" rx="11" fill="#F0E7D3" stroke="#C9B98F" stroke-width="1.4"/>
<path d="M57 64 V285 M193 64 V285" stroke="#D9CBA9" stroke-width="1"/>
<path d="M65 75 l7 7 -7 7 -7 -7z M185 75 l7 7 -7 7 -7 -7z M65 270 l7 7 -7 7 -7 -7z M185 270 l7 7 -7 7 -7 -7z" fill="{accent}" opacity=".75"/>'''
    blade = ''
    if rank == "J":
        blade = f'''<path d="M174 74 Q183 66 191 72 L188 147 L180 165 L173 148 Z" fill="#DCE3E1" stroke="{INK}" stroke-width="2"/>
<path d="M171 125 L192 130 M177 151 L187 151" stroke="{accent}" stroke-width="4" stroke-linecap="round"/>'''
        headgear = f'''<path d="M89 98 Q83 75 101 66 Q112 48 126 66 Q146 49 159 68 Q176 79 164 100 L149 91 L126 84 L103 94 Z" fill="{color}" stroke="{INK}" stroke-width="2.5"/>
<path d="M99 77 Q83 59 71 67 Q82 81 98 88 M151 76 Q167 58 181 67 Q169 84 153 89" fill="{accent}" stroke="{INK}" stroke-width="2"/>'''
        hair = ''
        beard = ''
        robe = f'''<path d="M82 169 L88 134 Q96 124 109 127 L124 143 L140 127 Q153 124 164 134 L173 169 Z" fill="{color}" stroke="{INK}" stroke-width="2.6"/>
<path d="M94 136 L125 165 L156 136 L151 174 L99 174 Z" fill="{light}" stroke="{INK}" stroke-width="2"/>
<path d="M103 143 L146 143 M99 153 L151 153 M101 163 L149 163" stroke="{accent}" stroke-width="3"/>
<circle cx="110" cy="151" r="5" fill="{accent}"/><circle cx="139" cy="151" r="5" fill="{accent}"/>'''
        face_hair = '<path d="M101 92 Q104 79 126 79 Q148 80 151 94 L146 108 L104 108 Z" fill="#202C38"/>'
        head_top = headgear
        neck = f'<path d="M113 126 L113 138 L126 148 L139 138 L139 126" fill="#E4B894" stroke="{INK}" stroke-width="2"/>'
    elif rank == "Q":
        blade = f'''<path d="M161 102 Q177 79 196 100 Q192 124 164 133 Z" fill="#F4D995" stroke="{INK}" stroke-width="2"/>
<path d="M165 126 L192 100 M169 128 L190 108 M175 130 L191 116" stroke="{accent}" stroke-width="1.8"/>'''
        headgear = f'''<path d="M95 100 Q88 73 109 69 Q128 49 144 67 Q164 70 158 100 L151 112 L101 112 Z" fill="#202C38" stroke="{INK}" stroke-width="2"/>
<circle cx="157" cy="71" r="14" fill="#202C38" stroke="{INK}" stroke-width="2"/>
<path d="M99 77 Q123 54 151 78" fill="none" stroke="{accent}" stroke-width="5"/>'''
        hair = ''
        beard = ''
        robe = f'''<path d="M76 170 L84 139 Q96 127 108 129 L125 148 L142 129 Q158 127 168 140 L177 170 Z" fill="{color}" stroke="{INK}" stroke-width="2.5"/>
<path d="M99 132 L125 166 L151 132 L143 174 L106 174 Z" fill="#F4E8CE" stroke="{INK}" stroke-width="2"/>
<path d="M84 158 Q126 145 169 158 L174 169 L79 169 Z" fill="{light}" stroke="{INK}" stroke-width="2"/>
<path d="M99 158 H152" stroke="{accent}" stroke-width="5"/>'''
        face_hair = '<path d="M101 91 Q108 78 127 79 Q147 79 151 95 L147 106 L103 106 Z" fill="#202C38"/>'
        head_top = headgear
        neck = f'<path d="M113 125 L113 138 L126 147 L139 138 L139 125" fill="#E8C3A5" stroke="{INK}" stroke-width="2"/>'
    else:
        blade = f'''<path d="M179 84 L181 151 M171 111 H191 M174 148 H188" fill="none" stroke="{accent}" stroke-width="4" stroke-linecap="round"/>
<circle cx="180" cy="78" r="7" fill="{color}" stroke="{INK}" stroke-width="2"/>'''
        headgear = f'''<path d="M98 91 L101 66 L112 71 L126 52 L140 71 L153 65 L156 93 Z" fill="{color}" stroke="{INK}" stroke-width="2.5"/>
<path d="M103 78 H151 M108 88 H147" stroke="{accent}" stroke-width="3"/>
<circle cx="126" cy="60" r="5" fill="{accent}"/>'''
        hair = ''
        beard = f'<path d="M106 111 Q126 129 146 111 Q146 143 126 150 Q106 143 106 111 Z" fill="#30343B" stroke="{INK}" stroke-width="1.6"/>'
        robe = f'''<path d="M78 170 L87 136 Q99 126 110 129 L126 146 L142 129 Q156 126 167 137 L176 170 Z" fill="{color}" stroke="{INK}" stroke-width="2.5"/>
<path d="M101 132 L126 165 L151 132 L145 174 L107 174 Z" fill="{light}" stroke="{INK}" stroke-width="2"/>
<path d="M84 155 H168 M92 164 H161" stroke="{accent}" stroke-width="3"/>
<path d="M126 148 l8 8 -8 8 -8 -8z" fill="#F2E8D5" stroke="{accent}" stroke-width="2"/>'''
        face_hair = '<path d="M101 92 Q105 80 126 80 Q147 80 151 92 L148 104 L104 104 Z" fill="#30343B"/>'
        head_top = headgear
        neck = f'<path d="M113 124 L113 137 L126 147 L139 137 L139 124" fill="#E6BD9D" stroke="{INK}" stroke-width="2"/>'

    figure = f'''<g stroke-linejoin="round" stroke-linecap="round">
{blade}
{hair}
{robe}
{neck}
<ellipse cx="126" cy="105" rx="25" ry="31" fill="#EBC6A5" stroke="{INK}" stroke-width="2.2"/>
{face_hair}
<path d="M112 108 q4 -3 8 0 M133 108 q4 -3 8 0" fill="none" stroke="#312C2B" stroke-width="2"/>
<path d="M125 111 l-2 8 5 1 M119 125 Q126 129 134 124" fill="none" stroke="#9D5D52" stroke-width="1.8"/>
{beard}
{head_top}
<path d="M77 169 H175" stroke="{accent}" stroke-width="3"/>
</g>'''
    center = f'''<path d="M61 175 H111 M139 175 H189" stroke="{accent}" stroke-width="1.5"/>
<circle cx="125" cy="175" r="15" fill="{PAPER}" stroke="{accent}" stroke-width="2"/>
{suit_shape(suit, 118, 168, 14, 14, color)}'''
    return frame + f'<g>{figure}</g><g transform="rotate(180 125 175)">{figure}</g>' + center


def face_svg(suit: str, rank: str) -> str:
    spec = SUITS[suit]
    art = pip_face(suit, rank, spec["color"]) if rank in ["A", *[str(i) for i in range(2, 11)]] else court_art(rank, suit, spec["color"], spec["accent"], spec["light"])
    kind = "number card" if rank not in ("J", "Q", "K") else {"J": "samurai page", "Q": "court lady", "K": "shogun"}[rank]
    body = card_frame() + art + corner_index(rank, suit, spec["color"])
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="63.5mm" height="88.9mm" viewBox="0 0 {W} {H}" role="img" aria-label="{rank} of {spec['suit_name']}">
<title>{rank} of {spec['suit_name']}</title><desc>Original vector playing card with warm ivory face, {spec['suit_name'].lower()} indices, and {kind} artwork where applicable.</desc>
{body}
</svg>'''


def card_back() -> str:
    rays = []
    for angle in range(0, 360, 45):
        rays.append(f'<ellipse cx="125" cy="175" rx="9" ry="31" transform="rotate({angle} 125 175)" fill="#D9C58F"/>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="63.5mm" height="88.9mm" viewBox="0 0 {W} {H}" role="img" aria-label="Japanese-inspired navy card back">
<title>Japanese-inspired card back</title><desc>Uniform navy card back with a fine geometric lattice and a rotationally balanced eight-petal crest.</desc>
<rect x="5.5" y="5.5" width="239" height="339" rx="17" fill="#173553" stroke="#10273F" stroke-width="3"/>
<rect x="13" y="13" width="224" height="324" rx="12" fill="#1D4165" stroke="#E0CD98" stroke-width="2"/>
<defs><pattern id="asanoha" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M15 0 L30 15 L15 30 L0 15 Z M0 0 L30 30 M30 0 L0 30" fill="none" stroke="#7590A3" stroke-width="1" opacity=".55"/></pattern></defs>
<rect x="19" y="19" width="212" height="312" rx="9" fill="url(#asanoha)" stroke="#93A5A4" stroke-width="1"/>
<rect x="31" y="31" width="188" height="288" rx="7" fill="none" stroke="#E0CD98" stroke-width="1.4"/>
<path d="M125 43 V307 M42 175 H208" stroke="#E0CD98" stroke-width="1" opacity=".45"/>
<g>{''.join(rays)}</g>
<circle cx="125" cy="175" r="44" fill="#1D4165" stroke="#E0CD98" stroke-width="2.5"/>
<circle cx="125" cy="175" r="32" fill="none" stroke="#B94142" stroke-width="3"/>
<circle cx="125" cy="175" r="21" fill="#B94142" stroke="#F0DCA9" stroke-width="2"/>
<path d="M125 157 L130 170 L143 175 L130 180 L125 193 L120 180 L107 175 L120 170 Z" fill="#F5E8C6"/>
<circle cx="125" cy="175" r="5" fill="#173553"/>
<path d="M125 57 l10 10 -10 10 -10 -10z M125 273 l10 10 -10 10 -10 -10z M48 175 l10 10 -10 10 -10 -10z M202 175 l10 10 -10 10 -10 -10z" fill="#E0CD98"/>
</svg>'''


def main() -> None:
    FACE_DIR.mkdir(parents=True, exist_ok=True)
    cards = []
    for suit in SUITS:
        for rank in RANKS:
            name = f"{suit}-{rank}.svg"
            content = face_svg(suit, rank)
            (FACE_DIR / name).write_text(content + "\n", encoding="utf-8")
            cards.append((name, content))
    (ROOT / "back.svg").write_text(card_back() + "\n", encoding="utf-8")
    # A self-contained contact sheet makes every individual SVG visible in one file.
    cell_w, cell_h, gap, margin = 116, 162, 16, 28
    cols, rows = 7, 8
    sheet_w = margin * 2 + cols * cell_w + (cols - 1) * gap
    sheet_h = 74 + rows * cell_h + (rows - 1) * gap + margin
    preview = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{sheet_w}px" height="{sheet_h}px" viewBox="0 0 {sheet_w} {sheet_h}">',
               '<rect width="100%" height="100%" fill="#e8e1d0"/>',
               '<text x="28" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#26374A">Original Japanese-inspired Blackjack deck</text>',
               '<text x="28" y="61" font-family="Arial, sans-serif" font-size="12" fill="#5d6470">52 scalable face cards • 250 × 350 viewBox • uniform back in back.svg</text>']
    for index, (name, content) in enumerate(cards):
        col, row = index % cols, index // cols
        x, y = margin + col * (cell_w + gap), 74 + row * (cell_h + gap)
        preview.append(f'<g transform="translate({x} {y}) scale({cell_w/W:.5f} {cell_h/H:.5f})">{card_frame()}')
        # Strip the standalone root/title/desc and embed the vector card body.
        spec = name.removesuffix(".svg").rsplit("-", 1)
        suit, rank = spec[0], spec[1]
        art = pip_face(suit, rank, SUITS[suit]["color"]) if rank in ["A", *[str(i) for i in range(2, 11)]] else court_art(rank, suit, SUITS[suit]["color"], SUITS[suit]["accent"], SUITS[suit]["light"])
        preview.append(art + corner_index(rank, suit, SUITS[suit]["color"]) + '</g>')
    # Single back sample at the final cell, scaled in a nested viewport.
    x, y = margin + 6 * (cell_w + gap), 74 + 7 * (cell_h + gap)
    preview.append(f'<svg x="{x}" y="{y}" width="{cell_w}" height="{cell_h}" viewBox="0 0 {W} {H}">{card_back().split(">", 1)[1].rsplit("</svg>", 1)[0]}</svg>')
    preview.append('</svg>')
    (ROOT / "contact-sheet.svg").write_text("\n".join(preview) + "\n", encoding="utf-8")
    (ROOT / "preview.html").write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Original Blackjack deck preview</title><style>body{margin:0;padding:24px;background:#e8e1d0;font:16px system-ui;color:#26374a}h1{font-size:1.35rem}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;max-width:1100px}.grid figure{margin:0}.grid img{display:block;width:100%;height:auto;filter:drop-shadow(0 3px 4px #0003)}figcaption{text-align:center;font-size:12px;padding-top:4px}</style><h1>Original Japanese-inspired blackjack deck</h1><p>52 scalable card faces and the uniform back. Open a card SVG individually for full-size inspection.</p><div class="grid">''' + "".join(f'<figure><img src="faces/{name}" alt="{escape(name)}"><figcaption>{escape(name.removesuffix(".svg"))}</figcaption></figure>' for name, _ in cards) + '<figure><img src="back.svg" alt="Card back"><figcaption>Uniform back</figcaption></figure></div></html>\n', encoding="utf-8")
    print(f"Generated {len(cards)} face SVGs, 1 back SVG, contact-sheet.svg, and preview.html in {ROOT}")


if __name__ == "__main__":
    main()

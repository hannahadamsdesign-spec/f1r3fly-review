#!/usr/bin/env python3
"""F1R3FLY brand portal builder (2026-11-06 reorganisation).

Reads assets.json and the OLD repo, writes a complete NEW repo tree:
  index.html                 home page with the left nav
  logos/<brand>/             one preview page per brand plus every asset as PDF, JPG, SVG, PNG, ZIP
  products/ign/              same, for ign1t10n
  social/templates/          LinkedIn post templates, preview page
  social/canva/              animated Canva template previews (MP4 + thumbs)
  books/, system/, fonts/, kit/, review-files/, _archive/, build/

Usage: python3 build.py <old-repo> <new-tree>
"""
import json, os, re, shutil, sys, zipfile, html, glob
import cairosvg
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svg_flatten import flatten

OLD = os.path.abspath(sys.argv[1]); OUT = os.path.abspath(sys.argv[2])
HERE = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(HERE, 'assets.json')))
BG = {'dark': (10, 10, 10), 'light': (255, 255, 255)}
PNG_LONG = 2048
SITE = 'F1R3FLY Brand Portal'
UPDATE = M['last_update']
RAW = 'https://raw.githubusercontent.com/hannahadamsdesign-spec/f1r3fly-brand-portal/main/'
LIVE = 'https://hannahadamsdesign-spec.github.io/f1r3fly-brand-portal/'
REPO = 'https://github.com/hannahadamsdesign-spec/f1r3fly-brand-portal'

def ensure(p): os.makedirs(p, exist_ok=True); return p
def cp(src, dst): ensure(os.path.dirname(dst)); shutil.copyfile(src, dst)

# ---------------------------------------------------------------- assets
def whiten_unfilled(svg):
    """Paths with no fill attribute default to black; make them white (the wordmark). Circles stay black."""
    svg = re.sub(r'<path(?![^>]*\bfill=)', '<path fill="#FFFFFF"', svg)
    svg = re.sub(r'<circle(?![^>]*\bfill=)', '<circle fill="#000000"', svg)
    return svg

def build_asset(svg_text, src_pdf, base, bg, dest):
    svg_out = os.path.join(dest, base + '.svg'); open(svg_out, 'w', encoding='utf-8').write(svg_text)
    pdf_out = os.path.join(dest, base + '.pdf')
    if src_pdf: shutil.copyfile(src_pdf, pdf_out)
    else: cairosvg.svg2pdf(bytestring=svg_text.encode(), write_to=pdf_out)
    tmp = os.path.join(dest, base + '.tmp.png')
    cairosvg.svg2png(bytestring=svg_text.encode(), write_to=tmp, output_width=PNG_LONG)
    im = Image.open(tmp).convert('RGBA')
    if im.height > im.width:
        cairosvg.svg2png(bytestring=svg_text.encode(), write_to=tmp, output_height=PNG_LONG); im = Image.open(tmp).convert('RGBA')
    im.save(os.path.join(dest, base + '.png'), optimize=True); os.remove(tmp)
    flat = Image.new('RGB', im.size, BG[bg]); flat.paste(im, mask=im); flat.save(os.path.join(dest, base + '.jpg'), quality=92, subsampling=0)
    with zipfile.ZipFile(os.path.join(dest, base + '.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for ext in ('pdf', 'jpg', 'svg', 'png'): z.write(os.path.join(dest, f'{base}.{ext}'), f'{base}.{ext}')
    return {'w': im.width, 'h': im.height}

def brand_asset(brand, a, dest):
    if a.get('old'):
        src_svg = os.path.join(OLD, brand['source_folder'], a['old'] + '.svg')
        src_pdf = os.path.join(OLD, brand['source_folder'], a['old'] + '.pdf')
        if not os.path.exists(src_pdf): src_pdf = None
    else:
        src_svg = os.path.join(HERE, a['src_svg']); src_pdf = None
    svg = flatten(open(src_svg, encoding='utf-8').read())
    if a.get('whiten_unfilled'): svg = whiten_unfilled(svg); src_pdf = None
    return build_asset(svg, src_pdf, a['new'], a['bg'], dest)

# ---------------------------------------------------------------- shared css
CSS = """
:root{--black:#000;--panel:#001626;--panel-edge:#0d3050;--white:#fff;--yellow:#f3d630;--sky:#3fa9f5;--text:#f2f2f2;--text-dim:#d2dae0;
--sig-gradient:linear-gradient(to right,#f3d630,#3fa9f5);--btn-gradient:linear-gradient(to right,#00528c,#009188);--font:"Source Sans 3",sans-serif;--head:"League Spartan",sans-serif}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{background:var(--black);color:var(--text);font-family:var(--font);line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}code{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:.9em;color:var(--sky)}
.wrap{width:100%;max-width:1700px;padding:0 clamp(16px,4vw,68px)}
.eyebrow{font-family:var(--head);font-weight:700;text-transform:uppercase;letter-spacing:.16em;font-size:.78rem;color:transparent;background:var(--sig-gradient);-webkit-background-clip:text;background-clip:text;width:max-content}
.crumbs{padding:34px 0 0;font-family:var(--head);font-weight:600;font-size:.86rem;letter-spacing:.06em;text-transform:uppercase;color:var(--text-dim);display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.crumbs a{color:var(--sky)}.crumbs a:hover{text-decoration:underline}.crumbs .sep{color:#4a5862}.crumbs .here{color:var(--white)}
header.hero{padding:26px 0 22px}.hero-row{display:flex;align-items:baseline;justify-content:space-between;gap:24px;flex-wrap:wrap}
.hero h1{font-family:var(--head);font-weight:700;text-transform:uppercase;font-size:clamp(2rem,4.6vw,3.4rem);line-height:1.02}
.last-update{font-family:var(--head);font-weight:600;text-transform:uppercase;letter-spacing:.1em;font-size:.95rem}
.grad-rule{height:1px;background:var(--sig-gradient);border:0;width:100%}
.intro{padding:20px 0 4px}.intro p{font-size:1.12rem;color:var(--text-dim);max-width:52em}
.which{margin:22px 0 6px;background:var(--panel);border:1px solid var(--panel-edge);border-radius:14px;padding:18px 22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px 28px;max-width:1100px}
.which h3{font-family:var(--head);font-weight:700;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--yellow);grid-column:1/-1}
.which div{font-size:.98rem;color:var(--text-dim)}.which b{color:var(--white)}
section{padding:26px 0}.section-head{display:flex;align-items:baseline;gap:16px;margin-bottom:18px;flex-wrap:wrap}
.section-head h2{font-family:var(--head);font-weight:700;font-size:1.5rem}.section-head .hint{color:var(--text-dim);font-size:.98rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
.card{background:var(--panel);border:1px solid var(--panel-edge);border-radius:16px;overflow:hidden;display:flex;flex-direction:column}.card.linkcard{transition:border-color .2s,transform .2s}
.card.linkcard:hover{border-color:var(--sky);transform:translateY(-2px)}
.well{min-height:200px;padding:26px;display:flex;align-items:center;justify-content:center;gap:20px;border-bottom:1px solid var(--panel-edge);background:#0a0a0a}
.well.light{background:#fff}.well.book{min-height:300px}.well.checker{background-color:#cfcfcf;background-image:linear-gradient(45deg,#9a9a9a 25%,transparent 25%),linear-gradient(-45deg,#9a9a9a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#9a9a9a 75%),linear-gradient(-45deg,transparent 75%,#9a9a9a 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0}.well.checker.dark{background-color:#3a3a3a;background-image:linear-gradient(45deg,#262626 25%,transparent 25%),linear-gradient(-45deg,#262626 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#262626 75%),linear-gradient(-45deg,transparent 75%,#262626 75%)}
.well img{max-height:150px;max-width:82%;display:block}.well img.round{border-radius:50%}.well img.tall{max-height:170px}
.well img.panel{outline:1px solid #2e3a44}.well img.cover{max-height:248px;border:1px solid #4a5862;border-radius:4px;box-shadow:0 8px 30px rgba(0,0,0,.55)}
.well img.post{max-height:230px;max-width:100%;border-radius:6px}.well img.shot{max-height:168px;max-width:46%;border-radius:6px}
.body{padding:18px 20px 20px;display:flex;flex-direction:column;gap:8px;flex-grow:1}
.body h3{font-family:var(--head);font-weight:700;font-size:1.12rem;line-height:1.3}
.body .meta{font-family:var(--head);font-weight:700;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--yellow)}
.body .desc{font-size:.97rem;color:var(--text-dim)}
.body .file{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:.76rem;color:var(--sky);overflow-wrap:break-word}
.btns{display:flex;gap:7px;flex-wrap:wrap;margin-top:auto;padding-top:10px}
.btn{font-family:var(--head);font-weight:700;font-size:.8rem;letter-spacing:.04em;padding:9px 13px;border-radius:8px;border:1px solid #20486b;color:var(--white);transition:all .18s;display:inline-block}
.btn:hover{border-color:var(--sky);color:var(--sky)}.btn.primary{background:var(--btn-gradient);border:0}.btn.primary:hover{color:#fff;filter:brightness(1.1)}
.more{margin-top:14px;font-family:var(--head);font-weight:600;font-size:.9rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim)}
.note{margin-top:18px;font-size:.97rem;color:var(--text-dim);max-width:60em;line-height:1.7}.note b{color:var(--white)}.note a{color:var(--sky);font-weight:600}
.swrow{display:flex;width:100%;height:188px}.swrow span{flex:1}
.well.thumbs{gap:10px;padding:18px;flex-wrap:wrap}.well.thumbs video{border-radius:6px;background:#000;display:block;object-fit:cover}
.well.thumbs.two video{width:calc(50% - 5px)}.well.thumbs.four video{width:calc(25% - 8px)}.well.thumbs.five video{width:calc(33.333% - 7px)}
.dl{font-size:.92rem;color:var(--text-dim);line-height:1.8}.dl b{color:var(--white)}.dl a{color:var(--sky);font-weight:600}.dl a:hover{text-decoration:underline}
footer{margin-top:30px;padding:30px 0 60px;border-top:1px solid #0a2236}footer .frow{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
footer p{font-size:.86rem;color:var(--text-dim)}footer a{color:var(--sky);font-weight:600}
/* home layout: left nav + content */
.layout{display:grid;grid-template-columns:250px 1fr;gap:clamp(24px,4vw,64px);align-items:start}
nav.side{position:sticky;top:28px;padding-top:6px;border-right:1px solid #0a2236}
nav.side a{display:block;font-family:var(--head);font-weight:700;font-size:1.08rem;padding:6px 0;color:var(--white)}
nav.side a.sub{font-weight:400;font-size:.98rem;padding:3px 0 3px 18px;color:var(--text-dim)}
nav.side a:hover{color:var(--sky)}nav.side .gap{height:12px}nav.side .soon{display:block;font-family:var(--head);font-size:.86rem;padding:3px 0 3px 18px;color:#6f7d88;font-style:italic}
@media (max-width:900px){.layout{grid-template-columns:1fr}nav.side{position:static;border-right:0;border-bottom:1px solid #0a2236;padding-bottom:14px;display:flex;flex-wrap:wrap;gap:4px 18px}nav.side a.sub{padding-left:0}nav.side .gap{display:none}}
"""
HEAD = """<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><link rel="icon" href="{root}logos/ff.io/ff.io-icon-bug-color-transp.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;600;700&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>{css}</style></head><body>"""
FOOT = """<footer><div class="wrap"><hr class="grad-rule" style="margin-bottom:26px"><div class="frow"><p>&copy; F1R3FLY Industries, 2026. All rights reserved.</p>
<p><a href="{root}index.html">Home</a> &middot; AI brand kit: <a href="{root}kit/f1r3fly-brand-kit.skill" download>download the skill</a> &middot; <a href="{repo}/blob/main/kit/SKILL.md" target="_blank" rel="noopener">read the spec</a> &middot; <a href="{repo}" target="_blank" rel="noopener">repository &rarr;</a></p></div></div></footer>"""

def crumbs(root, items):
    out = []
    for i, (label, href) in enumerate(items):
        if i: out.append('<span class="sep">&rsaquo;</span>')
        out.append(f'<span class="here">{html.escape(label)}</span>' if href is None else f'<a href="{href}">{html.escape(label)}</a>')
    return f'<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb">{"".join(out)}</nav></div>'

def page_top(root, title, h1):
    return (HEAD.format(title=title, css=CSS, root=root) +
            f'<header class="hero"><div class="wrap"><div class="hero-row"><h1>{html.escape(h1)}</h1><div class="last-update">Last update: {UPDATE}</div></div></div></header><div class="wrap"><hr class="grad-rule"></div>')

def dl_card(base, name, bg, dims, exts=('pdf', 'jpg', 'svg', 'png'), note=None, img=None, imgcls=''):
    cls = imgcls or ('tall' if dims and dims['h'] > dims['w'] else '')
    if base.endswith(('-onblack', '-onwhite')): cls += ' panel'
    wellcls = bg if base.endswith(('-onblack', '-onwhite')) or '-post-' in base else f'checker {bg}'
    n = f'<div class="meta">{html.escape(note)}</div>' if note else ''
    btns = ''.join(f'<a class="btn" href="{base}.{e}" download>{e.upper()}</a>' for e in exts)
    return f"""<div class="card"><div class="well {wellcls}"><img class="{cls.strip()}" src="{img or base + '.svg'}" alt="{html.escape(name)}" loading="lazy"></div>
<div class="body"><h3>{html.escape(name)}</h3>{n}<div class="file">{base}</div><div class="btns">{btns}<a class="btn primary" href="{base}.zip" download>ALL (zip)</a></div></div></div>"""

WHICH = ('<div class="which"><h3>Which file?</h3>'
         '<div><b>Keynote, PowerPoint, Word, Pages, OmniGraffle:</b> PDF or PNG.</div>'
         '<div><b>Web, Canva, Figma, Illustrator:</b> SVG.</div>'
         '<div><b>Email signatures, quick drops:</b> JPG (background baked in).</div>'
         '<div><b>Not sure:</b> ALL (zip) has every format.</div></div>')

def brand_page(brand, dims):
    root = '../' * (brand['folder'].count('/') + 1)
    out = [HEAD.format(title=f'{brand["title"]} assets · {SITE}', css=CSS, root=root),
           crumbs(root, [('Home', root + 'index.html'), (brand['group'], f'{root}index.html#{brand["group_anchor"]}'), (brand['title'], 'index.html'), ('Assets', None)]),
           f'<header class="hero"><div class="wrap"><div class="hero-row"><h1>{html.escape(brand["title"])} assets</h1><div class="last-update">Last update: {UPDATE}</div></div></div></header><div class="wrap"><hr class="grad-rule"></div>',
           f'<div class="intro"><div class="wrap"><p>{html.escape(brand["intro"])}</p>{WHICH}</div></div>']
    for s in brand['sections']:
        sid = ' id="profile"' if s['title'] == 'Profile pictures' else ''
        out.append(f'<section{sid}><div class="wrap"><div class="section-head"><h2>{html.escape(s["title"])}</h2><span class="hint">{html.escape(s["hint"])}</span></div><div class="grid">')
        out += [dl_card(a['new'], a['name'], a['bg'], dims[a['new']], note=a.get('note'), imgcls='round' if a.get('shape') == 'round' else '') for a in s['assets']]
        out.append('</div></div></section>')
    out.append('<div class="wrap"><p class="note"><b>Names:</b> <code>transp-dark</code> is transparent and made for dark backgrounds (white wordmark); <code>transp-light</code> is transparent for light backgrounds (black wordmark); <code>onblack</code> and <code>onwhite</code> have the background baked in.</p></div>')
    out.append(FOOT.format(root=root, repo=REPO) + '</body></html>')
    return '\n'.join(out)

# ---------------------------------------------------------------- social templates
POST_SRC = os.path.join(OLD, 'templates/social-media-templates/linkedin-post')
def build_posts(dest):
    cards = []; names = []
    for png in sorted(glob.glob(os.path.join(POST_SRC, '*.png'))):
        old = os.path.basename(png)[:-4]
        base = 'ff.io-post-square-' + old.replace('f1r3fly-io-social-square-1080-', '')
        names.append((old, base))
        cp(png, os.path.join(dest, base + '.png'))
        svg = flatten(open(os.path.join(POST_SRC, 'vector-source', old + '.svg'), encoding='utf-8').read())
        open(os.path.join(dest, base + '.svg'), 'w', encoding='utf-8').write(svg)
        cp(os.path.join(POST_SRC, 'vector-source', old + '.pdf'), os.path.join(dest, base + '.pdf'))
        Image.open(png).convert('RGB').save(os.path.join(dest, base + '.jpg'), quality=92, subsampling=0)
        with zipfile.ZipFile(os.path.join(dest, base + '.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
            for ext in ('pdf', 'jpg', 'svg', 'png'): z.write(os.path.join(dest, f'{base}.{ext}'), f'{base}.{ext}')
        kind = base.split('-')[3]
        label = {'announcement': 'Announcement', 'article': 'Article', 'quote': 'Quote', 'event': 'Event', 'stat': 'Stat', 'tagline': 'Tagline'}[kind]
        variant = base.replace(f'ff.io-post-square-{kind}-', '').replace('-', ' ')
        cards.append(dl_card(base, f'{label}: {variant}', 'dark', None, img=base + '.png', imgcls='post'))
    root = '../../'
    page = [HEAD.format(title=f'Social post templates · {SITE}', css=CSS, root=root),
            crumbs(root, [('Home', root + 'index.html'), ('Social media assets', f'{root}index.html#social'), ('Post templates', None)]),
            f'<header class="hero"><div class="wrap"><div class="hero-row"><h1>Social post templates</h1><div class="last-update">Last update: {UPDATE}</div></div></div></header><div class="wrap"><hr class="grad-rule"></div>',
            '<div class="intro"><div class="wrap"><p>Ready-to-post 1080 x 1080 layouts for the F1R3FLY.IO feed: announcements, articles, quotes, events, stats and taglines, each in two or three background treatments. The PNG is the one to post. The SVG and PDF are the editable source for designers; headline type is outlined, so no fonts are needed. The text is placeholder copy: for a version with your own headline, ask Hannah.</p></div></div>',
            '<section><div class="wrap"><div class="grid">', *cards, '</div></div></section>', FOOT.format(root=root, repo=REPO), '</body></html>']
    open(os.path.join(dest, 'index.html'), 'w', encoding='utf-8').write('\n'.join(page))
    return names

# ---------------------------------------------------------------- canva previews
CANVA = [('01', 'logo-intro'), ('02', 'grey-to-navy'), ('03', 'teal'), ('04', 'magenta'), ('05', 'green'),
         ('06', 'panel-loop-grey-to-navy'), ('07', 'panel-loop-teal'), ('08', 'panel-loop-magenta'), ('09', 'firefly-panel-straight'), ('10', 'firefly-panel-curved')]
def build_canva(dest):
    src = os.path.join(OLD, 'templates/canva-animated'); names = []
    for n, slug in CANVA:
        for shape in ('square', 'portrait'):
            for suffix, ext in (('', 'mp4'), ('-thumb', 'png')):
                old = f'f1r3fly-io-template-{n}-{slug}-{shape}{suffix}.{ext}'
                if os.path.exists(os.path.join(src, old)):
                    new = f'ff.io-canva-{n}-{slug}-{shape}{suffix}.{ext}'; cp(os.path.join(src, old), os.path.join(dest, new)); names.append((old, new))
    return names

def video(n, slug, shape='square'):
    return (f'<video muted loop playsinline preload="none" poster="social/canva/ff.io-canva-{n}-{slug}-{shape}-thumb.png" '
            f'src="social/canva/ff.io-canva-{n}-{slug}-{shape}.mp4" aria-label="Template {n} preview"></video>')

# ---------------------------------------------------------------- home
def home(dims):
    b = M['brands']
    def brand_card(key):
        br = b[key]; f = br['folder']
        return f"""<div class="card linkcard"><a href="{f}/index.html"><div class="well"><img src="{f}/{br['card_img']}" alt="{html.escape(br['title'])} logo" style="max-height:90px;max-width:76%"></div></a>
<div class="body"><h3>{html.escape(br['title'])}</h3><div class="desc">{html.escape(br['card_desc'])}</div>
<div class="btns"><a class="btn primary" href="{f}/index.html">See all variants</a><a class="btn" href="{f}/{br['card_img'][:-4]}.zip" download>Download the main logo</a></div></div></div>"""
    nav = ('<nav class="side" aria-label="Sections">'
           '<a href="#books">Brand Books</a><div class="gap"></div>'
           '<a href="#logos">Primary Logos</a><a class="sub" href="logos/ff.io/index.html">F1R3FLY.IO</a><a class="sub" href="logos/ff.indust/index.html">F1R3FLY INDUSTRIES</a><a class="sub" href="logos/flang/index.html">F1R3L@NG</a><div class="gap"></div>'
           '<a href="#products">Product Logos</a><a class="sub" href="products/ign/index.html">ign1t10n</a><span class="sub soon">More coming</span><div class="gap"></div>'
           '<a href="#system">Color, Fonts and Layout</a><div class="gap"></div>'
           '<a href="#social">Social Media Assets</a></nav>')
    main = []
    main.append('<div class="intro" style="padding-top:0"><p>Pick a category, preview the file, and download it. Three brands live here: F1R3FLY Industries (the trefoil knot), F1R3FLY.IO (the firefly bug), and f1r3lang (the language, formerly Rholang). Below them, the product logos, starting with ign1t10n, the installer.</p></div>')
    # books
    main.append(f"""<section id="books"><div class="section-head"><h2>Brand books</h2><span class="hint">The deep reference for each brand</span></div><div class="grid">
<div class="card"><div class="well book"><img class="cover" src="books/ff.indust-brand-style-guide-cover.png" alt="F1R3FLY Industries Brand Style Guide cover"></div><div class="body"><h3>F1R3FLY Industries</h3><div class="meta">Brand Style Guide &middot; September 2026</div><div class="desc">The master-brand rulebook for the trefoil knot. Logo construction and clearspace, brand architecture, the layout grid, color, typography, and voice.</div><div class="btns"><a class="btn primary" href="books/ff.indust-brand-style-guide-2026-09.pdf" target="_blank" rel="noopener">Download PDF</a></div></div></div>
<div class="card"><div class="well book"><img class="cover" src="books/ff.io-brand-guidebook-cover.png" alt="F1R3FLY.IO Brand Guidebook cover"></div><div class="body"><h3>F1R3FLY.IO</h3><div class="meta">Brand Guidebook &middot; September 2026</div><div class="desc">The developer-platform rulebook for the firefly bug. The same depth as the Industries guide, tuned for F1R3FLY.IO.</div><div class="btns"><a class="btn primary" href="books/ff.io-brand-guidebook-2026-09.pdf" target="_blank" rel="noopener">Download PDF</a></div></div></div>
</div></section>""")
    main.append(f'<section id="logos"><div class="section-head"><h2>Primary logos</h2><span class="hint">Click a brand to see every variant on its own background</span></div><div class="grid">{brand_card("ff.io")}{brand_card("ff.indust")}{brand_card("flang")}</div></section>')
    main.append(f'<section id="products"><div class="section-head"><h2>Product logos</h2><span class="hint">Marks for the things built on F1R3FLY</span></div><div class="grid">{brand_card("ign")}</div><p class="more">More coming</p></section>')
    main.append("""<section id="system"><div class="section-head"><h2>Color, fonts and layout</h2><span class="hint">The system everything is built on</span></div><div class="grid">
<div class="card"><div class="well" style="padding:0"><div class="swrow"><span style="background:#000;border-right:1px solid #0d3050"></span><span style="background:#fff"></span><span style="background:#f3d630"></span><span style="background:#3fa9f5"></span></div></div><div class="body"><h3>Colors</h3><div class="desc">Black <code>#000000</code>, White, Brand Yellow <code>#F3D630</code>, and Brand Sky <code>#3FA9F5</code>, with the signature gradient running yellow &rarr; sky. The PDF shows the full system; the swatch pack drops the palette into Illustrator, Photoshop, and Canva.</div><div class="btns"><a class="btn primary" href="system/ff-color-system-2026-06.pdf" target="_blank" rel="noopener">Color system (PDF)</a><a class="btn" href="system/ff-swatches.zip" download>Swatch pack (zip)</a></div></div></div>
<div class="card"><div class="well" style="flex-direction:column;gap:7px;align-items:flex-start;padding:30px 32px"><span style="font-family:'League Spartan',sans-serif;font-weight:700;font-size:2rem;line-height:1">League Spartan</span><span style="font-family:var(--head);font-weight:700;font-size:.72rem;letter-spacing:.14em;color:var(--yellow)">HEADINGS &middot; UI</span><span style="font-size:1.08rem;color:var(--text-dim);margin-top:10px">Source Sans 3 &middot; body text</span></div><div class="body"><h3>Fonts</h3><div class="desc">League Spartan (Light, Regular, SemiBold, Bold) for headings and UI; Source Sans 3 for body text. Both free under the SIL Open Font License. Brandon Grotesque lives only inside the logo files; never typeset it yourself.</div><div class="btns"><a class="btn primary" href="fonts/ff-fonts.zip" download>Download fonts (zip)</a><a class="btn" href="https://fonts.google.com/specimen/League+Spartan" target="_blank" rel="noopener">Google Fonts</a></div></div></div>
<div class="card"><div class="well"><img class="cover" src="system/ff-grid-preview.png" alt="F1R3FLY layout grid over a social post" style="max-height:184px;border:0;box-shadow:none"></div><div class="body"><h3>Layout grid</h3><div class="desc">The 6-column grid behind every F1R3FLY layout, the same one in the brand books. Drop it over your artboard to keep margins, columns, and baselines consistent.</div><div class="btns"><a class="btn" href="system/ff-grid.pdf" download>PDF</a><a class="btn" href="system/ff-grid.svg" download>SVG</a><a class="btn" href="system/ff-grid.png" download>PNG</a><a class="btn primary" href="system/ff-grid.zip" download>ALL (zip)</a></div></div></div>
</div></section>""")
    main.append(f"""<section id="social"><div class="section-head"><h2>Social media assets</h2><span class="hint">Profile pictures, post templates, and animated Canva templates</span></div><div class="grid">
<div class="card linkcard"><a href="logos/ff.io/index.html#profile"><div class="well"><img src="logos/ff.io/ff.io-avatar-ring-color-onblack.svg" alt="F1R3FLY.IO profile picture, ring" class="round" style="max-height:140px"><img src="logos/ff.io/ff.io-avatar-square-color-onblack.svg" alt="F1R3FLY.IO profile picture, square" style="max-height:140px;border-radius:10px"></div></a><div class="body"><h3>F1R3FLY.IO profile pictures</h3><div class="meta">YouTube &middot; X &middot; Bluesky &middot; LinkedIn</div><div class="desc">The bug and wordmark in a thin ring for YouTube, X and Bluesky; the bug alone on black for LinkedIn. 2000 x 2000.</div><div class="btns"><a class="btn primary" href="logos/ff.io/ff.io-avatar-ring-color-onblack.zip" download>Ring (zip)</a><a class="btn" href="logos/ff.io/ff.io-avatar-square-color-onblack.zip" download>Square (zip)</a><a class="btn" href="logos/ff.io/index.html">All F1R3FLY.IO files</a></div></div></div>
<div class="card linkcard"><a href="social/templates/index.html"><div class="well"><img class="shot" src="social/templates/ff.io-post-square-tagline-bold-brand-ellipse.png" alt="social template"><img class="shot" src="social/templates/ff.io-post-square-stat-gradient-dark-orb.png" alt="social template"></div></a><div class="body"><h3>Social post templates</h3><div class="desc">Sixteen ready-to-post 1080 squares: announcements, articles, quotes, events, stats and taglines. Grab the PNG to post now, or the SVG or PDF source to customize.</div><div class="btns"><a class="btn primary" href="social/templates/index.html">See all sixteen</a></div></div></div>
<div class="card"><div class="well thumbs two">{video('01','logo-intro')}{video('01','logo-intro','portrait')}</div><div class="body"><h3>Logo intro</h3><div class="meta">Animated Canva template 01 &middot; Square and Portrait</div><div class="desc">The F1R3FLY.IO logo rises in, then the eyebrow, headline, and bullets. Open it in Canva for your own editable copy. Hover or tap a preview to play it.</div><div class="btns"><a class="btn primary" href="https://canva.link/8gpidz1itwsumvk" target="_blank" rel="noopener">Open in Canva: Square</a><a class="btn" href="https://canva.link/ni2jv95vgtj2fw3" target="_blank" rel="noopener">Portrait</a></div><div class="dl"><b>MP4:</b> <a href="social/canva/ff.io-canva-01-logo-intro-square.mp4" download>Square</a> &middot; <a href="social/canva/ff.io-canva-01-logo-intro-portrait.mp4" download>Portrait</a></div></div></div>
<div class="card"><div class="well thumbs four">{video('02','grey-to-navy')}{video('03','teal')}{video('04','magenta')}{video('05','green')}</div><div class="body"><h3>Gradient backgrounds</h3><div class="meta">Animated Canva templates 02 to 05 &middot; Square and Portrait</div><div class="desc">The four website section colors behind the same text animation: grey to navy, teal, magenta, and green. All four come in one Canva file; keep the page you need.</div><div class="btns"><a class="btn primary" href="https://canva.link/faibjulz5u3rop1" target="_blank" rel="noopener">Open in Canva: Square</a><a class="btn" href="https://canva.link/7pooqvi22t905u9" target="_blank" rel="noopener">Portrait</a></div><div class="dl"><b>MP4, square:</b> <a href="social/canva/ff.io-canva-02-grey-to-navy-square.mp4" download>02</a> &middot; <a href="social/canva/ff.io-canva-03-teal-square.mp4" download>03</a> &middot; <a href="social/canva/ff.io-canva-04-magenta-square.mp4" download>04</a> &middot; <a href="social/canva/ff.io-canva-05-green-square.mp4" download>05</a></div></div></div>
<div class="card"><div class="well thumbs five">{video('06','panel-loop-grey-to-navy')}{video('07','panel-loop-teal')}{video('08','panel-loop-magenta')}{video('09','firefly-panel-straight')}{video('10','firefly-panel-curved')}</div><div class="body"><h3>Panel loops</h3><div class="meta">Animated Canva templates 06 to 10 &middot; Square</div><div class="desc">A looping video panel beside the text: three gradient loops and two firefly loops.</div><!--CANVA-06-10--><div class="dl"><b>MP4, square:</b> <a href="social/canva/ff.io-canva-06-panel-loop-grey-to-navy-square.mp4" download>06</a> &middot; <a href="social/canva/ff.io-canva-07-panel-loop-teal-square.mp4" download>07</a> &middot; <a href="social/canva/ff.io-canva-08-panel-loop-magenta-square.mp4" download>08</a> &middot; <a href="social/canva/ff.io-canva-09-firefly-panel-straight-square.mp4" download>09</a> &middot; <a href="social/canva/ff.io-canva-10-firefly-panel-curved-square.mp4" download>10</a></div></div></div>
</div><p class="note"><b>How &ldquo;Open in Canva&rdquo; works:</b> you get your own copy in a free Canva account (sign-in required), and the original stays as it is. For the full type weights, install League Spartan and Source Sans 3 from <a href="fonts/ff-fonts.zip">the brand fonts</a> or <a href="https://fonts.google.com/specimen/League+Spartan" target="_blank" rel="noopener">Google Fonts</a>.</p></section>""")
    page = [HEAD.format(title=SITE, css=CSS, root=''),
            f'<header class="hero" style="padding-top:60px"><div class="wrap"><div class="eyebrow">Brand assets &amp; guidelines</div><div class="hero-row" style="margin-top:12px"><h1>F1R3FLY Brand Portal</h1><div class="last-update">Last update: {UPDATE}</div></div></div></header><div class="wrap"><hr class="grad-rule"></div>',
            f'<div class="wrap" style="padding-top:30px"><div class="layout">{nav}<main>{"".join(main)}</main></div></div>',
            FOOT.format(root='', repo=REPO),
            """<script>document.querySelectorAll('.well.thumbs video').forEach(function(v){var p=function(){try{v.play()}catch(e){}};v.addEventListener('mouseenter',p);v.addEventListener('mouseleave',function(){v.pause()});v.addEventListener('click',function(){v.paused?p():v.pause()})});</script></body></html>"""]
    return '\n'.join(page)

# ---------------------------------------------------------------- readme + skill
def readme(rename_map):
    b = M['brands']
    rows = '\n'.join(f'| **[{html.escape(br["title"])} →]({br["folder"]}/)** | `{br["folder"]}/` | {sum(len(s["assets"]) for s in br["sections"])} variants |' for br in b.values())
    return f"""# F1R3FLY Brand Portal

Live site: **{LIVE}**

Everything for the F1R3FLY brands in one place: the brand books, every logo variant with a preview and a download in PDF, JPG, SVG, PNG or all four zipped, the color system, fonts, the layout grid, social templates, and the AI brand kit.

Last update: {UPDATE}. Reorganised 2026-11-06: new folder layout, new file names, one preview page per brand.

## Where things are

| Brand | Folder | What |
|---|---|---|
{rows}

- `books/` the two brand books (PDF) and their cover images
- `system/` color system PDF, swatch pack, layout grid
- `fonts/` League Spartan and Source Sans 3 (SIL OFL), plus `ff-fonts.zip`
- `social/templates/` sixteen 1080 x 1080 post templates, [preview page](social/templates/)
- `social/canva/` MP4 previews and thumbnails of the animated Canva templates (links on the home page)
- `kit/` the AI brand kit skill (`f1r3fly-brand-kit.skill`) and its spec (`SKILL.md`)
- `build/` the manifest and the script that generates the pages and files
- `_archive/` retired files, including F1R3Gaze (the browser was renamed; its marks are no longer in use)

## File names

```
[brand]-[piece]-[layout]-[colorway]-[background].[ext]
```

- brand: `ff.io` (F1R3FLY.IO), `ff.indust` (F1R3FLY Industries), `flang` (f1r3lang), `ign` (ign1t10n)
- piece: `logo` (mark + wordmark), `icon` (mark alone), `avatar`, `post`, `canva`
- layout: `wide`, `stacked`, `circle` (the mark inside a black circle), `ring`, `square`
- colorway: `color`, `white`, `black`
- background: `transp-dark` (transparent, made for dark backgrounds, white wordmark), `transp-light` (transparent, for light backgrounds, black wordmark), `transp` (icons, no wordmark), `onblack`, `onwhite` (background baked in)

Example: `ff.io-logo-stacked-circle-color-transp-dark.png` is the F1R3FLY.IO bug in a black circle with the wordmark below, in color, transparent, for dark backgrounds.

Every asset ships as `.pdf`, `.jpg`, `.svg`, `.png` and a `.zip` of all four. SVGs use plain presentation attributes (no CSS classes), so they open cleanly in design apps. PNGs are 2048 px on the long side, transparent. JPGs are flattened on #0A0A0A (dark) or white (light).

Raw file base for scripts and AI tools: `{RAW}`

## Old name → new name

{chr(10).join(f'- `{o}` → `{n}`' for o, n in rename_map)}

## Maintaining it

Edit `build/assets.json`, drop new source SVG/PDF files beside the old ones (or under `build/NEW/`), run `python3 build/build.py <this repo> <output>`, and copy the output in. The manifest is the single list of what exists; the pages are generated from it.

Source repo: [{REPO}]({REPO}). The org fork `F1R3FLY-io/f1r3fly-brand-portal` mirrors this repo; this one is upstream.
"""

def update_skill(text):
    b = M['brands']
    text = text.replace('version: "1.3"', 'version: "1.4"').replace('updated: "2026-10-09"', 'updated: "2026-11-06"')
    text = text.replace('https://github.com/hannahadamsdesign-spec/f1r3fly-brand-portal/tree/main/F1R3FLY-Industries-Brand-Assets', LIVE + 'logos/ff.indust/')
    text = text.replace('https://github.com/hannahadamsdesign-spec/f1r3fly-brand-portal/tree/main/F1R3FLY-IO-Brand-Assets', LIVE + 'logos/ff.io/')
    text = text.replace('https://github.com/hannahadamsdesign-spec/f1r3fly-brand-portal/blob/main/F1R3FLY%20INDUSTRIES-Brand%20Style%20Guide.pdf', RAW + 'books/ff.indust-brand-style-guide-2026-09.pdf')
    text = text.replace('https://github.com/hannahadamsdesign-spec/f1r3fly-brand-portal/blob/main/F1R3FLY.IO-Brand%20Guidebook.pdf', RAW + 'books/ff.io-brand-guidebook-2026-09.pdf')
    tree = """```
f1r3fly-brand-portal/
├── logos/ff.indust/   # F1R3FLY Industries, the trefoil knot (parent brand)
├── logos/ff.io/       # F1R3FLY.IO, the firefly bug (developer platform)
├── logos/flang/       # f1r3lang wordmark
├── products/ign/      # ign1t10n, the installer
├── books/             # the two brand books (PDF)
├── system/            # color system PDF, swatches, layout grid
├── fonts/             # League Spartan x4, Source Sans 3 x3 (SIL OFL)
└── social/            # post templates, Canva previews
```

File names follow `[brand]-[piece]-[layout]-[colorway]-[background].{svg|png|pdf|jpg}`:
brand `ff.io` | `ff.indust` | `flang` | `ign`; piece `logo` (mark + wordmark) | `icon` (mark alone) | `avatar`;
layout `wide` | `stacked` | `circle` (mark in a black circle); colorway `color` | `white` | `black`;
background `transp-dark` (transparent, white wordmark, for dark backgrounds) | `transp-light` (transparent, black wordmark, for light) | `transp` (icons) | `onblack` | `onwhite` (baked in).
Every asset exists in all four formats plus a `.zip`. Each brand folder has an `index.html` preview page listing every variant.

Full inventory (file base names, add `.svg`, `.png`, `.pdf` or `.jpg`):
"""
    for br in b.values():
        tree += f'\n{br["folder"]}/\n' + '\n'.join(f'  {a["new"]}  ({a["name"]})' for s in br['sections'] for a in s['assets']) + '\n'
    tree = tree.rstrip() + '\n```'
    text = re.sub(r'```\nf1r3fly-brand-portal/\n.*?```', tree, text, count=1, flags=re.S)
    text = text.replace('`https://raw.githubusercontent.com/hannahadamsdesign-spec/f1r3fly-brand-portal/main/F1R3FLY-Industries-Brand-Assets/f1r3fly-industries-vertical-logo-color-on-dark.png`',
                        '`' + RAW + 'logos/ff.indust/ff.indust-logo-stacked-color-transp-dark.png`')
    text = text.replace("Files are in the portal's `F1r3lang-Brand-Assets/` folder: `f1r3lang-logo-{var", "Files are in the portal's `logos/flang/` folder: `flang-logo-{var")
    text = text.replace('| Kit version | 1.3 (October 9, 2026) — grid rules in place of the grid file, body weight 400, current brand books, f1r3lang, app and menu-bar icons |',
                        '| Kit version | 1.4 (November 6, 2026) — portal reorganised: new folders (`logos/<brand>/`), new file names (`ff.io-logo-wide-color-transp-dark`), preview page per brand, JPG added. 1.3 (October 9, 2026) — grid rules in place of the grid file, body weight 400, current brand books, f1r3lang, app and menu-bar icons |')
    return text

# ---------------------------------------------------------------- main
def main():
    ensure(OUT); dims = {}; rename_map = []
    for key, br in M['brands'].items():
        dest = ensure(os.path.join(OUT, br['folder']))
        for s in br['sections']:
            for a in s['assets']:
                dims[a['new']] = brand_asset(br, a, dest); rename_map.append((a['old'] or '(new)', a['new']))
        open(os.path.join(dest, 'index.html'), 'w', encoding='utf-8').write(brand_page(br, dims)); print('brand', key)
    rename_map += build_posts(ensure(os.path.join(OUT, 'social/templates'))); print('posts')
    rename_map += build_canva(ensure(os.path.join(OUT, 'social/canva'))); print('canva')
    # books
    cp(os.path.join(OLD, 'F1R3FLY INDUSTRIES-Brand Style Guide.pdf'), os.path.join(OUT, 'books/ff.indust-brand-style-guide-2026-09.pdf'))
    cp(os.path.join(OLD, 'F1R3FLY.IO-Brand Guidebook.pdf'), os.path.join(OUT, 'books/ff.io-brand-guidebook-2026-09.pdf'))
    cp(os.path.join(OLD, 'book-covers/industries-style-guide-cover.png'), os.path.join(OUT, 'books/ff.indust-brand-style-guide-cover.png'))
    cp(os.path.join(OLD, 'book-covers/io-guidebook-cover.png'), os.path.join(OUT, 'books/ff.io-brand-guidebook-cover.png'))
    rename_map += [('F1R3FLY INDUSTRIES-Brand Style Guide.pdf', 'books/ff.indust-brand-style-guide-2026-09.pdf'), ('F1R3FLY.IO-Brand Guidebook.pdf', 'books/ff.io-brand-guidebook-2026-09.pdf')]
    # system
    cp(os.path.join(OLD, 'F1R3FLY-Industries-Brand-Assets/f1r3fly-brand-color-system-06.12.2026.pdf'), os.path.join(OUT, 'system/ff-color-system-2026-06.pdf'))
    cp(os.path.join(OLD, 'swatches/f1r3fly-brand-swatches.zip'), os.path.join(OUT, 'system/ff-swatches.zip'))
    for ext in ('svg', 'pdf', 'png'): cp(os.path.join(OLD, f'templates/f1r3fly-brand-grid.{ext}'), os.path.join(OUT, f'system/ff-grid.{ext}'))
    cp(os.path.join(OLD, 'templates/f1r3fly-brand-grid-preview.png'), os.path.join(OUT, 'system/ff-grid-preview.png'))
    with zipfile.ZipFile(os.path.join(OUT, 'system/ff-grid.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for ext in ('svg', 'pdf', 'png'): z.write(os.path.join(OUT, f'system/ff-grid.{ext}'), f'ff-grid.{ext}')
    rename_map += [('f1r3fly-brand-color-system-06.12.2026.pdf', 'system/ff-color-system-2026-06.pdf'), ('swatches/f1r3fly-brand-swatches.zip', 'system/ff-swatches.zip'), ('templates/f1r3fly-brand-grid.*', 'system/ff-grid.*')]
    # fonts
    fdest = ensure(os.path.join(OUT, 'fonts'))
    for f in os.listdir(os.path.join(OLD, 'f1r3fly-brand-fonts')): cp(os.path.join(OLD, 'f1r3fly-brand-fonts', f), os.path.join(fdest, f))
    with zipfile.ZipFile(os.path.join(fdest, 'ff-fonts.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(os.listdir(fdest)):
            if f != 'ff-fonts.zip': z.write(os.path.join(fdest, f), f)
    # kit
    kdest = ensure(os.path.join(OUT, 'kit'))
    skill = update_skill(open(os.path.join(OLD, 'f1r3fly-brand-kit/SKILL.md'), encoding='utf-8').read())
    open(os.path.join(kdest, 'SKILL.md'), 'w', encoding='utf-8').write(skill)
    with zipfile.ZipFile(os.path.join(kdest, 'f1r3fly-brand-kit.skill'), 'w', zipfile.ZIP_DEFLATED) as z: z.writestr('f1r3fly-brand-kit/SKILL.md', skill)
    # review files, archive
    shutil.copytree(os.path.join(OLD, 'review-files'), os.path.join(OUT, 'review-files'), dirs_exist_ok=True)
    shutil.copytree(os.path.join(OLD, '_archive'), os.path.join(OUT, '_archive'), dirs_exist_ok=True)
    shutil.copytree(os.path.join(OLD, 'F1R3Gaze-Brand-Assets'), os.path.join(OUT, '_archive/F1R3Gaze-Brand-Assets'), dirs_exist_ok=True)
    shutil.copytree(os.path.join(OLD, 'templates/social-media-templates'), os.path.join(OUT, '_archive/social-media-templates-2026-10'), dirs_exist_ok=True)
    cp(os.path.join(OLD, 'F1R3FLY-Industries-Brand-Assets/f1r3fly-brand-color-system-06.10.2026.pdf'), os.path.join(OUT, '_archive/f1r3fly-brand-color-system-06.10.2026.pdf'))
    cp(os.path.join(OLD, 'F1R3FLY-Industries-Brand-Assets/f1r3fly-brand-color-system-06.10.2026.svg'), os.path.join(OUT, '_archive/f1r3fly-brand-color-system-06.10.2026.svg'))
    # build tools
    bdest = ensure(os.path.join(OUT, 'build'))
    for f in ('assets.json', 'build.py', 'svg_flatten.py'): cp(os.path.join(HERE, f), os.path.join(bdest, f))
    shutil.copytree(os.path.join(HERE, 'NEW'), os.path.join(bdest, 'NEW'), dirs_exist_ok=True)
    # pages
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(home(dims))
    open(os.path.join(OUT, 'README.md'), 'w', encoding='utf-8').write(readme(rename_map))
    open(os.path.join(OUT, '.nojekyll'), 'w').write('')
    print('done', OUT)

if __name__ == '__main__': main()

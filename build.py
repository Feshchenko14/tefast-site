"""Збирає assets/style.css і внутрішні сторінки з partials/:  python3 build.py

base.css + pages.css + model.css -> масштабуються (компактніше для ноутбуків 13")
motion.css + scale.css           -> додаються як є
"""
import re, pathlib
R = pathlib.Path(__file__).parent
P = R / 'partials'
rd = lambda n: (P / n).read_text()

SCALE = 0.85          # геометрія: відступи, висоти, радіуси
VW = 0.82             # vw у clamp()

def font_px(v):       # 14 лишається, більше — стискається м'якше
    return v if v <= 14 else round(14 + (v - 14) * 0.78, 1)

def fmt(n):
    n = round(n, 1)
    return str(int(n)) if n == int(n) else str(n)

GEOM = re.compile(r'^(padding|margin|gap|row-gap|column-gap|width|height|min-width|min-height|max-width|max-height|top|right|bottom|left|inset|border-radius|grid-template-columns|grid-template-rows|flex-basis)(-[a-z]+)?$')

def scale_value(prop, val):
    isfont = prop in ('font-size', 'font')
    if prop == 'font':   # лише розмір, що стоїть перед var()/слешем
        return re.sub(r'(?<![\d.])(\d+(?:\.\d+)?)px', lambda m: fmt(font_px(float(m[1]))) + 'px', val, count=1)
    if prop == 'font-size':
        val = re.sub(r'(\d+(?:\.\d+)?)vw', lambda m: fmt(float(m[1]) * VW) + 'vw', val)
        return re.sub(r'(\d+(?:\.\d+)?)px', lambda m: fmt(font_px(float(m[1]))) + 'px', val)
    if GEOM.match(prop):
        return re.sub(r'(-?\d+(?:\.\d+)?)px', lambda m: m[0] if abs(float(m[1])) < 6 else fmt(float(m[1]) * SCALE) + 'px', val)
    return val

def scale_css(css):
    def decl(m):
        pre, prop, val = m.group(1), m.group(2), m.group(3)
        if prop.startswith('--') and prop not in ('--r', '--r-s'):
            return m.group(0)
        return f'{pre}{prop}:{scale_value(prop, val)}'
    return re.sub(r'([{;]\s*)([a-z-]+)\s*:\s*([^;{}]+)', decl, css)

def tokenise_transitions(css):
    def newms(sec):
        v = round(sec * 1000)
        return v if v <= 160 else round(v * .85)
    def one(m):
        parts, depth, cur = [], 0, ''
        for ch in m[2]:
            if ch == '(': depth += 1
            if ch == ')': depth -= 1
            if ch == ',' and depth == 0: parts.append(cur); cur = ''
            else: cur += ch
        parts.append(cur)
        out = []
        for p in parts:
            p = re.sub(r'(?<![\w.])(\d*\.\d+|\d+)s\b', lambda mm: f'{newms(float(mm[1]))}ms', p)
            if 'cubic-bezier' not in p and 'var(--ease' not in p and 'linear' not in p:
                p = p.rstrip() + ' var(--ease)'
            out.append(p.strip())
        return f'{m[1]}transition:' + ','.join(out)
    return re.sub(r'([{;]\s*)transition\s*:\s*([^;{}]+)', one, css)

base = scale_css(tokenise_transitions(rd('base.css')))
pages = scale_css(tokenise_transitions(rd('pages.css')))
model = scale_css(tokenise_transitions(rd('model.css')))
css = '\n'.join([base, pages, model, rd('motion.css'), rd('scale.css')])
(R / 'assets/style.css').write_text(css)
print('style.css', len(css))

sprite, header, footer = rd('sprite.html'), rd('header.html'), rd('footer.html')
HEAD = '''<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t} — TEFAST</title>
<meta name="description" content="TEFAST: запчастини та аксесуари для Tesla. Підбір за VIN, відправка в день замовлення.">
<meta name="theme-color" content="#FFDE01">
<link rel="icon" href="logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>'''
for name in ('catalog', 'product', 'cart', 'model'):
    s = rd(name + '.src')
    s = re.sub(r'\{\{HEAD:(.*?)\}\}', lambda m: HEAD.format(t=m[1]), s)
    s = s.replace('{{SPRITE}}', sprite).replace('{{HEADER}}', header).replace('{{FOOTER}}', footer)
    s = s.replace('<script src="assets/data.js">', '<script src="assets/tree.js"></script><script src="assets/data.js">') if 'assets/tree.js' not in s else s
    (R / (name + '.html')).write_text(s)
    print('ok', name + '.html')

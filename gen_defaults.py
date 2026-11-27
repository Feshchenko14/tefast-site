import re, json, pathlib, html
R = pathlib.Path(__file__).parent
s = (R / 'index.html').read_text()

def un(t): return html.unescape(re.sub(r'<[^>]+>', '', t)).strip()

# слайди
slides = []
for m in re.finditer(r'<div class="slide[^"]*"[^>]*>(.*?)\n  </div>\n(?=  <div class="slide|  <div class="ctl")', s, re.S):
    b = m[1]
    pill = un(re.search(r'<span class="pill"><b></b>(.*?)</span>', b)[1])
    h1 = re.sub(r'<mark>(.*?)</mark>', r'[[\1]]', re.search(r'<h1>(.*?)</h1>', b)[1])
    p = un(re.search(r'<p>(.*?)</p>', b)[1])
    acts = re.search(r'<div class="acts">(.*?)</div></div>', b, re.S)[1]
    links = re.findall(r'<a class="btn[^"]*"[^>]*href="([^"]*)"[^>]*>(.*?)</a>', acts, re.S)
    img = re.search(r'<img src="([^"]*)" alt="([^"]*)"', b)
    chip = re.search(r'<use href="#(\w+)"/></svg></span><span><b>(.*?)</b><small>(.*?)</small>', b)
    slides.append(dict(pill=pill, title=h1, text=p,
        b1=un(links[0][1]) if links else '', l1=links[0][0] if links else '',
        b2=un(links[1][1]) if len(links) > 1 else '', l2=links[1][0] if len(links) > 1 else '',
        img=img[1], alt=img[2], chipIcon=chip[1], chipB=un(chip[2]), chipS=un(chip[3]), on=True))
for i, x in enumerate(slides): x['id'] = 'b%d' % (i + 1)

posts = []
for m in re.finditer(r'<article class="post">(.*?)</article>', s, re.S):
    b = m[1]
    posts.append(dict(img=re.search(r'<img src="([^"]*)"', b)[1], tag=un(re.search(r'<span class="pt">(.*?)</span>', b)[1]),
        date=un(re.search(r'<time>(.*?)</time>', b)[1]), title=un(re.search(r'<h3><a[^>]*>(.*?)</a></h3>', b)[1]),
        text=un(re.search(r'<p>(.*?)</p>', b)[1]), status='published'))
for i, x in enumerate(posts): x['id'] = 'n%d' % (i + 1)

revs = []
for m in re.finditer(r'<article class="rev[^"]*"><p>(.*?)</p><div class="who"><span class="av">(.*?)</span><div><b>(.*?)</b><small>(.*?)</small>', s, re.S):
    revs.append(dict(text=un(m[1]), name=un(m[3]), meta=un(m[4]), rating=5, status='published'))
for i, x in enumerate(revs): x['id'] = 'r%d' % (i + 1)

faq = []
for m in re.finditer(r'<details[^>]*><summary>(.*?)<svg.*?</summary><p>(.*?)</p></details>', s, re.S):
    faq.append(dict(q=un(m[1]), a=un(m[2]), on=True))
for i, x in enumerate(faq): x['id'] = 'f%d' % (i + 1)

out = '/* Автогенерація gen_defaults.py: стартовий вміст сайту (із index.html). Правиться в адмін-панелі. */\nwindow.DEF=' + json.dumps(
    dict(banners=slides, posts=posts, reviews=revs, faq=faq), ensure_ascii=False, indent=1) + ';\n'
(R / 'assets/defaults.js').write_text(out)
print(len(slides), len(posts), len(revs), len(faq))

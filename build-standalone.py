"""Build the portable edition from the same sources served by GitHub Pages."""
import base64
import json
import re
from pathlib import Path

assets = {p.name: 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode() for p in Path('assets').glob('*.jp*g')}
def inline(text):
    return re.sub(r'assets/([\w-]+\.jpe?g)', lambda m: assets[m[1]], text)
html = inline(Path('index.html').read_text()).replace('<link rel="stylesheet" href="style.css">', '<style>'+inline(Path('style.css').read_text())+'</style>')
for name in ['icons', 'app', 'studio']:
    js = Path(name+'.js').read_text()
    if name == 'app':
        js = 'const photos='+json.dumps(assets)+';\n'+re.sub(r'assets/\$\{([^}]+)\}\.jpg', r"${photos[\1+'.jpg']}", js)
    html = html.replace(f'<script src="{name}.js"></script>', '<script>'+js+'</script>')
Path('New-Hair.html').write_text(html)

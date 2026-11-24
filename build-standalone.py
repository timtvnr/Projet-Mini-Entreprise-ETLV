"""Build the portable edition with the same images, font and scripts as Pages."""
import base64, json, re
from pathlib import Path

def uri(path, mime):
    return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
assets={p.name:uri(p,'image/webp') for p in Path('assets').glob('*.webp')}
assets['source-sans.woff2']=uri(Path('assets/source-sans.woff2'),'font/woff2')
def inline(text):
    return re.sub(r'(?<!/)assets/([\w-]+\.(?:webp|woff2))',lambda m:assets[m[1]],text)
source=re.sub(r'(style\.css|app\.js|motion\.js)\?v=[\w-]+', r'\1', Path('index.html').read_text())
html=inline(source).replace('<link rel="stylesheet" href="style.css">','<style>'+inline(Path('style.css').read_text())+'</style>')
for name in ['icons','app','studio','motion']:
    js=Path(name+'.js').read_text()
    if name=='app':
        js='const photos='+json.dumps({k:v for k,v in assets.items() if k.endswith('.webp')})+';\n'+re.sub(r'assets/\$\{([^}]+)\}\.webp',r"${photos[\1+'.webp']}",js)
    html=html.replace(f'<script src="{name}.js"></script>','<script>'+js+'</script>')
Path('New-Hair.html').write_text(html)

"""Convert Illustrator CSS-class SVG styling to presentation attributes (OmniGraffle-friendly)."""
import re, sys
def clean(svg):
    """Drop Illustrator DOCTYPE/entity blocks, Adobe namespaces, metadata and switch/foreignObject wrappers."""
    m = re.search(r'<!DOCTYPE[^\[>]*(\[.*?\])?\s*>', svg, re.S)
    if m:
        for name, val in re.findall(r'<!ENTITY\s+(\S+)\s+"([^"]*)">', m.group(0)): svg = svg.replace(f'&{name};', val)
        svg = svg[:m.start()] + svg[m.end():]
    svg = re.sub(r'\s+xmlns:(x|i|graph|sfw|imrep|vars|custom|a)="[^"]*"', '', svg)
    svg = re.sub(r'<metadata>.*?</metadata>', '', svg, flags=re.S)
    svg = re.sub(r'<(x|i|graph|sfw):[^>]*>.*?</(x|i|graph|sfw):[^>]*>', '', svg, flags=re.S)
    svg = re.sub(r'<(x|i|graph|sfw):[^>]*/>', '', svg)
    svg = re.sub(r'\s+(i|a):[\w-]+="[^"]*"', '', svg)
    svg = re.sub(r'<switch>\s*<foreignObject[^>]*>.*?</foreignObject>\s*<g\s+i:extraneous="self">(.*?)</g>\s*</switch>', r'\1', svg, flags=re.S)
    return svg

def flatten(svg):
    svg = clean(svg)
    m = re.search(r'<style[^>]*>(.*?)</style>', svg, re.S)
    rules = {}
    if m:
        for cls, body in re.findall(r'\.([\w-]+)\s*\{([^}]*)\}', m.group(1)):
            rules[cls] = dict(kv.split(':',1) for kv in [x.strip() for x in body.split(';') if x.strip()])
        svg = svg[:m.start()] + svg[m.end():]
    def repl_class(mm):
        attrs = ''
        for c in mm.group(1).split():
            for k,v in rules.get(c, {}).items(): attrs += f' {k.strip()}="{v.strip()}"'
        return attrs
    svg = re.sub(r'\s+class="([^"]+)"', repl_class, svg)
    def repl_style(mm):
        return ''.join(f' {k.strip()}="{v.strip()}"' for k,v in (kv.split(':',1) for kv in mm.group(1).split(';') if ':' in kv))
    svg = re.sub(r'\s+style="([^"]+)"', repl_style, svg)
    svg = re.sub(r'\s+enable-background="[^"]*"', '', svg)
    return svg
if __name__ == '__main__':
    src, dst = sys.argv[1:3]
    s = open(src, encoding='utf-8').read()
    open(dst, 'w', encoding='utf-8').write(flatten(s))

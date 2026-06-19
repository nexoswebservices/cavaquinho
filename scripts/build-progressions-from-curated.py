#!/usr/bin/env python3
"""Build progressions.json from curated song data (manually verified chords)."""

import json
import re

NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
ENARM = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B','Fb':'E'}
MAJOR = [0,2,4,5,7,9,11]
NAT_MINOR = [0,2,3,5,7,8,10]
MAJ_Q = ['M','m','m','M','d7','m','dim']
MIN_Q = ['m','dim','M','m','d7','M','dim']
ROMAN = ['I','II','III','IV','V','VI','VII']

FLAT_MAP = {'A#':'Bb','D#':'Eb','G#':'Ab','C#':'Db','F#':'Gb'}

def norm(n): return ENARM.get(n, n)
def note_idx(n):
    nn = norm(n)
    return NOTES.index(nn) if nn in NOTES else -1

def display_note(n, key_root):
    flat_keys = {'F','A#','D#','G#','C#','F#'}
    if key_root in flat_keys and n in FLAT_MAP:
        return FLAT_MAP[n]
    return n

CHORD_RE = re.compile(r'^([A-G][#b]?)(.*?)$')

def parse_chord_name(token):
    token = token.strip().split('/')[0] if '/' in token and not token.startswith('(') else token.strip()
    # Remove bass note for root detection
    main = re.sub(r'/[A-G][#b]?\d*$', '', token.strip())
    m = CHORD_RE.match(main)
    if not m: return None
    root = norm(m.group(1))
    if note_idx(root) == -1: return None
    suf = re.sub(r'\([^)]*\)', '', m.group(2))
    if re.search(r'dim|[ºø]', suf): quality = 'dim'
    elif re.match(r'^m(?!aj)|^min', suf): quality = 'm'
    elif re.search(r'aug|\+$', suf): quality = 'aug'
    elif re.search(r'sus', suf): quality = 'sus'
    elif re.search(r'^7(?![M+])|^[6-9](?!\+)|^1[13]', suf): quality = 'd7'
    else: quality = 'M'
    return (root, quality, token.strip())

def get_degree(chord_tuple, key_root, is_minor=False):
    intervals = NAT_MINOR if is_minor else MAJOR
    dQ = MIN_Q if is_minor else MAJ_Q
    r = note_idx(key_root)
    scale = [NOTES[(r+i)%12] for i in intervals]
    root, quality = chord_tuple[0], chord_tuple[1]

    if root in scale:
        idx = scale.index(root)
        # Check secondary dominant
        if quality in ('d7','M') and dQ[idx] in ('m','dim'):
            for j, s in enumerate(scale):
                fifth = NOTES[(note_idx(s)+7)%12]
                if root == fifth:
                    target = ROMAN[j].lower() if dQ[j] in ('m','dim') else ROMAN[j]
                    return f'V7/{target}'
        roman = ROMAN[idx]
        if quality in ('m','dim'): roman = roman.lower()
        if quality == 'dim': roman += 'º'
        if quality == 'd7': roman += '7'
        return roman
    # Non-diatonic: check secondary dominants
    for j, s in enumerate(scale):
        fifth = NOTES[(note_idx(s)+7)%12]
        if root == fifth and quality in ('d7','M'):
            target = ROMAN[j].lower() if dQ[j] in ('m','dim') else ROMAN[j]
            return f'V7/{target}'
    # Chromatic
    ci = note_idx(root)
    for j, s in enumerate(scale):
        si = note_idx(s)
        if (ci+1)%12 == si: return f'♭{ROMAN[j]}'
        if (ci-1+12)%12 == si: return f'#{ROMAN[j]}'
    return '?'

def parse_chord_sequence(text):
    """Parse a chord sequence like 'Gm | Dm | Eb7+ | Cm | D7' into chord tuples."""
    # Remove repeat markers, section labels
    cleaned = re.sub(r':\|\||\|\|:|:\||\|\|', '', text)
    cleaned = re.sub(r'\d+ \d+ \d+ \d+ \d+', '', cleaned)  # tab numbers
    tokens = re.split(r'[|\-]+', cleaned)
    chords = []
    for t in tokens:
        t = t.strip()
        if not t: continue
        # May have multiple chords in one segment (e.g. "Am7 Bm7")
        for sub in t.split():
            sub = sub.strip()
            if not sub: continue
            c = parse_chord_name(sub)
            if c: chords.append(c)
    return chords

def build_acordes_graus(chords, key_root, is_minor):
    """Build unique acorde+grau pairs."""
    result = []
    seen = set()
    for c in chords:
        if c[2] not in seen:
            seen.add(c[2])
            deg = get_degree(c, key_root, is_minor)
            result.append({'acorde': c[2], 'grau': deg})
    return result

# Load curated data
with open(r'C:\Users\renat\Downloads\Hamonico\prisma\data\progressoes-curadas.json', 'r', encoding='utf-8') as f:
    curated = json.load(f)

# Analyze each song
analyzed_songs = []
for song in curated:
    tom = song['tom']
    is_minor = tom.endswith('m') and len(tom) <= 3
    key_root = norm(tom.replace('m','')) if is_minor else norm(tom)

    all_chords = []
    secoes_analyzed = []

    for secao in song['secoes']:
        chords = parse_chord_sequence(secao['acordes'])
        all_chords.extend(chords)
        ag = build_acordes_graus(chords, key_root, is_minor)
        secoes_analyzed.append({
            'nome': secao['nome'],
            'acordes_str': secao['acordes'],
            'acordes_graus': ag,
        })

    # Build full song acordes_graus
    full_ag = build_acordes_graus(all_chords, key_root, is_minor)
    full_degrees = [ag['grau'] for ag in full_ag]
    todos_acordes = ' '.join(list(dict.fromkeys(c[2] for c in all_chords)))

    analyzed_songs.append({
        'titulo': song['titulo'],
        'artista': song['artista'],
        'tom': song['tom'],
        'secoes': secoes_analyzed,
        'acordes_graus': full_ag,
        'graus_completos': full_degrees,
        'todos_acordes': todos_acordes,
    })

# Group by progression patterns
def has_pattern(degrees, pattern):
    for p in pattern:
        if p not in degrees: return False
    return True

PROGRESSIONS = [
    {
        'slug': 'ii-V7-I',
        'nome': 'ii – V7 – I',
        'graus': ['ii', 'V7', 'I'],
        'tipo': 'Jazz/Samba',
        'descricao': 'O turnaround mais importante do samba e do jazz. O ii (supertônica) prepara o V7 (dominante), que resolve no I (tônica). Movimento de quartas ascendentes que cria momentum harmônico irresistível.',
        'pattern': ['ii', 'V7', 'I'],
    },
    {
        'slug': 'I-IV-V7',
        'nome': 'I – IV – V7',
        'graus': ['I', 'IV', 'V7'],
        'tipo': 'Básica',
        'descricao': 'A progressão mais fundamental da música popular. Tônica → subdominante → dominante. Base de centenas de sambas, pagodes e músicas folclóricas.',
        'pattern': ['I', 'IV', 'V7'],
    },
    {
        'slug': 'I-vi-IV-V',
        'nome': 'I – vi – IV – V',
        'graus': ['I', 'vi', 'IV', 'V7'],
        'tipo': 'Clássica',
        'descricao': 'A "progressão dos anos 50" — presente em inúmeros clássicos do pagode, doo-wop e pop. O vi (relativo menor) cria uma cor melancólica antes de retornar ao brilho da subdominante.',
        'pattern': ['I', 'vi', 'IV'],
    },
    {
        'slug': 'i-iv-V7',
        'nome': 'i – iv – V7',
        'graus': ['i', 'iv', 'V7'],
        'tipo': 'Menor',
        'descricao': 'A progressão menor básica. Tônica menor → subdominante menor → dominante. Presente no samba-canção, pagode dramático e música de raiz. O V7 com sensível cria forte resolução.',
        'pattern': ['i', 'iv', 'V7'],
    },
    {
        'slug': 'dom-secundarios',
        'nome': 'Dominantes Secundários',
        'graus': ['V7/vi', 'V7/ii', 'V7/IV'],
        'tipo': 'Avançada',
        'descricao': 'Acordes dominantes que preparam graus que não são o I. O mais comum no pagode é o V7/vi (ex: E7→Am em C maior). Cria tensão direcionada e drama harmônico.',
        'pattern_fn': lambda degs: any('V7/' in d for d in degs),
    },
]

results = []
for prog in PROGRESSIONS:
    prog_data = {
        'slug': prog['slug'],
        'nome': prog['nome'],
        'graus': prog['graus'],
        'tipo': prog['tipo'],
        'descricao': prog['descricao'],
        'musicas': [],
    }

    for song in analyzed_songs:
        degs = song['graus_completos']
        match = False
        if 'pattern' in prog:
            match = has_pattern(degs, prog['pattern'])
        elif 'pattern_fn' in prog:
            match = prog['pattern_fn'](degs)

        if match:
            prog_data['musicas'].append({
                'titulo': song['titulo'],
                'artista': song['artista'],
                'tom': song['tom'],
                'key_detected': song['tom'],
                'acordes_reais': [ag['acorde'] for ag in song['acordes_graus'] if ag['grau'] in prog['graus'] or any(ag['grau'].startswith(g) for g in prog['graus'])],
                'todos_acordes': song['todos_acordes'],
                'graus_completos': song['graus_completos'],
                'acordes_graus': song['acordes_graus'],
                'secoes': song['secoes'],
            })

    prog_data['musicas'].sort(key=lambda m: (m['artista'].lower(), m['titulo'].lower()))
    results.append(prog_data)
    print(f"{prog['nome']}: {len(prog_data['musicas'])} músicas")

results.sort(key=lambda p: -len(p['musicas']))

output = r'C:\Users\renat\Downloads\Hamonico\src\lib\progressions-data.json'
with open(output, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nSaved to {output}")
total = sum(len(p['musicas']) for p in results)
print(f"Total: {total} song-progression pairs from {len(curated)} curated songs")

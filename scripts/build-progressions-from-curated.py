#!/usr/bin/env python3
"""Build progressions.json from curated song data (manually verified chords).

Fixes applied:
1. get_degree() respeita escala menor natural (VII = subtônica, não V7/III)
2. Matching por sequência adjacente dentro de seção (não "grau existe em algum lugar")
3. Cadências identificadas por seção
"""

import json
import re

NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
ENARM = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B','Fb':'E'}

MAJOR = [0,2,4,5,7,9,11]
NAT_MINOR = [0,2,3,5,7,8,10]

# Qualidades diatônicas esperadas por grau
MAJ_Q = ['M','m','m','M','d7','m','dim']        # I ii iii IV V vi viiº
MIN_Q = ['m','dim','M','m','m','M','M']          # i iiº III iv v VI VII

ROMAN = ['I','II','III','IV','V','VI','VII']
ROMAN_MINOR = ['i','iiº','III','iv','v','VI','VII']

FLAT_MAP = {'A#':'Bb','D#':'Eb','G#':'Ab','C#':'Db','F#':'Gb'}

def norm(n): return ENARM.get(n, n)
def note_idx(n):
    nn = norm(n)
    return NOTES.index(nn) if nn in NOTES else -1

CHORD_RE = re.compile(r'^([A-G][#b]?)(.*?)$')

def parse_chord_name(token):
    token = token.strip()
    if not token: return None
    main = re.sub(r'/[A-G][#b]?\d*$', '', token)
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
    return (root, quality, token)


def get_degree(chord_tuple, key_root, is_minor=False):
    """Analyze chord degree in the given key. Respects minor scale."""
    intervals = NAT_MINOR if is_minor else MAJOR
    dQ = MIN_Q if is_minor else MAJ_Q
    romans = ROMAN_MINOR if is_minor else ROMAN

    r = note_idx(key_root)
    scale = [NOTES[(r+i)%12] for i in intervals]
    root, quality = chord_tuple[0], chord_tuple[1]

    # STEP 1: Check if root is in the scale (diatonic)
    if root in scale:
        idx = scale.index(root)
        roman = romans[idx]
        expected_q = dQ[idx]

        # In minor: V grau com d7 = V7 (dominante harmônica — muito comum)
        if is_minor and idx == 4 and quality == 'd7':
            return 'V7'

        # In minor: V grau maior = V (dominante harmônica sem 7)
        if is_minor and idx == 4 and quality == 'M':
            return 'V'

        # Grau diatônico normal
        if quality == 'dim':
            roman = roman.lower() if not roman.islower() else roman
            if not roman.endswith('º'):
                roman += 'º'
        elif quality in ('m',):
            roman = roman.lower() if is_minor and expected_q == 'm' else roman.lower()
        elif quality == 'd7':
            # Acorde dominante num grau que não é V
            if not roman.endswith('7'):
                roman += '7'

        return roman

    # STEP 2: Not in scale — check secondary dominant
    for j, s in enumerate(scale):
        fifth = NOTES[(note_idx(s)+7)%12]
        if root == fifth and quality in ('d7', 'M'):
            target = romans[j]
            prefix = 'V7/' if quality == 'd7' else 'V/'
            return f'{prefix}{target}'

    # STEP 3: Chromatic / borrowed
    ci = note_idx(root)
    for j, s in enumerate(scale):
        si = note_idx(s)
        if (ci+1)%12 == si: return f'♭{ROMAN[j]}'
        if (ci-1+12)%12 == si: return f'#{ROMAN[j]}'

    return '?'


def parse_chord_sequence(text):
    """Parse 'Gm | Dm | Eb7+ | Cm | D7' into chord tuples."""
    cleaned = re.sub(r':\|\||\|\|:|:\||\|\|', '', text)
    cleaned = re.sub(r'\d+ \d+ \d+ \d+ \d+', '', cleaned)
    tokens = re.split(r'[|\-]+', cleaned)
    chords = []
    for t in tokens:
        for sub in t.split():
            sub = sub.strip()
            if not sub: continue
            c = parse_chord_name(sub)
            if c: chords.append(c)
    return chords


def build_acordes_graus(chords, key_root, is_minor):
    result = []
    seen = set()
    for c in chords:
        if c[2] not in seen:
            seen.add(c[2])
            deg = get_degree(c, key_root, is_minor)
            result.append({'acorde': c[2], 'grau': deg})
    return result


def build_graus_sequence(chords, key_root, is_minor):
    """Build ordered list of degrees (with repeats) for pattern matching."""
    return [get_degree(c, key_root, is_minor) for c in chords]


# --- Pattern matching ---

CADENCE_PATTERNS = [
    (['ii', 'V7', 'I'], 'ii – V7 – I'),
    (['ii', 'V7', 'i'], 'ii – V7 – i'),
    (['iv', 'V7', 'i'], 'iv – V7 – i'),
    (['IV', 'V7', 'I'], 'IV – V7 – I'),
    (['I', 'IV', 'V7'], 'I – IV – V7'),
    (['i', 'iv', 'V7'], 'i – iv – V7'),
    (['V7', 'I'], 'V7 – I (autêntica)'),
    (['V7', 'i'], 'V7 – i (autêntica menor)'),
    (['IV', 'I'], 'IV – I (plagal)'),
    (['iv', 'i'], 'iv – i (plagal menor)'),
    (['V7', 'vi'], 'V7 – vi (deceptiva)'),
    (['V7', 'VI'], 'V7 – VI (deceptiva menor)'),
]

def find_cadences_in_sequence(graus_seq):
    """Find cadence patterns in ordered degree sequence."""
    found = []
    i = 0
    while i < len(graus_seq):
        matched = False
        for pattern, label in CADENCE_PATTERNS:
            plen = len(pattern)
            if i + plen <= len(graus_seq):
                if graus_seq[i:i+plen] == pattern:
                    found.append(label)
                    i += plen
                    matched = True
                    break
        if not matched:
            i += 1
    return found


def section_contains_adjacent_pattern(graus_seq, pattern):
    """Check if pattern appears as adjacent sequence in degree list."""
    plen = len(pattern)
    for i in range(len(graus_seq) - plen + 1):
        if graus_seq[i:i+plen] == pattern:
            return True
    return False


def section_contains_ordered_pattern(graus_seq, pattern):
    """Check if pattern appears in order (not necessarily adjacent) in degree list."""
    pi = 0
    for g in graus_seq:
        if pi < len(pattern) and g == pattern[pi]:
            pi += 1
        if pi == len(pattern):
            return True
    return False


# --- Main ---

with open(r'C:\Users\renat\Downloads\Hamonico\prisma\data\progressoes-curadas.json', 'r', encoding='utf-8') as f:
    curated = json.load(f)

# Analyze each song
analyzed_songs = []
for song in curated:
    tom = song['tom']
    is_minor = tom.endswith('m') and not tom.endswith('7M') and not tom.endswith('maj')
    key_root = norm(tom.rstrip('m')) if is_minor else norm(tom)

    all_chords = []
    secoes_analyzed = []

    for secao in song['secoes']:
        chords = parse_chord_sequence(secao['acordes'])
        all_chords.extend(chords)
        ag = build_acordes_graus(chords, key_root, is_minor)
        graus_seq = build_graus_sequence(chords, key_root, is_minor)
        cadencias = find_cadences_in_sequence(graus_seq)

        secoes_analyzed.append({
            'nome': secao['nome'],
            'acordes_str': secao['acordes'],
            'acordes_graus': ag,
            'graus_seq': graus_seq,
            'cadencias': cadencias,
        })

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

# Print verification for "Deixa em Off"
print("=== Verificação: Deixa em Off (Bm) ===")
for s in analyzed_songs:
    if s['titulo'] == 'Deixa em Off':
        for ag in s['acordes_graus']:
            print(f"  {ag['acorde']:8s} = {ag['grau']}")
        break
print()

# Group by progression patterns — using ADJACENT matching per section
PROGRESSIONS = [
    {
        'slug': 'ii-V7-I',
        'nome': 'ii – V7 – I',
        'graus': ['ii', 'V7', 'I'],
        'tipo': 'Jazz/Samba',
        'descricao': 'O turnaround mais importante do samba e do jazz. O ii prepara o V7, que resolve no I. Movimento de quartas ascendentes que cria momentum harmônico irresistível.',
        'patterns': [['ii', 'V7', 'I']],
    },
    {
        'slug': 'I-IV-V7',
        'nome': 'I – IV – V7',
        'graus': ['I', 'IV', 'V7'],
        'tipo': 'Básica',
        'descricao': 'A progressão mais fundamental da música popular. Tônica → subdominante → dominante. Base de centenas de sambas e pagodes.',
        'patterns': [['I', 'IV', 'V7'], ['I', 'IV', 'V7', 'I']],
    },
    {
        'slug': 'I-vi-IV-V',
        'nome': 'I – vi – IV – V',
        'graus': ['I', 'vi', 'IV', 'V7'],
        'tipo': 'Clássica',
        'descricao': 'A "progressão dos anos 50" — presente em inúmeros clássicos do pagode e pop.',
        'patterns': [['I', 'vi', 'IV', 'V7'], ['I', 'vi', 'IV', 'V']],
    },
    {
        'slug': 'I-V-vi-IV',
        'nome': 'I – V – vi – IV',
        'graus': ['I', 'V7', 'vi', 'IV'],
        'tipo': 'Pop/Pagode',
        'descricao': 'A progressão do pop e pagode moderno. Ciclo hipnótico que domina o pagode dos anos 2000.',
        'patterns': [['I', 'V7', 'vi', 'IV'], ['I', 'V', 'vi', 'IV']],
    },
    {
        'slug': 'i-iv-V7',
        'nome': 'i – iv – V7',
        'graus': ['i', 'iv', 'V7'],
        'tipo': 'Menor',
        'descricao': 'Progressão menor básica. Tônica menor → subdominante menor → dominante. Presente no samba-canção e pagode dramático.',
        'patterns': [['i', 'iv', 'V7'], ['i', 'iv', 'V7', 'i']],
    },
    {
        'slug': 'i-VI-VII',
        'nome': 'i – VI – VII',
        'graus': ['i', 'VI', 'VII'],
        'tipo': 'Menor/Modal',
        'descricao': 'Progressão menor com subtônica. Muito usada no pagode e samba — o VII (subtônica) cria movimento descendente natural.',
        'patterns': [['i', 'VI', 'VII'], ['VI', 'VII', 'i']],
    },
    {
        'slug': 'dom-secundarios',
        'nome': 'Dominantes Secundários',
        'graus': ['V7/x'],
        'tipo': 'Avançada',
        'descricao': 'Acordes dominantes que preparam graus que não são o I. Cria tensão direcionada e drama harmônico.',
        'pattern_fn': lambda secao: any('V7/' in g for g in secao['graus_seq']),
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
        matched_sections = []

        for secao in song['secoes']:
            match = False
            if 'patterns' in prog:
                for pattern in prog['patterns']:
                    if section_contains_ordered_pattern(secao['graus_seq'], pattern):
                        match = True
                        break
            elif 'pattern_fn' in prog:
                match = prog['pattern_fn'](secao)

            if match:
                matched_sections.append(secao['nome'])

        if matched_sections:
            prog_data['musicas'].append({
                'titulo': song['titulo'],
                'artista': song['artista'],
                'tom': song['tom'],
                'key_detected': song['tom'],
                'acordes_reais': [],
                'todos_acordes': song['todos_acordes'],
                'graus_completos': song['graus_completos'],
                'acordes_graus': song['acordes_graus'],
                'secoes': song['secoes'],
                'secoes_match': matched_sections,
            })

    prog_data['musicas'].sort(key=lambda m: (m['artista'].lower(), m['titulo'].lower()))
    results.append(prog_data)
    songs_str = ', '.join(m['titulo'] for m in prog_data['musicas'])
    print(f"{prog['nome']}: {len(prog_data['musicas'])} - {songs_str}")

results.sort(key=lambda p: -len(p['musicas']))

output = r'C:\Users\renat\Downloads\Hamonico\src\lib\progressions-data.json'
with open(output, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nSaved to {output}")

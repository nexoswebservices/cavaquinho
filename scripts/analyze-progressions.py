#!/usr/bin/env python3
"""Analyze 448 cifras and generate progressions.json grouping songs by harmonic pattern."""

import json
import re

NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
ENARM = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B','Fb':'E'}
MAJOR = [0, 2, 4, 5, 7, 9, 11]
MAJ_Q = ['M', 'm', 'm', 'M', 'd7', 'm', 'dim']
ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

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

CHORD_RE = re.compile(r'^([A-G][#b]?)(.*?)(?:/[A-G][#b]?\d*)?$')
CHORD_TOKEN_RE = re.compile(r'^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\([^)]*\))?(?:/[A-G][#b]?)?\d*[ºø+\-]*$', re.I)

def parse_chord(token):
    token = token.strip()
    if not token: return None
    m = CHORD_RE.match(token)
    if not m: return None
    root = norm(m.group(1))
    if note_idx(root) == -1: return None
    suf = m.group(2)
    suf_clean = re.sub(r'\([^)]*\)', '', suf)
    if re.search(r'dim|[ºø]', suf_clean): quality = 'dim'
    elif re.match(r'^m(?!aj)|^min', suf_clean): quality = 'm'
    elif re.search(r'aug|\+$', suf_clean): quality = 'aug'
    elif re.search(r'sus', suf_clean): quality = 'sus'
    elif re.search(r'^7(?![M+])|^[6-9](?!\+)|^1[13]', suf_clean): quality = 'd7'
    else: quality = 'M'
    return (root, quality, token)

def is_chord_token(t):
    t = t.replace('|','').strip()
    if not t or len(t) > 20: return False
    return bool(CHORD_TOKEN_RE.match(t))

def extract_chords(conteudo):
    chords = []
    for line in conteudo.split('\n'):
        trimmed = line.strip()
        if not trimmed: continue
        tokens = trimmed.replace('|',' ').split()
        tokens = [t for t in tokens if t.strip()]
        if not tokens: continue
        chord_count = sum(1 for t in tokens if is_chord_token(t))
        if chord_count / len(tokens) >= 0.5:
            for t in tokens:
                c = parse_chord(t)
                if c: chords.append(c)
    return chords

def detect_key(chords):
    best_root, best_score = 'C', -999
    for root in NOTES:
        r = note_idx(root)
        scale = [NOTES[(r+i)%12] for i in MAJOR]
        score = 0
        for c in chords:
            if c[0] in scale:
                idx = scale.index(c[0])
                if c[1] == MAJ_Q[idx]: score += 3
                elif (c[1]=='d7' and MAJ_Q[idx]=='M') or (c[1]=='M' and MAJ_Q[idx]=='d7'): score += 1
                else: score += 1
            else: score -= 1
        if score > best_score:
            best_score = score
            best_root = root
    return best_root

def get_degree(chord, key_root):
    r = note_idx(key_root)
    scale = [NOTES[(r+i)%12] for i in MAJOR]
    root, quality = chord[0], chord[1]
    if root in scale:
        idx = scale.index(root)
        # Check secondary dominant
        if quality in ('d7','M') and MAJ_Q[idx] in ('m','dim'):
            for j, s in enumerate(scale):
                fifth = NOTES[(note_idx(s)+7)%12]
                if root == fifth:
                    target = ROMAN[j].lower() if MAJ_Q[j] in ('m','dim') else ROMAN[j]
                    return f'V7/{target}'
        roman = ROMAN[idx]
        if quality in ('m','dim'): roman = roman.lower()
        if quality == 'dim': roman += 'o'
        if quality == 'd7': roman += '7'
        return roman
    # Non-diatonic
    for j, s in enumerate(scale):
        fifth = NOTES[(note_idx(s)+7)%12]
        if root == fifth and quality in ('d7','M'):
            target = ROMAN[j].lower() if MAJ_Q[j] in ('m','dim') else ROMAN[j]
            return f'V7/{target}'
    return '?'

def get_real_chords_for_pattern(graus, key_root):
    """Given degree names and a key, return the real chord names."""
    r = note_idx(key_root)
    scale = [NOTES[(r+i)%12] for i in MAJOR]
    result = []
    degree_map = {'I':0,'ii':1,'iii':2,'IV':3,'V':4,'V7':4,'vi':5,'vii':6}
    for g in graus:
        base = g.replace('7','')
        if base in degree_map:
            idx = degree_map[base]
            note = display_note(scale[idx], key_root)
            suffix = ''
            if MAJ_Q[idx] == 'm': suffix = 'm'
            if '7' in g and MAJ_Q[idx] != 'd7': suffix += '7'
            if MAJ_Q[idx] == 'd7': suffix = '7'
            if MAJ_Q[idx] == 'dim': suffix = 'o'
            result.append(note + suffix)
        else:
            result.append(g)
    return result

def has_subsequence(degrees, pattern):
    """Check if pattern appears as subsequence in degrees (in order, not necessarily adjacent)."""
    pi = 0
    for d in degrees:
        if pi < len(pattern) and d == pattern[pi]:
            pi += 1
        if pi == len(pattern):
            return True
    return False

def has_adjacent(degrees, pattern):
    """Check if pattern appears as adjacent sequence in degrees."""
    plen = len(pattern)
    for i in range(len(degrees) - plen + 1):
        if degrees[i:i+plen] == pattern:
            return True
    return False

# Progression definitions
PROGRESSIONS = [
    {
        'slug': 'ii-V7-I',
        'nome': 'ii – V7 – I',
        'graus': ['ii', 'V7', 'I'],
        'tipo': 'Jazz/Samba',
        'descricao': 'O turnaround mais importante do samba e do jazz. O ii (supertônica) prepara o V7 (dominante), que resolve no I (tônica). Movimento de quartas ascendentes que cria momentum harmônico irresistível.',
        'check': lambda degs: has_subsequence(degs, ['ii', 'V7', 'I']),
    },
    {
        'slug': 'I-IV-V7',
        'nome': 'I – IV – V7',
        'graus': ['I', 'IV', 'V7'],
        'tipo': 'Básica',
        'descricao': 'A progressão mais fundamental da música popular. Tônica → subdominante → dominante. Base de centenas de sambas, pagodes e músicas folclóricas.',
        'check': lambda degs: has_subsequence(degs, ['I', 'IV', 'V7']),
    },
    {
        'slug': 'I-vi-IV-V',
        'nome': 'I – vi – IV – V',
        'graus': ['I', 'vi', 'IV', 'V7'],
        'tipo': 'Clássica',
        'descricao': 'A "progressão dos anos 50" — presente em inúmeros clássicos do pagode, doo-wop e pop. O vi (relativo menor) cria uma cor melancólica antes de retornar ao brilho da subdominante.',
        'check': lambda degs: 'I' in degs and 'vi' in degs and 'IV' in degs and ('V' in degs or 'V7' in degs),
    },
    {
        'slug': 'I-V-vi-IV',
        'nome': 'I – V – vi – IV',
        'graus': ['I', 'V7', 'vi', 'IV'],
        'tipo': 'Pop/Pagode',
        'descricao': 'A progressão mais usada no pop e no pagode moderno. Variação da clássica I-vi-IV-V, com a ordem invertida que cria um ciclo hipnótico. Domina o pagode dos anos 2000.',
        'check': lambda degs: has_subsequence(degs, ['I', 'V7', 'vi', 'IV']) or has_subsequence(degs, ['I', 'V', 'vi', 'IV']),
    },
    {
        'slug': 'dom-secundarios',
        'nome': 'Dominantes Secundários',
        'graus': ['V7/vi', 'V7/ii', 'V7/IV'],
        'tipo': 'Avançada',
        'descricao': 'Acordes dominantes que preparam graus que não são o I. O mais comum no pagode é o V7/vi (ex: E7 → Am em C maior). Cria tensão direcionada e drama harmônico.',
        'check': lambda degs: any('V7/' in d for d in degs),
    },
]

if __name__ == '__main__':
    with open(r'C:\Users\renat\Downloads\Hamonico\prisma\data\cifras.json', 'r', encoding='utf-8') as f:
        cifras = json.load(f)

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

        for c in cifras:
            chords = extract_chords(c['conteudo'])
            if len(chords) < 3:
                continue
            key = detect_key(chords)
            degrees = [get_degree(ch, key) for ch in chords]
            unique_degrees = list(dict.fromkeys(d for d in degrees if d != '?'))

            if prog['check'](unique_degrees):
                acordes_reais = get_real_chords_for_pattern(prog['graus'], key)
                todos_acordes = list(dict.fromkeys(ch[2] for ch in chords))

                # Build acorde+grau pairs (unique chords with their degrees)
                acordes_graus = []
                seen_chords = set()
                for ch in chords:
                    if ch[2] not in seen_chords:
                        seen_chords.add(ch[2])
                        deg = get_degree(ch, key)
                        if deg != '?':
                            acordes_graus.append({'acorde': ch[2], 'grau': deg})

                prog_data['musicas'].append({
                    'titulo': c['titulo'],
                    'artista': c['artista'],
                    'tom': c['tom'] or key,
                    'key_detected': key,
                    'acordes_reais': acordes_reais,
                    'todos_acordes': ' '.join(todos_acordes[:20]),
                    'graus_completos': unique_degrees[:15],
                    'acordes_graus': acordes_graus[:15],
                })

        prog_data['musicas'].sort(key=lambda m: (m['artista'].lower(), m['titulo'].lower()))
        results.append(prog_data)
        print(f"{prog['nome']}: {len(prog_data['musicas'])} musicas")

    results.sort(key=lambda p: -len(p['musicas']))

    output_path = r'C:\Users\renat\Downloads\Hamonico\src\lib\progressions-data.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nSaved to {output_path}")
    print(f"Total progressions: {len(results)}")

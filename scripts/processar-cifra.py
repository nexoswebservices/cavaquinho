#!/usr/bin/env python3
"""Process a .txt cifra file, clean it, and append to progressoes-curadas.json.

Expected .txt format:
---
Titulo da Musica
Artista
Tom: Gm

[Intro]
Gm | Dm | Eb7+ | Cm | D7

[Verso]
Gm | Fm | Bb7

[Refrão]
Cm | D7 | Gm
---

Or simpler (one-line per section):
---
Titulo da Musica
Artista
Tom: Gm
Intro  Gm | Dm | Eb7+ | Cm | D7
Verso  Gm | Fm | Bb7
Refrão Cm | D7 | Gm
---

Or minimal (no sections):
---
Titulo da Musica
Artista
Tom: Gm
Gm | Dm | Eb7+ | Cm | D7
---
"""

import json
import re
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CURATED_PATH = os.path.join(SCRIPT_DIR, '..', 'prisma', 'data', 'progressoes-curadas.json')

SECTION_NAMES = {
    'intro': 'Intro',
    'introdução': 'Intro',
    'introducao': 'Intro',
    'verso': 'Verso',
    'refrão': 'Refrão',
    'refrao': 'Refrão',
    'refrão:': 'Refrão',
    'ref': 'Refrão',
    'parte 1': 'Parte 1',
    'parte 2': 'Parte 2',
    'parte 3': 'Parte 3',
    'parte i': 'Parte 1',
    'parte ii': 'Parte 2',
    'parte iii': 'Parte 3',
    'ponte': 'Ponte',
    'bridge': 'Ponte',
    'solo': 'Solo',
    'final': 'Final',
    'coda': 'Final',
}

SECTION_RE = re.compile(
    r'^\[([^\]]+)\]$|^(Intro|Introdução|Verso|Refrão|Ref|Parte \d|Parte [IV]+|Ponte|Bridge|Solo|Final|Coda)\s*:?\s*$',
    re.IGNORECASE
)

INLINE_SECTION_RE = re.compile(
    r'^(Intro|Introdução|Verso|Refrão|Ref|Parte \d|Parte [IV]+|Ponte|Bridge|Solo|Final|Coda)\s+(.+)',
    re.IGNORECASE
)

CHORD_RE = re.compile(r'^[A-G][#b]?', re.IGNORECASE)


def clean_chord_line(line):
    """Clean a chord line: remove extra whitespace, normalize pipes."""
    line = line.strip()
    # Remove repeat markers but keep pipes
    line = re.sub(r':\|\||\|\|:', '||', line)
    line = re.sub(r'\s*\|\s*', ' | ', line)
    line = re.sub(r'\s+', ' ', line)
    # Remove trailing/leading pipes
    line = line.strip('| ').strip()
    return line


def is_chord_line(line):
    """Check if a line contains chords."""
    cleaned = line.replace('|', ' ').replace('-', ' ').replace(':', '').strip()
    tokens = cleaned.split()
    if not tokens:
        return False
    chord_count = sum(1 for t in tokens if CHORD_RE.match(t))
    return chord_count / len(tokens) >= 0.4


def parse_txt(filepath):
    """Parse a .txt cifra file into structured data."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = [l.rstrip() for l in f.readlines()]

    # Remove empty lines at start/end
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()

    if len(lines) < 3:
        print("ERRO: Arquivo deve ter pelo menos 3 linhas (titulo, artista, tom)")
        sys.exit(1)

    # Line 1: Title
    titulo = lines[0].strip()

    # Line 2: Artist
    artista = lines[1].strip()

    # Line 3: Tom
    tom_line = lines[2].strip()
    tom_match = re.match(r'^Tom:\s*(.+)$', tom_line, re.IGNORECASE)
    if tom_match:
        tom = tom_match.group(1).strip()
        content_start = 3
    else:
        print(f"AVISO: Linha 3 nao parece ter Tom: '{tom_line}'")
        print("Formato esperado: 'Tom: Gm'")
        tom = tom_line.strip()
        content_start = 2

    # Parse remaining lines into sections
    secoes = []
    current_section = None
    current_chords = []

    for line in lines[content_start:]:
        stripped = line.strip()
        if not stripped:
            continue

        # Check for [Section] marker
        section_match = SECTION_RE.match(stripped)
        if section_match:
            # Save previous section
            if current_chords:
                name = current_section or 'Progressão'
                secoes.append({
                    'nome': name,
                    'acordes': ' | '.join(current_chords) if not any('|' in c for c in current_chords) else ' '.join(current_chords),
                })
                current_chords = []

            section_name = section_match.group(1) or section_match.group(2)
            current_section = SECTION_NAMES.get(section_name.lower(), section_name)
            continue

        # Check for inline section: "Refrão Gm | Cm | D7"
        inline_match = INLINE_SECTION_RE.match(stripped)
        if inline_match:
            if current_chords:
                name = current_section or 'Progressão'
                secoes.append({
                    'nome': name,
                    'acordes': ' | '.join(current_chords) if not any('|' in c for c in current_chords) else ' '.join(current_chords),
                })
                current_chords = []

            section_name = inline_match.group(1)
            chord_part = inline_match.group(2)
            current_section = SECTION_NAMES.get(section_name.lower(), section_name)
            if is_chord_line(chord_part):
                current_chords.append(clean_chord_line(chord_part))
            continue

        # Regular chord line
        if is_chord_line(stripped):
            current_chords.append(clean_chord_line(stripped))
        # Skip non-chord lines (lyrics, comments, etc.)

    # Save last section
    if current_chords:
        name = current_section or 'Progressão'
        secoes.append({
            'nome': name,
            'acordes': ' | '.join(current_chords) if not any('|' in c for c in current_chords) else ' '.join(current_chords),
        })

    if not secoes:
        print("ERRO: Nenhum acorde encontrado no arquivo")
        sys.exit(1)

    return {
        'titulo': titulo,
        'artista': artista,
        'tom': tom,
        'secoes': secoes,
    }


def append_to_curated(new_song):
    """Append a new song to progressoes-curadas.json."""
    if os.path.exists(CURATED_PATH):
        with open(CURATED_PATH, 'r', encoding='utf-8') as f:
            curated = json.load(f)
    else:
        curated = []

    # Check for duplicates
    for existing in curated:
        if existing['titulo'].lower() == new_song['titulo'].lower() and existing['artista'].lower() == new_song['artista'].lower():
            print(f"AVISO: '{new_song['titulo']}' de {new_song['artista']} já existe. Substituindo.")
            curated.remove(existing)
            break

    curated.append(new_song)
    curated.sort(key=lambda c: (c['artista'].lower(), c['titulo'].lower()))

    with open(CURATED_PATH, 'w', encoding='utf-8') as f:
        json.dump(curated, f, ensure_ascii=False, indent=2)

    return len(curated)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python processar-cifra.py arquivo.txt")
        sys.exit(1)

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"ERRO: Arquivo '{filepath}' não encontrado")
        sys.exit(1)

    print(f"Lendo: {filepath}")
    song = parse_txt(filepath)

    print(f"\n  Título:  {song['titulo']}")
    print(f"  Artista: {song['artista']}")
    print(f"  Tom:     {song['tom']}")
    print(f"  Seções:  {len(song['secoes'])}")
    for s in song['secoes']:
        print(f"    {s['nome']}: {s['acordes']}")

    total = append_to_curated(song)
    print(f"\nAdicionado! Total no banco curado: {total} músicas")

#!/usr/bin/env python3
"""Convert PDF-extracted cifras to CifraClub-style format.

CifraClub format:
- Chords positioned with spaces above the lyric syllable where they apply
- Sections like [Intro], [Verso], [Refrão]
- Tablature in standard format (string|---numbers---|)
"""

import json
import re
import sys

CHORD_RE = re.compile(
    r'^[A-G][#b]?'
    r'(?:m|maj|min|dim|aug|sus|add)?'
    r'[\d]*'
    r'(?:\([^)]*\))?'
    r'(?:\/[A-G][#b]?)?'
    r'[\d]*[ºø+\-]*$',
    re.IGNORECASE
)

SECTION_RE = re.compile(
    r'^\[.*\]$|^[\[(].*[\])]$|^(INTRO|REFRÃO|VERSO|BRIDGE|CODA|INTRODUÇÃO|SOLO|PRÉ-REFRÃO|FINAL|REFR)[:\s]*$',
    re.IGNORECASE
)

NUM_TAB_RE = re.compile(r'^\|?\s*\d{1,3}(-\d{1,3}){2,}')
STD_TAB_RE = re.compile(r'^[A-Ga-g]\|[-\d xhp/\\|]*\|?$')


def is_chord_token(t):
    t = t.strip().replace('|', '').strip()
    if not t or len(t) > 20:
        return False
    return bool(CHORD_RE.match(t))


def classify_line(line):
    trimmed = line.strip()
    if not trimmed:
        return 'empty'
    if SECTION_RE.match(trimmed):
        return 'section'
    if STD_TAB_RE.match(trimmed):
        return 'stdtab'
    if NUM_TAB_RE.match(trimmed):
        return 'numtab'

    # Strip pipes for chord analysis
    cleaned = trimmed.replace('|', ' ').strip()
    cleaned = re.sub(r'\s+', ' ', cleaned)
    tokens = [t for t in cleaned.split() if t and t != '%']

    if not tokens:
        return 'empty'

    chord_count = sum(1 for t in tokens if is_chord_token(t))
    ratio = chord_count / len(tokens) if tokens else 0

    if ratio >= 0.5 and chord_count > 0:
        return 'chord'

    # Check for mixed: has chords AND substantial lyrics
    if chord_count > 0 and any(len(t) > 2 and not is_chord_token(t) and re.search(r'[a-záàâãéêíóôõúüç]', t, re.I) for t in tokens):
        return 'mixed'

    if re.search(r'[a-záàâãéêíóôõúüç]{2,}', trimmed, re.I):
        return 'lyric'

    return 'other'


def extract_chords_from_line(line):
    """Extract chord tokens from a line, stripping pipes and non-chord text."""
    cleaned = line.strip().replace('|', ' ').strip()
    tokens = cleaned.split()
    chords = []
    for t in tokens:
        t = t.strip()
        if t == '%' or not t:
            continue
        if is_chord_token(t):
            chords.append(t)
    return chords


def position_chords_over_lyric(chords, lyric):
    """Position chord names with spaces above a lyric line.

    Distributes chords roughly evenly across the lyric,
    trying to align with word boundaries.
    """
    if not chords:
        return None, lyric

    lyric_stripped = lyric.rstrip()
    if not lyric_stripped:
        return '  '.join(chords), ''

    lyric_len = len(lyric_stripped)

    if len(chords) == 1:
        return chords[0], lyric_stripped

    # Find word boundary positions for placing chords
    word_starts = [0]
    for m in re.finditer(r'\s+\S', lyric_stripped):
        word_starts.append(m.start() + len(m.group()) - 1)

    # Distribute chords across the lyric
    positions = []
    if len(chords) <= len(word_starts):
        # Place at evenly spaced word boundaries
        step = max(1, len(word_starts) // len(chords))
        for i, chord in enumerate(chords):
            idx = min(i * step, len(word_starts) - 1)
            positions.append((word_starts[idx], chord))
    else:
        # More chords than words - space evenly by character position
        step = max(1, lyric_len // len(chords))
        for i, chord in enumerate(chords):
            positions.append((i * step, chord))

    # Build chord line with proper spacing
    chord_line = list(' ' * (lyric_len + 20))
    for pos, chord in positions:
        pos = min(pos, len(chord_line) - len(chord))
        # Don't overlap with previous chord
        for ci, ch in enumerate(chord):
            if pos + ci < len(chord_line):
                chord_line[pos + ci] = ch

    return ''.join(chord_line).rstrip(), lyric_stripped


def has_any_lyric(lines, start):
    """Check if there's any lyric line before position start."""
    for k in range(start):
        if classify_line(lines[k]) == 'lyric':
            return True
    return False


def format_chord_group_with_pipes(chords):
    """Format a chord group with pipe separators for rehearsal/intro format."""
    return ' | '.join(chords)


def convert_cifra(conteudo):
    """Convert a single cifra content to CifraClub format."""
    lines = conteudo.split('\n')
    output = []
    i = 0
    found_first_lyric = False
    has_intro_marker = False

    # Check if there's already an [Intro] marker
    for line in lines:
        if re.match(r'^\[Intro\]', line.strip(), re.IGNORECASE):
            has_intro_marker = True
            break
        if re.match(r'^INTRODUÇÃO', line.strip(), re.IGNORECASE):
            has_intro_marker = True
            break

    while i < len(lines):
        line = lines[i]
        cls = classify_line(line)

        if cls == 'empty':
            output.append('')
            i += 1
            continue

        if cls == 'section':
            trimmed = line.strip()
            trimmed = re.sub(r'^INTRODUÇÃO\s*:?\s*', '[Intro]', trimmed, flags=re.IGNORECASE)
            trimmed = re.sub(r'^REFRÃO\s*:?\s*', '[Refrão]', trimmed, flags=re.IGNORECASE)
            trimmed = re.sub(r'^FINAL\s*$', '[Final]', trimmed, flags=re.IGNORECASE)
            output.append('')
            output.append(trimmed)
            i += 1
            continue

        if cls in ('stdtab', 'numtab'):
            # If we haven't seen lyrics yet and no intro marker, add one
            if not found_first_lyric and not has_intro_marker:
                output.append('[Intro]')
                has_intro_marker = True
            output.append(line.rstrip())
            i += 1
            continue

        if cls == 'chord':
            # Collect consecutive chord lines as groups
            chord_groups = []
            j = i
            while j < len(lines):
                c = classify_line(lines[j])
                if c == 'empty':
                    j += 1
                    continue
                if c == 'chord':
                    chord_groups.append(extract_chords_from_line(lines[j]))
                    j += 1
                else:
                    break

            all_chords = [c for g in chord_groups for c in g]

            # Look ahead for lyric
            next_idx = j
            while next_idx < len(lines) and not lines[next_idx].strip():
                next_idx += 1

            next_line = lines[next_idx] if next_idx < len(lines) else ''
            next_cls = classify_line(next_line)

            # CASE 1: Before first lyric = intro/standalone section
            if not found_first_lyric and next_cls != 'lyric':
                if not has_intro_marker:
                    output.append('[Intro]')
                    has_intro_marker = True
                output.append(format_chord_group_with_pipes(all_chords))
                i = j
                continue

            if not found_first_lyric and next_cls == 'lyric' and len(all_chords) > 4:
                if not has_intro_marker:
                    output.append('[Intro]')
                    has_intro_marker = True
                intro_chords = [c for g in chord_groups[:-1] for c in g]
                if intro_chords:
                    output.append(format_chord_group_with_pipes(intro_chords))
                output.append('')
                last_chords = chord_groups[-1]
                found_first_lyric = True
                chord_line, lyric_line = position_chords_over_lyric(last_chords, next_line)
                if chord_line:
                    output.append(chord_line)
                output.append(lyric_line)
                i = next_idx + 1
                continue

            # CASE 2: Chords followed by lyric (inside verses — NO pipes)
            if next_cls == 'lyric' and all_chords:
                found_first_lyric = True
                if len(all_chords) <= 4:
                    chord_line, lyric_line = position_chords_over_lyric(all_chords, next_line)
                    if chord_line:
                        output.append(chord_line)
                    output.append(lyric_line)
                else:
                    for g in chord_groups[:-1]:
                        output.append('  '.join(g))
                    last_chords = chord_groups[-1]
                    chord_line, lyric_line = position_chords_over_lyric(last_chords, next_line)
                    if chord_line:
                        output.append(chord_line)
                    output.append(lyric_line)
                i = next_idx + 1
                continue

            # CASE 3: Standalone chords (no lyric follows)
            if all_chords:
                if found_first_lyric:
                    # Inside song: use spaces
                    output.append('  '.join(all_chords))
                else:
                    # Before first lyric: use pipes (intro/instrumental)
                    output.append(format_chord_group_with_pipes(all_chords))
            i = j
            continue

        if cls == 'lyric':
            found_first_lyric = True
            output.append(line.rstrip())
            i += 1
            continue

        if cls in ('mixed', 'other'):
            found_first_lyric = True
            output.append(line.rstrip())
            i += 1
            continue

        i += 1

    # Clean up: remove excessive blank lines (max 2 consecutive)
    cleaned = []
    blank_count = 0
    for line in output:
        if line.strip() == '':
            blank_count += 1
            if blank_count <= 2:
                cleaned.append('')
        else:
            blank_count = 0
            cleaned.append(line)

    while cleaned and not cleaned[0].strip():
        cleaned.pop(0)
    while cleaned and not cleaned[-1].strip():
        cleaned.pop()

    return '\n'.join(cleaned)


def test_conversion(cifras, titles):
    """Test conversion on specific cifras and print results."""
    for title in titles:
        for c in cifras:
            if c['titulo'] == title:
                print(f'=== {c["titulo"]} ({c["artista"]}) Tom: {c["tom"]} ===')
                converted = convert_cifra(c['conteudo'])
                print(converted[:1200])
                print('...\n')
                break


if __name__ == '__main__':
    with open(r'C:\Users\renat\Downloads\Hamonico\prisma\data\cifras.json', 'r', encoding='utf-8') as f:
        cifras = json.load(f)

    test_titles = ['Trem das Onze', 'Me Leva', 'Cerveja de Garrafa']

    if '--apply' in sys.argv:
        # Apply to all cifras
        for c in cifras:
            c['conteudo'] = convert_cifra(c['conteudo'])
        with open(r'C:\Users\renat\Downloads\Hamonico\prisma\data\cifras.json', 'w', encoding='utf-8') as f:
            json.dump(cifras, f, ensure_ascii=False, indent=2)
        print(f'Converted {len(cifras)} cifras to CifraClub format')
    else:
        # Test mode
        test_conversion(cifras, test_titles)

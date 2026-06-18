#!/usr/bin/env python3
"""Extract cifras from PDF songbooks and generate cifras.json for the Hamonico app."""

import fitz
import json
import re
import sys
import unicodedata

# Fix mojibake: the PDFs have Latin-1 bytes decoded as something else
ENCODING_FIXES = {
    '�': '',  # replacement char
    '�': 'ã', '�': 'á', '�': 'à', '�': 'â', '�': 'ä',
    '�': 'é', '�': 'ê', '�': 'è',
    '�': 'í', '�': 'î',
    '�': 'ó', '�': 'ô', '�': 'õ',
    '�': 'ú', '�': 'ü', '�': 'û',
    '�': 'ç',
    '�': 'Ã', '�': 'Á', '�': 'À', '�': 'Â',
    '�': 'É', '�': 'Ê',
    '�': 'Í',
    '�': 'Ó', '�': 'Ô', '�': 'Õ',
    '�': 'Ú',
    '�': 'Ç',
    '�': 'º',
}

def fix_encoding(text: str) -> str:
    """Try to fix mojibake encoding issues from PDF extraction."""
    # Try re-encoding: sometimes PDF text is Latin-1 bytes misread as UTF-8
    try:
        fixed = text.encode('latin-1').decode('utf-8')
        if '�' not in fixed:
            return fixed
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass

    # Manual fixes for remaining issues
    for bad, good in ENCODING_FIXES.items():
        text = text.replace(bad, good)

    return text


def extract_text_from_pdf(path: str) -> str:
    """Extract all text from PDF."""
    doc = fitz.open(path)
    pages = []
    for page in doc:
        text = page.get_text()
        pages.append(text)
    doc.close()
    return '\n'.join(pages)


# Pattern: starts with title - artist, then Tom: X
# The PDFs have cifras starting with "TITLE - ARTIST\nTom: X"
CIFRA_START = re.compile(
    r'^(?:\d+\s*\n\s*)?'           # optional page number
    r'(.+?)\s*[-–]\s*(.+?)\s*\n'   # TITLE - ARTIST
    r'\s*Tom:\s*([A-G][#b]?m?)\s*$', # Tom: X
    re.MULTILINE
)

# Alternative: some cifras have TITLE - ARTIST on same line as number
CIFRA_START_ALT = re.compile(
    r'^\d+\s*\n\s*\n\s*(.+?)\s*[-–]\s*(.+?)\s*\n\s*Tom:\s*([A-G][#b]?m?)\s*$',
    re.MULTILINE
)


def split_cifras(text: str) -> list:
    """Split full text into individual cifras."""
    # Find all cifra starts
    matches = list(CIFRA_START.finditer(text))

    cifras = []
    for i, m in enumerate(matches):
        titulo = m.group(1).strip()
        artista = m.group(2).strip()
        tom = m.group(3).strip()

        # Content is from end of this match to start of next match
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        conteudo = text[start:end].strip()

        # Clean up content
        # Remove page headers like "SAMBA DE RAIZ" or "SAMBA NOVOS"
        conteudo = re.sub(r'^SAMBA DE RAIZ\s*$', '', conteudo, flags=re.MULTILINE)
        conteudo = re.sub(r'^SAMBA NOVOS\s*$', '', conteudo, flags=re.MULTILINE)
        conteudo = re.sub(r'^PAGODE\s*$', '', conteudo, flags=re.MULTILINE)

        # Remove trailing page numbers (standalone numbers)
        conteudo = re.sub(r'\n\d{1,3}\s*$', '', conteudo)

        # Remove leading/trailing whitespace but preserve internal structure
        lines = conteudo.split('\n')
        # Remove empty lines at start/end
        while lines and not lines[0].strip():
            lines.pop(0)
        while lines and not lines[-1].strip():
            lines.pop()
        conteudo = '\n'.join(lines)

        if not conteudo:
            continue

        cifras.append({
            'titulo': titulo,
            'artista': artista,
            'tom': tom,
            'conteudo': conteudo,
            'progressao': None,
        })

    return cifras


def normalize_artist(name: str) -> str:
    """Normalize artist names for consistency."""
    name = name.strip()

    # Title case
    words = name.split()
    result = []
    small_words = {'de', 'da', 'do', 'das', 'dos', 'e', 'o', 'a', 'no', 'na', 'em', 'com'}
    for i, w in enumerate(words):
        if i == 0 or w.lower() not in small_words:
            result.append(w.capitalize() if w.isupper() or w.islower() else w)
        else:
            result.append(w.lower())

    name = ' '.join(result)

    # Specific normalizations
    ARTIST_MAP = {
        'Agepê': ['Agepe', 'AGEPÊ', 'AGEPE', 'Agep'],
        'Adoniram Barbosa': ['Adon.', 'ADONIRAM BARBOSA'],
        'Alexandre Pires': ['ALEXANDRE PIRES'],
        'Atitude 67': ['ATITUTE 67', 'ATITUDE 67', 'Atitute 67'],
        'Belo': ['BELO'],
        'Benito di Paula': ['Benito de Paul.', 'Benito de Paula', 'BENITO DE PAULA'],
        'Bom Gosto': ['BOM GOSTO'],
        'Bokaloka': ['BOKALOKA'],
        'Candeia': ['CANDEIA'],
        'Cartola': ['CARTOLA'],
        'Clara Nunes': ['CLARA NUNES'],
        'Chininha e Príncipe': ['CHININHA E PRINCIPE', 'Chininha e Principe'],
        'Dilsinho': ['DILSINHO'],
        'Diogo Nogueira': ['DIOGO NOGUEIRA'],
        'Dona Ivone Lara': ['DONA IVONE LARA', 'Dona I.'],
        'Ferrugem': ['FERRUGEM'],
        'Grupo Clareou': ['GRUPO CLAREOU', 'GRUPO CLAREU', 'Grupo Clareu'],
        'Imaginasamba': ['IMAGINASAMBA'],
        'João Nogueira': ['JOÃO NOGUEIRA', 'Joao Nogueira'],
        'Leci Brandão': ['LECI BRANDÃO', 'Leci Brandao'],
        'Noel Rosa': ['NOEL ROSA'],
        'Pericles': ['PERICLES', 'Péricles'],
        'Pixinguinha': ['PIXINGUINHA'],
        'Reinaldo': ['REINALDO'],
        'Sorriso Maroto': ['SORRISO MAROTO', 'SORRISO MAROTTO', 'Sorriso Marotto'],
        'Thiaguinho': ['THIAGUINHO'],
        'Turma do Pagode': ['TURMA DO PAGODE'],
        'Arlindo Cruz': ['ARLINDO CRUZ'],
        'Alcione': ['ALCIONE'],
        'Diney': ['DINEY'],
        'Pixote': ['PIXOTE'],
        'Tiee': ['TIEE'],
    }

    for canonical, variants in ARTIST_MAP.items():
        if name in variants or name.upper() in [v.upper() for v in variants]:
            return canonical

    return name


def normalize_title(title: str) -> str:
    """Normalize song title."""
    title = title.strip()
    # Remove leading numbers
    title = re.sub(r'^\d+\s*', '', title)
    # Title case if all caps
    if title == title.upper() and len(title) > 3:
        words = title.split()
        small_words = {'de', 'da', 'do', 'das', 'dos', 'e', 'o', 'a', 'no', 'na', 'em', 'com', 'que', 'pra', 'pro'}
        result = []
        for i, w in enumerate(words):
            if i == 0 or w.lower() not in small_words:
                result.append(w.capitalize())
            else:
                result.append(w.lower())
        title = ' '.join(result)
    return title


def normalize_section(conteudo: str) -> str:
    """Normalize section markers to [Section] format."""
    # INTRODUÇÃO: -> [Intro]
    conteudo = re.sub(r'^INTRODUÇÃO\s*:?\s*', '[Intro]\n', conteudo, flags=re.MULTILINE)
    conteudo = re.sub(r'^INTRODU[ÇC][ÃA]O\s*:?\s*', '[Intro]\n', conteudo, flags=re.MULTILINE)
    conteudo = re.sub(r'^INTRO\s*:?\s*$', '[Intro]', conteudo, flags=re.MULTILINE)
    conteudo = re.sub(r'^REFRÃO\s*:?\s*', '[Refrão]\n', conteudo, flags=re.MULTILINE)
    conteudo = re.sub(r'^REFR[ÃA]O\s*:?\s*', '[Refrão]\n', conteudo, flags=re.MULTILINE)
    conteudo = re.sub(r'^FINAL\s*:?\s*$', '[Final]', conteudo, flags=re.MULTILINE)
    conteudo = re.sub(r'^SOLO\s*:?\s*$', '[Solo]', conteudo, flags=re.MULTILINE)
    conteudo = re.sub(r'^PONTE\s*:?\s*$', '[Ponte]', conteudo, flags=re.MULTILINE)
    return conteudo


def process_pdf(path: str, source: str) -> list:
    """Process a single PDF and return list of cifra dicts."""
    print(f"Processing {path}...")
    raw_text = extract_text_from_pdf(path)
    text = fix_encoding(raw_text)

    cifras = split_cifras(text)
    print(f"  Found {len(cifras)} cifras")

    for c in cifras:
        c['titulo'] = fix_encoding(normalize_title(c['titulo']))
        c['artista'] = fix_encoding(normalize_artist(c['artista']))
        c['conteudo'] = fix_encoding(normalize_section(c['conteudo']))
        c['source'] = source

    return cifras


def dedupe(cifras: list) -> list:
    """Remove duplicates by title+artist."""
    seen = set()
    result = []
    for c in cifras:
        key = (c['titulo'].lower(), c['artista'].lower())
        if key not in seen:
            seen.add(key)
            result.append(c)
    return result


if __name__ == '__main__':
    samba_raiz = process_pdf(
        r'C:\Users\renat\Downloads\Harmonico\SAMBA RAIZ.pdf',
        'samba_raiz'
    )
    pagodes = process_pdf(
        r'C:\Users\renat\Downloads\Harmonico\PAGODES ATUAIS ..pdf',
        'pagodes_atuais'
    )

    all_cifras = samba_raiz + pagodes
    all_cifras = dedupe(all_cifras)

    # Sort by artist then title
    all_cifras.sort(key=lambda c: (c['artista'].lower(), c['titulo'].lower()))

    # Remove source field before saving
    for c in all_cifras:
        c.pop('source', None)

    output_path = r'C:\Users\renat\Downloads\Hamonico\prisma\data\cifras-new.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_cifras, f, ensure_ascii=False, indent=2)

    print(f"\nTotal: {len(all_cifras)} cifras (after dedup)")
    print(f"Saved to {output_path}")

    # Stats
    artists = set(c['artista'] for c in all_cifras)
    print(f"Artists: {len(artists)}")
    for a in sorted(artists):
        count = sum(1 for c in all_cifras if c['artista'] == a)
        print(f"  {a}: {count}")

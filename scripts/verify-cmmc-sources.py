#!/usr/bin/env python3
"""Verify the pinned CMMC snapshot against locally downloaded source PDFs.

No network requests or application edits. Requires Python 3 and pdftotext.
Attribution and acquisition limits are in docs/sources/cmmc-2-13-sep-2024.md.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import subprocess
from xml.etree import ElementTree

REPO = Path(__file__).resolve().parent.parent
COUNTS = {1: 15, 2: 110, 3: 24}
MODEL_ID = re.compile(r'^[A-Z]{2}\.L[123]-(?:b\.1\.[ivx]+|3\.\d+\.\d+e?)$')
GUIDE_HEADING = re.compile(
    r'^([A-Z]{2}\.L[123]-(?:B\.1\.[IVX]+|3\.\d+\.\d+E?))\s+[–-]\s+(.+)$',
    re.MULTILINE,
)
XML_NAMESPACE = {'h': 'http://www.w3.org/1999/xhtml'}


def normalized(text: str) -> str:
    """Ignore PDF physical wrapping while preserving every non-space character."""
    return re.sub(r'\s+', '', text)


def joined_lines(lines: list[str]) -> str:
    text = ''
    for line in lines:
        text += ('' if not text or text.endswith('-') else ' ') + line
    return text.strip()


def model_rows(path: Path) -> dict[str, dict]:
    """Read complete model table cells, excluding the later summary matrix.

    Ordinary layout text interleaves the title and statement columns. Bounding
    boxes let us verify each entire cell rather than accepting a quote merely
    because its words occur somewhere on the page.
    """
    xml = subprocess.check_output(['pdftotext', '-bbox-layout', str(path), '-'])
    document = ElementTree.fromstring(xml)
    rows = {}
    active = False
    description_x = 229.5
    for pdf_page, page in enumerate(document.findall('.//h:page', XML_NAMESPACE), 1):
        lines = []
        for element in page.findall('.//h:line', XML_NAMESPACE):
            words = element.findall('h:word', XML_NAMESPACE)
            lines.append({
                'y': float(element.attrib['yMin']),
                'x': float(element.attrib['xMin']),
                'text': ' '.join(word.text or '' for word in words),
                'words': words,
            })
        lines.sort(key=lambda line: (line['y'], line['x']))
        if any(line['text'] == '2.4 CMMC Security Requirements' for line in lines):
            active = True
        if any(line['text'] == 'Appendix A. CMMC Model Matrix' for line in lines):
            active = False
        if not active:
            continue
        footer = [line['text'] for line in lines
                  if line['y'] > 730 and line['text'].isdigit()]
        if len(footer) != 1:
            raise ValueError(f'Model printed page cannot be determined: PDF page {pdf_page}')
        starts = [line for line in lines
                  if line['x'] < 100 and MODEL_ID.fullmatch(line['text'])]
        boundaries = [line['y'] for line in lines if line['x'] < 100 and (
            MODEL_ID.fullmatch(line['text'])
            or re.fullmatch(r'Level [123]', line['text'])
            or re.fullmatch(r'[A-Z &]+ \([A-Z]{2}\)', line['text'])
        )]
        for start in starts:
            headers = [line for line in lines
                       if line['text'] == 'Description' and line['y'] < start['y']]
            if headers:
                description_x = headers[-1]['x']
            stop = min([y for y in boundaries if y > start['y'] + 1] + [730])
            title, statement = [], []
            for line in lines:
                if not start['y'] - .5 <= line['y'] < stop - .5:
                    continue
                left = [word.text or '' for word in line['words']
                        if float(word.attrib['xMin']) < description_x - 1]
                right = [word.text or '' for word in line['words']
                         if float(word.attrib['xMin']) >= description_x - 1]
                if left and ' '.join(left) != start['text']:
                    title.append(' '.join(left))
                if right:
                    statement.append(' '.join(right))
            identifier = start['text']
            if identifier in rows:
                raise ValueError(f'Duplicate model body identifier: {identifier}')
            rows[identifier] = {
                'title': joined_lines(title),
                'statement': joined_lines(statement),
                'pdfPage': pdf_page,
                'printedPage': int(footer[0]),
            }
    return rows


def guide_rows(pages: list[str], level: int) -> dict[str, dict]:
    rows = {}
    for pdf_page, page in enumerate(pages, 1):
        headings = list(GUIDE_HEADING.finditer(page))
        if not headings:
            continue
        if len(headings) != 1:
            raise ValueError(f'Ambiguous guide body heading: Level {level}, page {pdf_page}')
        heading = headings[0]
        identifier = heading.group(1).upper()
        if identifier in rows:
            raise ValueError(f'Duplicate guide body identifier: {identifier}')
        if f'.L{level}-' not in identifier:
            raise ValueError(f'Identifier has wrong level: {identifier}')
        paragraph = page[heading.end():page.index('ASSESSMENT OBJECTIVES', heading.end())].strip()
        footers = [line for line in page.splitlines() if 'CMMC Assessment Guide' in line]
        footer = re.search(r'(\d+)\s*$', footers[0]) if len(footers) == 1 else None
        if footer is None:
            raise ValueError(f'Guide printed page cannot be determined: {identifier}')
        rows[identifier] = {
            'statement': paragraph,
            'pdfPage': pdf_page,
            'printedPage': int(footer.group(1)),
        }
    if len(rows) != COUNTS[level]:
        raise ValueError(f'Unexpected independent Level {level} guide inventory: {len(rows)}')
    return rows


def verify(source_dir: Path, catalog_file: Path) -> None:
    manifest = json.loads((REPO / 'docs/sources/cmmc-2-13-manifest.json').read_text())
    catalog = json.loads(catalog_file.read_text())
    pages = {}
    source_paths = {}
    for document in manifest['sources']:
        path = source_dir / document['file']
        contents = path.read_bytes()
        if len(contents) != document['downloadedBytes']:
            raise ValueError(f"Unexpected byte count: {document['file']}")
        if hashlib.sha256(contents).hexdigest() != document['sha256']:
            raise ValueError(f"Checksum mismatch: {document['file']}")
        text = subprocess.check_output(['pdftotext', '-layout', str(path), '-']).decode()
        if ('2.13' not in text[:4000] or 'September 2024' not in text[:4000]
                or document['documentId'] not in text[:4000]):
            raise ValueError(f"Publication cover mismatch: {document['file']}")
        if normalized(document['publicationNotice']) not in normalized(text[:4000]):
            raise ValueError(f"Publication distribution notice mismatch: {document['file']}")
        source_id = document['id']
        pages[source_id] = text.split('\f')
        source_paths[source_id] = path
        catalog_source = next((source for source in [catalog['modelSource'], *catalog['sources']]
                               if source['id'] == source_id), None)
        if catalog_source != {key: value for key, value in document.items() if key != 'file'}:
            raise ValueError(f'Catalog provenance differs from pinned manifest: {source_id}')

    controls = catalog['controls']
    if len(controls) != 149 or len({control['id'] for control in controls}) != 149:
        raise ValueError('Expected 149 unique CMMC identifiers')
    if Counter(control['level'] for control in controls) != COUNTS:
        raise ValueError('Unexpected snapshot level coverage')
    if catalog['counts'] != {f'level{level}': count for level, count in COUNTS.items()}:
        raise ValueError('Catalog count summary disagrees with the verified inventory')
    model = model_rows(source_paths['cmmc-model-213'])
    guides = {level: guide_rows(pages[f'cmmc-assessment-l{level}-213'], level)
              for level in COUNTS}
    identifiers = {control['id'] for control in controls}
    if set(model) != identifiers:
        raise ValueError('Catalog inventory does not match the model table inventory')
    if set().union(*(set(rows) for rows in guides.values())) != {identifier.upper() for identifier in identifiers}:
        raise ValueError('Catalog inventory does not match the guide body inventories')
    model_text = '\n'.join(pages['cmmc-model-213'])
    family_start = model_text.index('\n2.3 CMMC Domains\n')
    family_end = model_text.index('\n2.4 CMMC Security Requirements\n', family_start)
    family_lines = model_text[family_start:family_end]
    family_names = {code: name for name, code in re.findall(r'•\s+(.+) \(([A-Z]{2})\)', family_lines)}
    differences = []
    for control in controls:
        identifier = control['id']
        if not MODEL_ID.fullmatch(identifier) or control['level'] != int(identifier[4]):
            raise ValueError(f'Identifier/level mismatch: {identifier}')
        if (control['family'] != identifier[:2]
                or control['familyName'] != family_names.get(control['family'])):
            raise ValueError(f'Family metadata mismatch: {identifier}')
        if (control['sourceId'] != f"cmmc-assessment-l{control['level']}-213"
                or control['modelSourceId'] != 'cmmc-model-213'
                or control['sourceSection'] != identifier):
            raise ValueError(f'Source identity mismatch: {identifier}')
        guide = guides[control['level']][identifier.upper()]
        row = model[identifier]
        if normalized(control['officialRequirement']) != normalized(guide['statement']):
            raise ValueError(f'Guide quote differs from its complete requirement paragraph: {identifier}')
        if normalized(control['modelStatement']) != normalized(row['statement']):
            raise ValueError(f'Model quote differs from its complete table cell: {identifier}')
        if normalized(control['title']) != normalized(row['title']):
            raise ValueError(f'Model quick-reference title mismatch: {identifier}')
        if (control['sourcePdfPage'], control['sourcePrintedPage']) != (guide['pdfPage'], guide['printedPage']):
            raise ValueError(f'Guide citation page mismatch: {identifier}')
        if (control['modelSourcePdfPage'], control['modelSourcePrintedPage']) != (row['pdfPage'], row['printedPage']):
            raise ValueError(f'Model citation page mismatch: {identifier}')
        if normalized(control['officialRequirement']) != normalized(control['modelStatement']):
            differences.append({
                'id': identifier,
                'modelStatement': control['modelStatement'],
                'guideStatement': control['officialRequirement'],
            })
    if len(differences) != 10 or catalog['modelGuideWordingDifferences'] != differences:
        raise ValueError('Publication wording differences are missing or inconsistent')
    print('Verified four source PDFs and independent guide/model inventories (15/110/24).')
    print('Verified all 149 complete guide/model quotations, model titles, families and both page citations.')
    print('Verified source metadata, publication covers/notices and the 10 preserved wording differences.')
    print('Provenance/transcription check only; no latest-edition or editorial certification.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--catalog-file', type=Path,
                        default=REPO / 'src/data/cmmc-213-catalog.json')
    arguments = parser.parse_args()
    verify(arguments.source_dir, arguments.catalog_file)

#!/usr/bin/env python3
"""Compare the complete determination/ODP inventory with hash-pinned DoD PDFs.

Requires Python 3 and Poppler. Default is read-only; --write creates the snapshot.
Source transcription is not teaching coverage, current applicability or approval.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
LABEL = re.compile(r'^\s*\[([a-z]|ODP\d+)\]\s*', re.MULTILINE)


def extract(source_dir: Path) -> dict:
    # Reuse the independent requirement/page/manifest checks before trusting citations.
    subprocess.run([sys.executable, str(ROOT / 'scripts/verify-cmmc-sources.py'),
                    '--source-dir', str(source_dir)], check=True)
    catalog = json.loads((ROOT / 'src/data/cmmc-213-catalog.json').read_text())
    manifest = json.loads((ROOT / 'docs/sources/cmmc-2-13-manifest.json').read_text())
    pages, hashes = {}, {}
    for source in manifest['sources']:
        if 'assessment' not in source['id']:
            continue
        data = (source_dir / source['file']).read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        if digest != source['sha256'] or len(data) != source['downloadedBytes']:
            raise ValueError(f"Pinned PDF mismatch: {source['id']}")
        hashes[source['id']] = digest
        pages[source['id']] = subprocess.check_output(
            ['pdftotext', '-layout', str(source_dir / source['file']), '-'],
        ).decode().split('\f')
    objectives = []
    for control in catalog['controls']:
        page = pages[control['sourceId']][control['sourcePdfPage'] - 1]
        heading = re.search(r'^' + re.escape(control['id'].upper()) + r'\s+[–-]', page, re.M)
        if not heading:
            raise ValueError(f"Missing exact control heading: {control['id']}")
        start = page.index('ASSESSMENT OBJECTIVES', heading.end())
        end = page.index('POTENTIAL ASSESSMENT METHODS', start)
        block = page[start:end]
        # These pinned guides keep each complete objective block on this page.
        # Reject a future changed layout rather than absorbing a header/footnote.
        if 'CMMC Assessment Guide' in block or 'Determine if:' not in block:
            raise ValueError(f"Unexpected objective layout: {control['id']}")
        matches = list(LABEL.finditer(block))
        if not matches:
            raise ValueError(f"No objective labels: {control['id']}")
        letters = [m.group(1) for m in matches if not m.group(1).startswith('ODP')]
        if letters != [chr(97 + index) for index in range(len(letters))]:
            raise ValueError(f"Missing/repeated determination label: {control['id']}")
        for index, match in enumerate(matches):
            stop = matches[index + 1].start() if index + 1 < len(matches) else len(block)
            raw_text = re.sub(r'-[ \t]*\n[ \t]*', '-', block[match.end():stop])
            text = re.sub(r'\s+', ' ', raw_text).strip()
            label = match.group(1)
            objectives.append({
                'id': f"{control['id']}[{label}]",
                'controlId': control['id'],
                'label': label,
                'kind': 'organization-defined-parameter' if label.startswith('ODP') else 'determination',
                'text': text,
                'sourceId': control['sourceId'],
                'pdfPage': control['sourcePdfPage'],
                'printedPage': control['sourcePrintedPage'],
            })
    return {
        'schemaVersion': 1,
        'frameworkId': 'cmmc',
        'editionId': 'cmmc-2-13-sep-2024',
        'sourceVerification': 'pinned-snapshot-verified',
        'sourceSha256': hashes,
        'objectives': objectives,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--catalog-file', type=Path, default=ROOT / 'src/data/cmmc-objectives.json')
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    result = extract(args.source_dir)
    if args.write:
        args.catalog_file.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    elif json.loads(args.catalog_file.read_text()) != result:
        raise ValueError('Objective snapshot differs from complete pinned guide inventory/text/citations')
    rows = result['objectives']
    print(f"Verified {len(rows)} attributed statements across {len(set(r['controlId'] for r in rows))} controls.")
    for level in [1, 2, 3]:
        subset = [r for r in rows if f'.L{level}-' in r['controlId']]
        print(f"Level {level}: {sum(r['kind'] == 'determination' for r in subset)} determinations, "
              f"{sum(r['kind'] == 'organization-defined-parameter' for r in subset)} ODP statements.")
    print('Pinned source transcription only; no teaching-coverage or professional-approval claim.')

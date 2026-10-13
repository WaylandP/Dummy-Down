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

REPO = Path(__file__).resolve().parent.parent


def verify(source_dir: Path) -> None:
    manifest = json.loads((REPO / 'docs/sources/cmmc-2-13-manifest.json').read_text())
    catalog = json.loads((REPO / 'src/data/cmmc-213-catalog.json').read_text())
    pages = {}
    for document in manifest['sources']:
        path = source_dir / document['file']
        contents = path.read_bytes()
        if len(contents) != document['downloadedBytes']:
            raise ValueError(f"Unexpected byte count: {document['file']}")
        if hashlib.sha256(contents).hexdigest() != document['sha256']:
            raise ValueError(f"Checksum mismatch: {document['file']}")
        text = subprocess.check_output(['pdftotext', '-layout', str(path), '-']).decode()
        if '2.13' not in text[:4000] or '2024' not in text[:4000]:
            raise ValueError(f"Publication cover mismatch: {document['file']}")
        pages[document.get('id', 'cmmc-model-213')] = text.split('\f')

    controls = catalog['controls']
    if len({control['id'] for control in controls}) != 149:
        raise ValueError('Expected 149 unique CMMC identifiers')
    if Counter(control['level'] for control in controls) != {1: 15, 2: 110, 3: 24}:
        raise ValueError('Unexpected snapshot level coverage')
    for control in controls:
        page = pages[control['sourceId']][control['sourcePdfPage'] - 1]
        normalized_quote = re.sub(r'\s+', '', control['officialRequirement'])
        if normalized_quote not in re.sub(r'\s+', '', page):
            raise ValueError(f"Quotation not on cited page: {control['id']}")
        footers = [line for line in page.splitlines() if 'CMMC Assessment Guide' in line]
        if not any(re.search(rf"\b{control['sourcePrintedPage']}\s*$", line) for line in footers):
            raise ValueError(f"Printed page mismatch: {control['id']}")
    print('Verified four source PDFs and all 149 cited guide quotations (15/110/24).')
    print('Provenance/transcription check only; no latest-edition or editorial certification.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, required=True)
    arguments = parser.parse_args()
    verify(arguments.source_dir)

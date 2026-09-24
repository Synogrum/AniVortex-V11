#!/usr/bin/env python3
"""Build AniVortex deploy files from the modular source tree.

No third-party build dependency is required. The script concatenates source partials
in the explicit manifest order and copies one-file components into site/assets.
"""
from __future__ import annotations
import argparse
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'src'
SITE = ROOT / 'site'
MANIFEST = json.loads((ROOT / 'build-manifest.json').read_text('utf-8'))


def concat(base: Path, parts: list[str]) -> str:
    return ''.join((base / part).read_text('utf-8') for part in parts)


def targets() -> dict[Path, str]:
    output: dict[Path, str] = {}
    for target, parts in MANIFEST['html'].items():
        html = concat(SRC / 'html' / Path(target).stem, parts)
        html = html.replace('{{ASSET_VERSION}}', MANIFEST.get('asset_version', '1'))
        output[SITE / target] = html
    for target, parts in MANIFEST['css_bundles'].items():
        output[SITE / 'assets' / 'css' / target] = concat(SRC / 'css', parts)
    for target, parts in MANIFEST['js_bundles'].items():
        output[SITE / 'assets' / 'js' / target] = concat(SRC / 'js', parts)
    for name in MANIFEST['css_files']:
        output[SITE / 'assets' / 'css' / name] = (SRC / 'css' / 'components' / name).read_text('utf-8')
    for name in MANIFEST['js_files']:
        output[SITE / 'assets' / 'js' / name] = (SRC / 'js' / 'components' / name).read_text('utf-8')
    return output


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='Do not write; fail if site/ differs from src/.')
    args = parser.parse_args()

    mismatches: list[str] = []
    for path, content in targets().items():
        current = path.read_text('utf-8') if path.exists() else None
        if current != content:
            if args.check:
                mismatches.append(str(path.relative_to(ROOT)))
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, 'utf-8')
                print(f'BUILT {path.relative_to(ROOT)}')

    if args.check and mismatches:
        print('BUILD CHECK FAILED')
        for mismatch in mismatches:
            print('-', mismatch)
        return 1

    print('BUILD CHECK PASS' if args.check else 'BUILD COMPLETE')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

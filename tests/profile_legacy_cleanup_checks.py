#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'src/html/index/04-main-left.html').read_text('utf-8')
js='\n'.join(p.read_text('utf-8',errors='ignore') for p in (ROOT/'src/js').rglob('*.js'))
legacy_html=['class="welcome-message"','class="profile-section"','id="statusMenu"','class="rank-info"','class="favorite-series"','class="logout-container"','id="episode-title"','data-action="show-subscriptions"','data-action="toggle-status-menu"','data-action="set-status"']
legacy_js=['function showSubscriptions()','toggleProfileStatusMenu','setProfileStatus(status)','case \'toggle-status-menu\'','case \'set-status\'','case \'show-subscriptions\'']
fail=[f'legacy HTML remains: {x}' for x in legacy_html if x in html]
fail += [f'legacy JS remains: {x}' for x in legacy_js if x in js]
if 'id="chest-popup"' not in html or 'data-action="open-chest-reward"' not in html:
    fail.append('active chest reward UI was removed')
if fail:
    print('FAIL - legacy profile cleanup')
    [print('-',x) for x in fail]
    raise SystemExit(1)
print('PASS - legacy hidden profile markup/JS removed while chest remains')

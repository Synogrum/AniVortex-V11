const fs = require('fs');

let content = fs.readFileSync('c:/Anivortex/index.html', 'utf8');

// ============================================================
// Funcție care extrage un bloc HTML complet, respectând
// elementele nested (numără tag-urile deschise/închise)
// ============================================================
function extractBlock(html, startTag) {
    const startIdx = html.indexOf(startTag);
    if (startIdx === -1) return null;

    // Determină tagul de bază (ex: <div, <section)
    const tagMatch = startTag.match(/^<(\w+)/);
    if (!tagMatch) return null;
    const tagName = tagMatch[1];

    let depth = 0;
    let i = startIdx;

    while (i < html.length) {
        // Caută tag de deschidere
        const openIdx = html.indexOf(`<${tagName}`, i);
        const closeIdx = html.indexOf(`</${tagName}>`, i);

        if (closeIdx === -1) break;

        if (openIdx !== -1 && openIdx < closeIdx) {
            depth++;
            i = openIdx + 1;
        } else {
            depth--;
            i = closeIdx + `</${tagName}>`.length;
            if (depth === 0) {
                return {
                    text: html.substring(startIdx, i),
                    start: startIdx,
                    end: i
                };
            }
        }
    }

    return null;
}

const block1 = extractBlock(content, '<div class="chronologie-container">');
const block2 = extractBlock(content, '<section class="comentarii-section">');

if (block1 && block2) {
    // Swap corect: înlocuiește fiecare bloc cu celălalt
    const placeholder1 = '<!-- __BLOCK1_PLACEHOLDER__ -->';
    const placeholder2 = '<!-- __BLOCK2_PLACEHOLDER__ -->';

    content = content.replace(block1.text, placeholder1);
    content = content.replace(block2.text, placeholder2);
    content = content.replace(placeholder1, block2.text);
    content = content.replace(placeholder2, block1.text);

    fs.writeFileSync('c:/Anivortex/index.html', content, 'utf8');
    console.log('Swap successful');
} else {
    if (!block1) console.log('Block 1 (.chronologie-container) not found');
    if (!block2) console.log('Block 2 (.comentarii-section) not found');
}
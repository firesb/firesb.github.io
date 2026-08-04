const emojiMap = {
    '::bee': ['/fsb/EMOJIS/C_bee.png', 'The official FSB bee emoji!', '#f8a61c'],
};

// 2. The Regex (Handles optional \ and double-colon code)
const emojiRegex = /(\\?)(::[a-zA-Z0-9_]+)/g;

// 3. The Core Parsing Function
function parseEmojis(text) {
    if (!text) return "";

    return text.replace(emojiRegex, (match, escapeChar, shortcode) => {
        // If it starts with \, return just the shortcode (escaped)
        if (escapeChar === "\\") {
            return shortcode;
        }

        // If found in map, return the image tag
        if (emojiMap[shortcode]) {
            const [url, desc, color] = emojiMap[shortcode];
            return `<img src="${url}" 
                         class="custom-emoji" 
                         title='Emoji code: "${shortcode}", Description: "${desc}".' 
                         alt='Emoji code: "${shortcode}", Description: "${desc}".' 
                         style="background-color: transparent;">`;
        }

        // Otherwise, return original text
        return match;
    });
}

// 4. The Global Scanner (Finds <td>, <p>, <div>, etc.)
function initEmojiScanner() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToReplace = [];

    // Find all text nodes containing "::"
    while (node = walker.nextNode()) {
        if (node.nodeValue.includes('::')) {
            nodesToReplace.push(node);
        }
    }

    // Swap text for HTML
    nodesToReplace.forEach(textNode => {
        const originalText = textNode.nodeValue;
        const newHTML = parseEmojis(originalText);

        if (newHTML !== originalText) {
            const span = document.createElement('span');
            span.innerHTML = newHTML;
            textNode.parentNode.replaceChild(span, textNode);
        }
    });
}

// 5. Run after EVERYTHING loads (to ensure tables are ready)
window.addEventListener('load', initEmojiScanner);
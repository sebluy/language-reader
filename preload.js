// preload.js

const fs = require('fs');
const LanguageText = require('./language-text');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const path = '/home/sebluy/Documents/czech+greece/czech-language/hunger-games/hg-clean-ch1.txt'
    fs.readFile(path, (err, contents) => {
        new LanguageText(contents.toString())
    })
})
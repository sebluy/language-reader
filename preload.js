// preload.js

const fs = require('fs');
const LanguageText = require('./language-text');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    new LanguageText('')
})
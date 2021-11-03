// preload.js

const fs = require('fs');
const LanguageText = require('./language-text');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    fs.readFile('runtime-data.json', (err, contents) => {
        console.log(contents.toJSON())
        if (contents === undefined) {
            new LanguageText('')
            return
        }
        let openFile = JSON.parse(contents.toString()).openFile
        if (typeof openFile !== 'string') {
            new LanguageText('')
            return
        }
        fs.readFile(openFile, (err, contents) => {
            new LanguageText(contents.toString())
        })
    })
})
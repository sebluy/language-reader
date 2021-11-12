// preload.js

const fs = require('fs');
const SideBar = require('./side-bar');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    fs.readFile('runtime-data.json', (err, contents) => {
        if (contents === undefined) {
            SideBar.createView('', '')
            return
        }
        let openFile = JSON.parse(contents.toString()).openFile
        if (typeof openFile !== 'string') {
            SideBar.createView('', '')
            return
        }
        fs.readFile(openFile, (err, contents) => {
            if (err !== null) {
                SideBar.createView(openFile, '')
                return
            }
            SideBar.createView(openFile, contents.toString())
        })
    })
})
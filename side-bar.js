const fetch = require('node-fetch')
const { ipcRenderer } = require('electron')
const fs = require('fs')

module.exports = class SideBar {
    constructor(languageText) {
        this.languageText = languageText
        this.originalE = document.getElementById('original')
        this.definitionE = document.getElementById('definition')
        this.statsE = document.getElementById('stats')
        this.highlightCB = document.getElementById('highlight')
        this.googleTranslateB = document.getElementById('google-translate')
        this.updateStatsB = document.getElementById('update-stats')
        this.selectRandomB = document.getElementById('select-random')
        this.openFileB = document.getElementById('open-file')
        this.vocabMatchingB = document.getElementById('vocab-matching')
        this.fillInTheBlanksB = document.getElementById('fill-in-the-blanks')

        this.definitionE.addEventListener('focusout', () => this.updateWord())
        this.definitionE.addEventListener('keydown', (e) => this.nextWord(e))
        this.highlightCB.addEventListener('change', () => this.languageText.highlight())
        this.googleTranslateB.addEventListener('click', () => this.googleTranslate())
        this.updateStatsB.addEventListener('click', () => this.updateStats())
        this.selectRandomB.addEventListener('click', () => this.languageText.selectRandom())
        this.openFileB.addEventListener('click', () => this.openFile())
        this.vocabMatchingB.addEventListener('click', () => this.languageText.vocabMatching())
        this.fillInTheBlanksB.addEventListener('click', () => this.languageText.fillInTheBlanks())
    }

    updateWord() {
        const original = this.originalE.innerHTML
        const definition = this.definitionE.value
        this.languageText.updateWord(original, definition)
    }

    showWordAndDefinition(word, definition)
    {
        this.originalE.innerText = word
        this.definitionE.value = definition
        this.definitionE.focus()
    }

    isHighlightChecked() {
        return this.highlightCB.checked
    }

    nextWord(e) {
        if (e.key === 'Tab') {
            e.preventDefault()
            this.definitionE.blur()
            this.languageText.nextWord()
        }
    }

    googleTranslate() {
        const original = this.originalE.innerText
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=cs&tl=en&dt=t&q=' + original
        fetch(url).then(res => res.json()).then(res => {
            this.definitionE.value = res[0][0][0]
            this.definitionE.focus()
        })
    }

    updateStats() {
        let stats = this.languageText.updateStats()
        const percent = stats.countTranslated === 0 ? 0 : stats.countTranslated / stats.numberOfWords
        this.statsE.innerText =
            'Number of words: ' + stats.numberOfWords + "\n" +
            'Number of distinct words: ' + stats.numberOfDistinctWords + "\n" +
            'Number of translated words: ' + stats.countTranslated + "\n" +
            'Percent translated: ' + (percent * 100).toFixed(2) + '%' + "\n" +
            'Percent mastered: ' + ((1 - stats.mastered / stats.numberOfDistinctWords) * 100).toFixed(2) + '%'
    }

    openFile() {
        ipcRenderer.invoke('open-file').then((result) => {
            fs.readFile(result[0], (err, contents) => {
                this.languageText.loadText(contents.toString(), result[0])
                fs.writeFile('runtime-data.json', JSON.stringify({openFile: result[0]}), err => {})
            })
        })
    }

}
const fetch = require('node-fetch')
const { ipcRenderer } = require('electron')
const fs = require('fs')
const FillInTheBlanks = require('./fill-in-the-blanks')
const VocabularyMatching = require('./vocabulary-matching')
const Utility = require('./utility')
const LanguageText = require('./language-text')
const Reader = require('./reader')

module.exports = class SideBar {

    static createView(filename, text) {
        let languageText = new LanguageText(filename, text)
        let sidebar = new SideBar(languageText)
        sidebar.reader = new Reader(sidebar)
        sidebar.reader.load(languageText.filename, languageText.text)
        languageText.onUpdate = () => {
            sidebar.updateStats()
            sidebar.reader.highlight()
        }
    }

    constructor(languageText) {
        this.languageText = languageText

        this.originalE = document.getElementById('original')
        this.definitionE = document.getElementById('definition')
        this.statsE = document.getElementById('stats')
        this.highlightCB = document.getElementById('highlight')
        this.googleTranslateB = document.getElementById('google-translate')
        this.updateStatsB = document.getElementById('update-stats')
        this.openFileB = document.getElementById('open-file')
        this.readerB = document.getElementById('reader')
        this.vocabMatchingB = document.getElementById('vocab-matching')
        this.fillInTheBlanksB = document.getElementById('fill-in-the-blanks')
        this.audioE = document.getElementById('audio')

        this.definitionE.addEventListener('focusout', () => this.updateWord())
        this.definitionE.addEventListener('keydown', (e) => this.nextWord(e))
        this.highlightCB.addEventListener('change', () => this.reader.highlight())
        this.googleTranslateB.addEventListener('click', () => this.googleTranslate())
        this.updateStatsB.addEventListener('click', () => this.updateStats())
        this.openFileB.addEventListener('click', () => this.openFile())
        this.readerB.addEventListener('click', () => {
            this.reader.load(this.languageText.filename, this.languageText.text)
            this.reader.highlight()
        })
        this.vocabMatchingB.addEventListener('click', () => new VocabularyMatching(this))
        this.fillInTheBlanksB.addEventListener('click', () => new FillInTheBlanks(this))

        this.setAudio()
    }

    setAudio() {
        let currentTime = this.languageText.audio
        if (currentTime === undefined) return
        let [minutes, seconds] = currentTime.split(':')
        this.audioStart = parseInt(minutes) * 60 + parseInt(seconds)
        this.audioE.currentTime = this.audioStart
    }

    handleKey(e) {
        console.log(e)
        if (e.key === 'p') {
            if (this.audioE.paused) {
                this.audioE.play()
            } else {
                this.audioE.pause()
            }
        } else if (e.key === 'r') {
            this.audioE.currentTime = this.audioStart
        }
    }

    updateWord() {
        const original = this.originalE.innerHTML
        const definition = this.definitionE.value
        this.languageText.updateWord(original, definition)
        this.reader.updateHighlighting(original)
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
            this.reader.nextWord()
        }
        e.stopPropagation()
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
        let fp = (p) => (p * 100).toFixed(2) + '%'
        let newTable = Utility.createHTML(
            ['tbody',
                ['tr', ['td', 'Number of words'], ['td', stats.numberOfWords]],
                ['tr', ['td', 'Number of distinct words'], ['td', stats.numberOfDistinctWords]],
                ['tr', ['td', 'Percent translated'], ['td', fp(stats.percentTranslated)]],
                ['tr', ['td', 'Percent mastered'], ['td', fp(stats.percentMastered)]],
            ]
        )
        this.statsE.replaceChild(newTable, this.statsE.childNodes[0])
    }

    openFile() {
        ipcRenderer.invoke('open-file').then((result) => {
            fs.readFile(result[0], (err, contents) => {
                this.loadFile(result[0], contents.toString())
                fs.writeFile('runtime-data.json', JSON.stringify({openFile: result[0]}), err => {})
            })
        })
    }

    loadFile(filename, text) {
        this.languageText = new LanguageText(filename, text)
        this.reader.languageText = this.languageText
        this.reader.load(this.languageText.filename, this.languageText.text)
        this.languageText.onUpdate = () => {
            this.updateStats()
            this.reader.highlight()
        }
    }

}
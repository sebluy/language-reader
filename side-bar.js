const fetch = require('node-fetch')
const { ipcRenderer } = require('electron')
const fs = require('fs')
const FillInTheBlanks = require('./fill-in-the-blanks')
const VocabularyMatching = require('./vocabulary-matching')
const Utility = require('./utility')
const LanguageText = require('./language-text')
const Reader = require('./reader')
const Unscramble = require('./unscramble')

module.exports = class SideBar {

    constructor() {
        this.setElementsAndListeners()
        this.getRuntimeData((json) => {
            console.log(json)
            if (json.openTextFile) this.loadTextFile(json.openTextFile)
            if (json.openAudioFile) this.loadAudioFile(json.openAudioFile)
        })
    }

    setElementsAndListeners() {
        this.originalE = document.getElementById('original')
        this.definitionE = document.getElementById('definition')
        this.statsE = document.getElementById('stats')
        this.highlightCB = document.getElementById('highlight')
        this.googleTranslateB = document.getElementById('google-translate')
        this.updateStatsB = document.getElementById('update-stats')
        this.openTextFileB = document.getElementById('open-text-file')
        this.openAudioFileB = document.getElementById('open-audio-file')
        this.readerB = document.getElementById('reader')
        this.vocabMatchingB = document.getElementById('vocab-matching')
        this.fillInTheBlanksB = document.getElementById('fill-in-the-blanks')
        this.unscrambleB = document.getElementById('unscramble')
        this.audioE = document.getElementById('audio')

        this.definitionE.addEventListener('focusout', () => this.updateWord())
        this.definitionE.addEventListener('keydown', (e) => this.nextWord(e))
        this.highlightCB.addEventListener('change', () => this.reader.highlight())
        this.googleTranslateB.addEventListener('click', () => this.googleTranslate())
        this.updateStatsB.addEventListener('click', () => this.updateStats())
        this.openTextFileB.addEventListener('click', () => this.openTextFile())
        this.openAudioFileB.addEventListener('click', () => this.openAudioFile())
        this.readerB.addEventListener('click', () => {
            this.reader.load()
            this.reader.highlight()
        })
        this.vocabMatchingB.addEventListener('click', () => new VocabularyMatching(this))
        this.fillInTheBlanksB.addEventListener('click', () => new FillInTheBlanks(this))
        this.unscrambleB.addEventListener('click', () => new Unscramble(this))
    }

    setAudio(startTime, endTime = null) {
        this.audioStart = startTime
        this.audioEnd = endTime
        this.audioE.currentTime = startTime
    }

    playAudio() {
        clearTimeout(this.timeout)
        this.audioE.play()
        if (this.audioEnd) {
            let remaining = this.audioEnd - this.audioE.currentTime
            this.timeout = setTimeout(() => {
                this.audioE.currentTime = this.audioStart
                this.audioE.pause()
            }, remaining * 1000)
        }
    }

    handleKey(e) {
        console.log(e)
        if (e.key === 'p') {
            if (this.audioE.paused) {
                this.playAudio()
            } else {
                clearTimeout(this.timeout)
                this.audioE.pause()
            }
        } else if (e.key === 'r') {
            this.audioE.currentTime = this.audioStart
            this.playAudio()
        } else if (e.key === 'm') {
            this.markAudio()
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
                ['tr', ['td', 'Today\'s XP'], ['td', this.runtimeData.xp.today]],
                ['tr', ['td', 'Yesterday\'s XP'], ['td', this.runtimeData.xp.yesterday]]
            ]
        )
        this.statsE.replaceChild(newTable, this.statsE.childNodes[0])
    }

    openTextFile() {
        ipcRenderer.invoke('open-file').then((result) => {
            this.loadTextFile(result[0])
        })
    }

    openAudioFile() {
        ipcRenderer.invoke('open-file').then((result) => {
            this.loadAudioFile(result[0])
        })
    }

    loadAudioFile(filename) {
        this.audioE.src = filename
        this.runtimeData.openAudioFile = filename
        this.writeRuntimeData()
    }

    loadTextFile(filename) {
        fs.readFile(filename, (err, contents) => {
            if (err != null) return
            this.languageText = new LanguageText(this, filename, contents.toString())
            if (!this.reader) this.reader = new Reader(this)
            this.reader.languageText = this.languageText
            this.reader.load()
            this.runtimeData.openTextFile = filename
            this.writeRuntimeData()
        })
    }

    getRuntimeData(f) {
        fs.readFile('runtime-data.json', (err, contents) => {
            if (contents === undefined) {
                this.runtimeData = {}
            } else {
                this.runtimeData = JSON.parse(contents.toString())
            }
            if (this.runtimeData.xp === undefined) {
                this.runtimeData.xp = {
                    today: 0,
                    yesterday: 0,
                    date: (new Date()).toLocaleDateString()
                }
            } else if (this.runtimeData.xp.date !== (new Date()).toLocaleDateString()) {
                this.runtimeData.xp.yesterday = this.runtimeData.xp.today
                this.runtimeData.xp.today = 0
                this.runtimeData.xp.date = (new Date()).toLocaleDateString()
                this.writeRuntimeData()
            }
            f(this.runtimeData)
        })
    }

    addXP(n) {
        this.runtimeData.xp.today += n
        this.writeRuntimeData()
    }

    writeRuntimeData() {
        fs.writeFile('runtime-data.json', JSON.stringify(this.runtimeData), err => {})
    }

    markAudio() {
        let sentences = Array.from(this.languageText.sentences.keys())
        if (this.marker === undefined) {
            this.audioE.play()
            this.marker = 0
        }
        if (this.marker > 0) {
            let lastSentence = this.languageText.sentences.get(sentences[this.marker - 1])
            this.languageText.updateSentenceTimes(lastSentence, null, this.audioE.currentTime)
            this.reader.removeSentenceHighlighting(lastSentence)
        }
        if (this.marker === sentences.length) {
            this.audioE.pause()
            this.marker = undefined
            return
        }
        let sentence = this.languageText.sentences.get(sentences[this.marker])
        this.reader.highlightSentence(sentence)
        this.languageText.updateSentenceTimes(sentence, this.audioE.currentTime, null)
        this.marker += 1
    }

}
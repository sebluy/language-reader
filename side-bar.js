// const FillInTheBlanks = require('./fill-in-the-blanks')
import { VocabularyMatching } from './vocabulary-matching.js'
import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Reader } from './reader.js'
import { Unscramble } from './unscramble.js'
import { LanguageDb } from './language-db.js'

// TODO: add a README with a link to the github page
// TODO: allow timestamps for sentences to be edited in gui
// TODO: rename column "original" to "word"
// TODO: Fix the span thing with clicking.
// TODO: Page the reader

// TODO: change export to CSV
// TODO: change fetch/update to get/set
// TODO: Update the styling to be more pretty/modern.
// TODO: use async/await more
// TODO: fix favicon error
/* TODO: come up with a better way than just random. Some progression through the exercises or something.
     Think a lesson, instead of just random exercises.
     Maybe a 5 stage Leitner system.
     Vocab - Each word goes through 5 levels until mastered. Random from lowest level.
     Unscramble - Each sentence goes through 5 levels until mastered. In order.
     Fill in the blanks - Each sentence goes through 5 levels until mastered. In order.
     Mastery = 1/3 of each.
*/
// TODO: Have someway to show the answer if you're wrong.
// TODO: use an actual dictionary instead of google translate

class SideBar {

    constructor() {
        this.highlightingOn = false
        this.db = new LanguageDb()
        this.setElementsAndListeners()
        this.load()
    }

    async load() {
        let runtimeData = await this.db.getRuntimeData()
        console.log(runtimeData)
        this.runtimeData = runtimeData
        if (runtimeData.openTextFile) {
            let text = await this.db.getTextFile()
            this.loadTextFile(text)
        }
        if (runtimeData.openAudioFile) {
            let audio = await this.db.getAudioFile()
            this.loadAudioFile(audio)
        }
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
        // this.fillInTheBlanksB = document.getElementById('fill-in-the-blanks')
        this.unscrambleB = document.getElementById('unscramble')
        this.exportB = document.getElementById('export')
        this.importB = document.getElementById('import')
        this.audioE = document.getElementById('audio')

        this.definitionE.addEventListener('focusout', () => this.updateDefinition())
        this.definitionE.addEventListener('keydown', (e) => this.nextWord(e))
        this.highlightCB.addEventListener('click', () => {
            this.highlightingOn = !this.highlightingOn
            this.reader.highlight()
        })
        this.googleTranslateB.addEventListener('click', () => this.googleTranslate())
        this.updateStatsB.addEventListener('click', () => this.updateStats())
        this.openTextFileB.addEventListener('click', () => this.openTextFile())
        this.openAudioFileB.addEventListener('click', () => this.openAudioFile())
        this.readerB.addEventListener('click', () => {
            this.reader.load()
            this.reader.highlight()
        })
        this.vocabMatchingB.addEventListener('click', () => new VocabularyMatching(this))
        // this.fillInTheBlanksB.addEventListener('click', () => new FillInTheBlanks(this))
        this.unscrambleB.addEventListener('click', () => new Unscramble(this))
        this.exportB.addEventListener('click', () => this.exportDatabase())
        this.importB.addEventListener('click', () => this.importDatabase())
    }

    setAudio(startTime, endTime = null) {
        this.audioStart = startTime
        this.audioEnd = endTime
        if (this.audioStart !== undefined) this.audioE.currentTime = startTime
    }

    playAudio() {
        // TODO: Fix playback for 0
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
        if (e.key === 'p') {
            if (this.audioE.paused) {
                this.playAudio()
            } else {
                clearTimeout(this.timeout)
                this.audioE.pause()
            }
        } else if (e.key === 'r') {
            if (this.audioStart) this.audioE.currentTime = this.audioStart
            this.playAudio()
        } else if (e.key === 'm') {
            this.markAudio()
        }
    }

    updateDefinition() {
        const original = this.originalE.innerHTML
        const definition = this.definitionE.value
        this.languageText.updateDefinition(original, definition)
        this.reader.updateHighlighting(original)
    }

    showWordAndDefinition(word, definition)
    {
        this.originalE.innerText = word
        this.definitionE.value = definition
        this.definitionE.focus()
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
                ['tr', ['td', 'Total Words Translated'], ['td', stats.totalWordsTranslated]],
                ['tr', ['td', 'Words mastered'], ['td', fp(stats.percentWordsMastered)]],
                ['tr', ['td', 'Sentences mastered'], ['td', fp(stats.percentSentencesMastered)]],
                ['tr', ['td', 'Today\'s XP'], ['td', this.runtimeData.xp.today]],
                ['tr', ['td', 'Yesterday\'s XP'], ['td', this.runtimeData.xp.yesterday]]
            ]
        )
        this.statsE.replaceChild(newTable, this.statsE.childNodes[0])
    }

    openTextFile() {
        Utility.upload((file) => {
            file.text().then((text) => {
                this.runtimeData.openTextFile = file.name
                this.db.putRuntimeData(this.runtimeData)
                this.db.putTextFile(text)
                this.loadTextFile(text)
            })
        })
    }

    loadTextFile(text) {
        if (text === undefined) return
        this.languageText = new LanguageText(this, this.runtimeData.openTextFile, text)
        if (!this.reader) this.reader = new Reader(this)
        this.reader.languageText = this.languageText
        this.reader.load()
    }

    openAudioFile() {
        Utility.upload((file) => {
            this.runtimeData.openAudioFile = file.name
            this.db.putRuntimeData(this.runtimeData)
            this.db.putAudioFile(file)
            this.loadAudioFile(URL.createObjectURL(file))
        })
    }

    loadAudioFile(url) {
        if (url === undefined) return
        if (url instanceof File) {
            let reader = new FileReader();
            reader.readAsDataURL(url)
            reader.onload = () => {
                this.audioE.src = reader.result
            }
        } else {
            this.audioE.src = url
        }
    }

    addXP(n) {
        this.runtimeData.xp.today += n
        this.db.putRuntimeData(this.runtimeData)
    }

    markAudio() {
        let sentences = this.languageText.sentences
        if (this.marker === undefined) {
            this.audioE.play()
            this.marker = 0
        }
        if (this.marker > 0) {
            let lastSentence = sentences[this.marker - 1]
            let lastData = this.languageText.sentenceMap.get(lastSentence.sentence)
            this.languageText.updateSentenceTimes(lastData, null, this.audioE.currentTime)
            this.reader.removeSentenceHighlighting(this.marker - 1)
        }
        if (this.marker === sentences.length) {
            this.audioE.pause()
            this.marker = undefined
            return
        }
        let sentence = sentences[this.marker]
        let sentenceData = this.languageText.sentenceMap.get(sentence.sentence)
        this.reader.highlightSentence(this.marker)
        this.languageText.updateSentenceTimes(sentenceData, this.audioE.currentTime, null)
        this.marker += 1
    }

    exportDatabase() {
        this.db.export()
            .then(db => Utility.download('language-db.json', JSON.stringify(db)))
    }

    importDatabase() {
        Utility.uploadText((name, db) => {
            this.db.import(JSON.parse(db)).then(() => this.load())
        })
    }

}

new SideBar()

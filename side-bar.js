// const FillInTheBlanks = require('./fill-in-the-blanks')
import { VocabularyMatching } from './vocabulary-matching.js'
import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Reader } from './reader.js'
import { Unscramble } from './unscramble.js'
import { LanguageDb } from './language-db.js'

// TODO: handle nested quotes
// TODO: create new widgets or reuse
// TODO: Fix the span thing with clicking.
// TODO: Store trimmed sentences
// TODO: play audio at first sentence in reader

// TODO: Fix sentence parsing for songs
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
// TODO: make it mobile friendly
// TODO: find a way to sync with multiple clients

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
        this.wordE = document.getElementById('word')
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
        this.audioStartE = document.getElementById('audio-start')
        this.audioEndE = document.getElementById('audio-end')
        this.previousPageE = document.getElementById('previous-page')
        this.nextPageE = document.getElementById('next-page')
        this.checkAnswerE = document.getElementById('check-answer')

        document.addEventListener('keydown', (e) => this.handleKey(e))
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
            this.showReader()
            this.reader.highlight()
        })
        this.vocabMatchingB.addEventListener('click', () => this.showVocabularyMatching())
        // this.fillInTheBlanksB.addEventListener('click', () => new FillInTheBlanks(this))
        this.unscrambleB.addEventListener('click', () => this.showUnscramble())
        this.exportB.addEventListener('click', () => this.exportDatabase())
        this.importB.addEventListener('click', () => this.importDatabase())
        this.audioStartE.addEventListener('focusout', () => this.updateAudioTimes())
        this.audioEndE.addEventListener('focusout', () => this.updateAudioTimes())
        this.previousPageE.addEventListener('click', (e) => this.changePageBy(-1))
        this.nextPageE.addEventListener('click', (e) => this.changePageBy(1))
        this.checkAnswerE.addEventListener('click', (e) => this.unscramble.checkAnswer())
    }

    setAudio(startTime, endTime = null) {
        this.audioStart = startTime
        this.audioEnd = endTime
        if (this.audioStart !== undefined) this.audioE.currentTime = startTime
        clearTimeout(this.timeout)
        this.audioE.pause()
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
        const word = this.wordE.innerHTML
        const definition = this.definitionE.value
        this.languageText.updateDefinition(word, definition)
        this.reader.updateHighlighting(word)
    }

    showWord(word)
    {
        this.wordE.innerText = word.word
        this.definitionE.value = word.definition
        this.definitionE.focus()
    }

    showSentence(sentence)
    {
        if (sentence === undefined) {
            this.currentSentence = undefined
            this.audioStartE.value = this.audioEndE.value = ''
            return
        }
        this.currentSentence = sentence
        this.audioStartE.value = sentence.startTime === undefined ? '' : sentence.startTime.toFixed(1)
        this.audioEndE.value = sentence.endTime === undefined ? '' : sentence.endTime.toFixed(1)
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
        const word = this.wordE.innerText
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=cs&tl=en&dt=t&q=' + word
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
                this.runtimeData.currentPage = 0
                this.db.putRuntimeData(this.runtimeData)
                this.db.putTextFile(text)
                this.loadTextFile(text)
            })
        })
    }

    loadTextFile(text) {
        if (text === undefined) return
        this.languageText = new LanguageText(
            this,
            this.runtimeData.openTextFile,
            text,
            this.runtimeData.currentPage
        )
        this.showReader()
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

    parseTime(str) {
        if (str === '') return undefined
        return Number.parseFloat(str)
    }

    updateAudioTimes() {
        if (this.currentSentence === undefined) return

        let start = this.parseTime(this.audioStartE.value)
        let end = this.parseTime(this.audioEndE.value)

        if (!Number.isNaN(start)) this.currentSentence.startTime = start
        if (!Number.isNaN(end)) this.currentSentence.endTime = end

        this.setAudio(this.currentSentence.startTime, this.currentSentence.endTime)
        this.languageText.updateSentence(this.currentSentence)
    }

    showReader() {
        this.reader = new Reader(this)
        this.updateSidebar(this.reader)
    }

    showUnscramble() {
        this.unscramble = new Unscramble(this)
        this.updateSidebar(this.unscramble)
    }

    showVocabularyMatching() {
        let activity = new VocabularyMatching(this)
        this.updateSidebar(activity)
    }

    showElement(element, show) {
        element.style.display = show ? '' : 'none'
    }

    updateSidebar(activity) {
        let r = activity instanceof Reader
        let us = activity instanceof Unscramble
        this.showElement(this.wordE, r || us)
        this.showElement(this.definitionE, r || us)
        this.showElement(this.googleTranslateB, r || us)
        this.showElement(this.audioE, r || us)
        this.showElement(this.highlightCB, r)
        this.showElement(this.previousPageE, r)
        this.showElement(this.nextPageE, r)
        this.showElement(this.audioStartE, us)
        this.showElement(this.audioEndE, us)
        this.showElement(this.checkAnswerE, us)
    }

    changePageBy(n) {
        this.runtimeData.currentPage += n
        this.db.putRuntimeData(this.runtimeData)
        this.languageText.setPage(this.runtimeData.currentPage)
        this.reader = new Reader(this)
    }

}

new SideBar()

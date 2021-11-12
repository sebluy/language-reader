const Utility = require('./utility')
const LanguageDB = require('./language-db')

module.exports = class LanguageText {

    constructor(filename, text) {
        this.db = new LanguageDB()
        this.words = new Map()
        this.filename = filename
        this.text = text
        this.audio = this.extractAudio()
        this.onUpdate = () => {}
        this.cleanText()
        this.extractWords()
        this.extractSentences()
    }

    extractAudio() {
        let match = this.text.match(/<audio>([\d:]+)<\/audio>\n/)
        if (match === null) return null
        this.text = this.text.replace(match[0], '')
        let [minutes, seconds] = match[1].split(':')
        return parseInt(minutes) * 60 + parseInt(seconds)
    }

    cleanWord(word) {
        const punctuation = /[,.!?"“„:\-–;]+/
        const regex = new RegExp('^' + punctuation.source + '|' + punctuation.source + '$', 'g')
        return word.replaceAll(regex, '').toLowerCase()
    }

    cleanText() {
        this.text = this.text.replaceAll('-\n', '')
        this.text = this.text.replaceAll('\n', ' ')
        this.text = this.text.replaceAll('\t', '\n\t')
    }

    extractWords() {
        const words = this.text.split(/\s+/)
        words.forEach((word) => {
            word = this.cleanWord(word)
            if (word === '') return
            if (this.words.has(word)) {
                this.words.get(word).count += 1
            } else {
                this.words.set(word, {
                    mastery: 1.0,
                    definition: '',
                    count: 1,
                })
            }
        })
        this.db.fetchWords((rows) => {
            rows.forEach((row) => {
                if (!this.words.has(row.original)) return
                let wordData = this.words.get(row.original)
                wordData.definition = row.definition
                wordData.mastery = row.mastery
            })
            this.onUpdate()
        })
    }

    updateWord(word, definition) {
        console.log(word, definition)
        const wordData = this.words.get(word)
        wordData.definition = definition
        console.log('Updating definition... for ' + word + ' to ' + definition)
        this.db.updateWord(word, definition)
    }

    updateMastery(word, success) {
        let data = this.words.get(word)
        data.mastery = success ? (data.mastery / 2) : 1
        this.db.updateMastery(word, data.mastery)
    }

    updateStats() {
        let countTranslated = 0
        let mastered = 0
        let numberOfWords = 0
        this.words.forEach((data) => {
            mastered += data.mastery
            numberOfWords += data.count
            if (data.definition === '') return
            countTranslated += data.count
        })
        let percentTranslated = countTranslated === 0 ? 0 : countTranslated / numberOfWords
        let percentMastered = 1 - (mastered / this.words.size)
        return {
            numberOfWords: numberOfWords,
            numberOfDistinctWords: this.words.size,
            percentTranslated: percentTranslated,
            percentMastered: percentMastered,
        }
    }

    extractSentences() {
        let i = 0;
        this.sentences = new Map()
        while (true) {
            let endPos = Utility.nextEndPos(this.text, i);
            if (endPos === false) break
            let text = (this.text).substring(i, endPos + 1);
            this.sentences.set(text, {text: text})
            i = endPos + 1
        }
        this.db.fetchSentences((rows) => {
            rows.forEach((row) => {
                if (!this.sentences.has(row.sentence)) return
                let sentence = this.sentences.get(row.sentence)
                sentence.startTime = row.startTime
                sentence.endTime = row.endTime
            })
        })
    }

    getRandomSentenceBlock(n)
    {
        let sentences = Array.from(this.sentences.keys())
        let sentenceIndex = Math.floor(Math.random() * (sentences.length - n))
        let block = []
        for (let i = 0; i < n; i++) {
            let sentence = sentences[sentenceIndex + i]
            let sentenceData = this.sentences.get(sentence)
            sentenceData.words = new Map()
            let words = sentenceData.text.split(/\s+/)
            words.forEach((word) => {
                word = this.cleanWord(word)
                if (word === '') return
                if (!sentenceData.words.has(word)) {
                    sentenceData.words.set(word, this.words.get(word))
                }
            })
            block.push(sentenceData)
        }
        return block
    }

    updateSentenceTimes(sentence, startTime, endTime)
    {
        if (startTime !== null) sentence.startTime = startTime
        if (endTime !== null) sentence.endTime = endTime
        this.db.updateSentenceTimes(sentence)
    }

}
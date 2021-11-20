const Utility = require('./utility')
const LanguageDB = require('./language-db')

module.exports = class LanguageText {

    constructor(sidebar, filename, text) {
        this.sidebar = sidebar
        this.db = new LanguageDB()
        this.words = new Map()
        this.filename = filename
        this.text = text
        this.audio = this.extractAudio()
        this.cleanText()
        this.extractSentences()
        this.extractWords()
    }

    extractAudio() {
        let match = this.text.match(/<audio>([\d:]+)<\/audio>\n/)
        if (match === null) return null
        this.text = this.text.replace(match[0], '')
        let [minutes, seconds] = match[1].split(':')
        return parseInt(minutes) * 60 + parseInt(seconds)
    }

    cleanText() {
        this.text = this.text.replaceAll('-\n', '')
        this.text = this.text.replaceAll('\n', ' ')
        this.text = this.text.replaceAll('\t', '\n\t')
    }

    extractWords() {
        this.sentences.forEach((sentence) => {
            const words = sentence.text.split(/\s+/)
            words.forEach((word) => {
                word = Utility.cleanWord(word)
                if (word === '') return
                if (this.words.has(word)) {
                    this.words.get(word).count += 1
                } else {
                    this.words.set(word, {
                        word: word,
                        mastery: 0,
                        definition: '',
                        count: 1,
                    })
                }
            })
        })
        this.db.fetchWords((rows) => {
            rows.forEach((row) => {
                if (!this.words.has(row.original)) return
                let wordData = this.words.get(row.original)
                wordData.definition = row.definition
                wordData.mastery = row.mastery
            })
            this.sidebar.updateStats()
            this.sidebar.reader.highlight()
        })
    }

    updateWord(word, definition) {
        const wordData = this.words.get(word)
        if (wordData.definition === definition) return
        if (wordData.definition === '') this.sidebar.addXP(5)
        wordData.definition = definition
        console.log('Updating definition... for ' + word + ' to ' + definition)
        this.db.updateWord(word, definition)
    }

    updateMastery(word) {
        let data = this.words.get(word)
        if (data.mastery === 5) return
        data.mastery += 1
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
        let percentMastered = mastered / (this.words.size * 5)
        return {
            numberOfWords: numberOfWords,
            numberOfDistinctWords: this.words.size,
            percentTranslated: percentTranslated,
            percentMastered: percentMastered,
        }
    }

    extractSentences() {
        let i = 0;
        this.sentences = []
        this.sentenceMap = new Map()
        while (true) {
            let endPos = Utility.nextEndPos(this.text, i);
            let text = (this.text).substring(i, endPos === false ? undefined : endPos + 1)
            this.sentences.push({text: text})
            this.sentenceMap.set(text, {text: text})
            if (endPos === false) break
            i = endPos + 1
        }
        this.db.fetchSentences((rows) => {
            rows.forEach((row) => {
                if (!this.sentenceMap.has(row.sentence)) return
                let sentence = this.sentenceMap.get(row.sentence)
                sentence.startTime = row.startTime
                sentence.endTime = row.endTime
            })
        })
    }

    getRandomSentenceBlock(n)
    {
        let sentenceIndex = Math.floor(Math.random() * (this.sentences.length - n))
        let block = []
        for (let i = 0; i < n; i++) {
            let sentenceData = this.sentences[sentenceIndex + i]
            sentenceData.words = new Map()
            let words = sentenceData.text.split(/\s+/)
            words.forEach((word) => {
                word = Utility.cleanWord(word)
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
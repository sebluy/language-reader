const Utility = require('./utility')

module.exports = class LanguageText {

    constructor(sidebar, filename, text) {
        this.sidebar = sidebar
        // this.db = new LanguageDB()
        this.db = sidebar.db
        // this.db.export((db) => {
        //     this.db2.import(db)
        //     this.db2.export(console.log)
        // })
        this.words = new Map()
        this.filename = filename
        this.text = text
        this.cleanText()
        this.extractSentences()
        this.extractWords()
    }

    cleanText() {
        this.text = this.text.replaceAll('-\n', '')
    }

    extractWords() {
        this.sentences.forEach((sentence) => {
            const words = sentence.sentence.split(/\s+/)
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
                if (!this.words.has(row.word)) return
                let wordData = this.words.get(row.word)
                wordData.definition = row.definition
                wordData.mastery = row.mastery
            })
            this.totalWordsTranslated = rows.length
            this.sidebar.updateStats()
            this.sidebar.reader.highlight()
            this.sidebar.reader.setAudio()
        })
    }

    updateDefinition(word, definition) {
        const wordData = this.words.get(word)
        if (wordData.definition === definition) return
        if (wordData.definition === '') this.sidebar.addXP(5)
        wordData.definition = definition
        console.log('Updating definition... for ' + word + ' to ' + definition)
        this.db.updateWords([wordData])
    }

    updateMastery(words) {
        words = words.map((word) => {
            let data = this.words.get(word)
            if (data.mastery === 5) return
            data.mastery += 1
            return data
        })
        this.db.updateWords(words)
    }

    updateSentenceMastery(sentence) {
        let data = this.sentenceMap.get(sentence)
        if (data.mastery === 5) return
        data.mastery += 1
        this.db.updateSentence(data)
    }

    updateStats() {
        let countTranslated = 0
        let wMastered = 0
        let numberOfWords = 0
        this.words.forEach((data) => {
            wMastered += data.mastery
            numberOfWords += data.count
            if (data.definition === '') return
            countTranslated += data.count
        })
        let sMastered = 0
        this.sentenceMap.forEach((data) => {
            sMastered += data.mastery
        })
        let percentTranslated = countTranslated === 0 ? 0 : countTranslated / numberOfWords
        let percentWMastered = wMastered / (this.words.size * 5)
        let percentSMastered = sMastered / (this.sentenceMap.size * 5)
        return {
            numberOfWords: numberOfWords,
            numberOfDistinctWords: this.words.size,
            totalWordsTranslated: this.totalWordsTranslated,
            percentTranslated: percentTranslated,
            percentWordsMastered: percentWMastered,
            percentSentencesMastered: percentSMastered,
        }
    }

    extractSentences() {
        let i = 0;
        this.sentences = []
        this.sentenceMap = new Map()
        while (true) {
            let endPos = Utility.nextEndPos(this.text, i);
            let text = (this.text).substring(i, endPos === false ? undefined : endPos + 1)
            if (text === '') break
            let sentence = {sentence: text, mastery: 0}
            this.sentences.push(sentence)
            this.sentenceMap.set(text, sentence)
            if (endPos === false) break
            i = endPos + 1
        }
        this.db.fetchSentences((rows) => {
            rows.forEach((row) => {
                if (!this.sentenceMap.has(row.sentence)) return
                let sentence = this.sentenceMap.get(row.sentence)
                sentence.startTime = row.startTime
                sentence.endTime = row.endTime
                // TODO: write mastery as 0 to begin with
                if (row.mastery !== null) sentence.mastery = row.mastery
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
            let words = sentenceData.sentence.split(/\s+/)
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
        this.db.updateSentence(sentence)
    }

    getNextSentenceByMastery() {
        let values = Array.from(this.sentenceMap.values())
        if (values.length === 0) return null
        let mastery = values.map((v) => v.mastery)
        let minimum = Math.min(...mastery)
        return this.sentences.find((sentence) => {
            return this.sentenceMap.get(sentence.sentence).mastery === minimum
        })
    }

}
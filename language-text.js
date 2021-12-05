import { Utility } from './utility.js'

export class LanguageText {

    constructor(sidebar, filename, text, currentPage) {
        this.sidebar = sidebar
        this.db = sidebar.db
        this.filename = filename
        this.pages = this.extractPages(text)
        this.text = this.pages[currentPage]
        this.extractSentences()
        this.extractWords()
    }

    setPage(n) {
        this.text = this.pages[n]
        this.extractSentences()
        this.extractWords()
    }

    extractPages(text) {
        let idealLength = 1000
        let pages = []
        let pageStart = 0
        let lastTab = 0
        let nextTab = 0
        let i = 0
        while (true) {
            i++
            if (i === 1000) break
            nextTab = text.indexOf("\t", lastTab + 1)
            if (nextTab === -1) {
                pages.push(text.substring(pageStart))
                break
            }
            if (nextTab - pageStart > idealLength) {
                let diffA = Math.abs(lastTab - pageStart - idealLength)
                let diffB = Math.abs(nextTab - pageStart - idealLength)
                let pageEnd = diffA < diffB ? lastTab : nextTab
                pages.push(text.substring(pageStart, pageEnd))
                pageStart = pageEnd
            }
            lastTab = nextTab
        }
        return pages
    }

    extractWords() {
        this.words = new Map()
        this.sentences.forEach((sentence) => {
            const words = sentence.raw.split(/\s+/)
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
        let promises = Array.from(this.words).map(([word, wordData]) => {
            return this.db.getWord(word).then(row => {
                if (row === undefined) return
                wordData.definition = row.definition
                wordData.mastery = row.mastery
            })
        })
        promises.push(this.db.getNumberOfWords().then(n => this.totalWordsTranslated = n))
        Promise.all(promises).then(() => {
            this.sidebar.updateStats()
            this.sidebar.reader.highlight()
        })
    }

    updateDefinition(word, definition) {
        const wordData = this.words.get(word)
        if (wordData.definition === definition) return
        if (wordData.definition === '') {
            this.totalWordsTranslated += 1
            this.sidebar.addXP(5)
        }
        wordData.definition = definition
        console.log('Updating definition... for ' + word + ' to ' + definition)
        this.db.putWords([wordData])
    }

    updateMastery(words) {
        words = words.map((word) => {
            let data = this.words.get(word)
            if (data.mastery === 5) return
            data.mastery += 1
            return data
        })
        this.db.putWords(words)
    }

    updateSentenceMastery(sentence) {
        let data = this.sentenceMap.get(sentence)
        if (data.mastery === 5) return
        data.mastery += 1
        this.db.putSentence(data)
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
        if (this.text === undefined) this.text = ''
        this.sentences = []
        this.sentenceMap = new Map()
        while (true) {
            let endPos = Utility.nextEndPos(this.text, i);
            let text = (this.text).substring(i, endPos === false ? undefined : endPos + 1)
            if (text === '') break
            let clean = text.trim()
            this.sentences.push({raw: text, clean: clean})
            this.sentenceMap.set(clean, {sentence: clean, mastery: 0})
            if (endPos === false) break
            i = endPos + 1
        }
        this.sentenceMap.forEach(sentence => {
            this.db.getSentence(sentence.sentence).then(row => {
                if (row === undefined) return
                sentence.startTime = row.startTime
                sentence.endTime = row.endTime
                sentence.mastery = row.mastery
            })
        })
    }

    // getRandomSentenceBlock(n)
    // {
    //     let sentenceIndex = Math.floor(Math.random() * (this.sentences.length - n))
    //     let block = []
    //     for (let i = 0; i < n; i++) {
    //         let sentenceData = this.sentences[sentenceIndex + i]
    //         sentenceData.words = new Map()
    //         let words = sentenceData.sentence.split(/\s+/)
    //         words.forEach((word) => {
    //             word = Utility.cleanWord(word)
    //             if (word === '') return
    //             if (!sentenceData.words.has(word)) {
    //                 sentenceData.words.set(word, this.words.get(word))
    //             }
    //         })
    //         block.push(sentenceData)
    //     }
    //     return block
    // }

    updateSentenceTimes(sentence, startTime, endTime)
    {
        if (startTime !== null) sentence.startTime = startTime
        if (endTime !== null) sentence.endTime = endTime
        this.db.putSentence(sentence)
    }

    updateSentence(sentence)
    {
        this.sentenceMap.set(sentence.sentence, sentence)
        this.db.putSentence(sentence)
    }

    getNextSentenceByMastery() {
        let values = Array.from(this.sentenceMap.values())
        if (values.length === 0) return null
        let mastery = values.map((v) => v.mastery)
        let minimum = Math.min(...mastery)
        for (let i in this.sentences) {
            let sentenceO = this.sentenceMap.get(this.sentences[i].clean)
            if (sentenceO.mastery === minimum) return sentenceO
        }
    }

}
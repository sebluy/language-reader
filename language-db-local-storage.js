const Utility = require('./utility')

module.exports = class LanguageDBLocalStorage {

    constructor() {
        this.db = localStorage
    }

    fetchWords(cb) {
        let json = this.db.getItem('words')
        this.words = JSON.parse(json)
        this.wordsIndex = new Map()
        this.words.forEach((word, i) => {
            this.wordsIndex.set(word.word, i)
        })
        setTimeout(() => cb(this.words), 0)
    }

    fetchSentences(cb) {
        this.sentences = JSON.parse(this.db.getItem('sentences'))
        setTimeout(() => cb(this.sentences), 0)
    }

    updateDefinition(word, definition) {
        let row = this.words.find((row) => row.word === word)
        if (row === undefined) {
            row = {word: word}
            this.words.push({word: word})
        }
        row.definition = definition
        this.db.setItem('words', JSON.stringify(this.words))
    }

    updateWords(words) {
        words.forEach((word) => {
            let index = this.wordsIndex.get(word.word)
            this.words[index] = word
        })
        this.db.setItem('words', JSON.stringify(this.words))
    }

    updateSentenceMastery(sentence, mastery) {
        let row = this.sentences.find((row) => row.sentence === sentence)
        row.mastery = mastery
        this.db.setItem('sentences', JSON.stringify(this.sentences))
    }

    updateSentenceTimes(sentence) {
        let row = this.sentences.find((row) => row.sentence === sentence.text)
        if (row === undefined) {
            row = {sentence: sentence.text}
            this.sentences.push(row)
        }
        row.startTime = sentence.startTime
        row.endTime = sentence.endTime
        this.db.setItem('sentences', JSON.stringify(this.sentences))
    }

    import(db) {
        this.words = db.words
        this.sentences = db.sentences
        this.db.setItem('words', JSON.stringify(this.words))
        this.db.setItem('sentences', JSON.stringify(this.sentences))
    }

    export(cb) {
        cb({words: this.words, sentences: this.sentences})
    }

}
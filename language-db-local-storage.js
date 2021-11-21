const Utility = require('./utility')

module.exports = class LanguageDBLocalStorage {

    constructor() {
        this.db = localStorage
    }

    fetchWords(cb) {
        let json = this.db.getItem('words')
        this.words = JSON.parse(json)
        this.wordIndex = new Map()
        this.words.forEach((word, i) => {
            if (word.mastery === undefined) word.mastery = 0
            this.wordIndex.set(word.word, i)
        })
        setTimeout(() => cb(this.words), 0)
    }

    fetchSentences(cb) {
        this.sentences = JSON.parse(this.db.getItem('sentences'))
        this.sentenceIndex = new Map()
        this.sentences.forEach((sentence, i) => {
            if (sentence.mastery === undefined) sentence.mastery = 0
            this.sentenceIndex.set(sentence.sentence, i)
        })
        setTimeout(() => cb(this.sentences), 0)
    }

    updateWords(words) {
        words.forEach((word) => {
            if (this.wordIndex.has(word.word)) {
                let index = this.wordIndex.get(word.word)
                this.words[index] = word
            } else {
                this.words.push(word)
                this.wordIndex.set(word.word, this.words.length - 1)
            }
        })
        this.db.setItem('words', JSON.stringify(this.words))
    }

    updateSentence(sentence) {
        if (this.sentenceIndex.has(sentence.sentence)) {
            let index = this.sentenceIndex.get(sentence.sentence)
            this.sentences[index] = sentence
            console.log(index, sentence)
        } else {
            this.sentences.push(sentence)
            this.sentenceIndex.set(sentence.sentence, this.sentences.length - 1)
        }
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
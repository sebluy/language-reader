import {Benchmark} from "./benchmark.js";

export class LanguageDb {

    constructor() {
        this.words = localforage.createInstance({name: 'words'})
        this.sentences = localforage.createInstance({name: 'sentences'})
        this.other = localforage.createInstance({name: 'other'})
    }

    fetchWord(word, cb) {
        return this.words.getItem(word, cb)
    }

    fetchSentence(sentence, cb) {
        return this.sentences.getItem(sentence, cb)
    }

    fetchNumberOfWords() {
        return this.words.length()
    }

    updateWords(words) {
        return Promise.all(words.map(word => {
            return this.words.setItem(word.word, word)
        }))
    }

    updateSentence(sentence) {
        this.sentences.setItem(sentence.sentence, sentence)
    }

    async import(db) {
        await this.words.clear()
        await this.sentences.clear()
        await this.other.removeItem('runtimeData')

        console.log('importing words')
        let now = Benchmark.now()
        await this.updateWords(db.words)
        console.log(Benchmark.diff(now), db.words.length)
        console.log('done importing words')
        console.log('importing sentences')
        await Promise.all(db.sentences.map(sentence => this.updateSentence(sentence)))
        console.log('done importing sentences')
        await this.other.setItem('runtimeData', db.runtimeData)
        console.log('done import')
        return 'done'
    }

    async export() {
        let words = []
        let sentences = []
        await this.words.iterate((word) => { words.push(word) })
        await this.sentences.iterate((sentence) => { sentences.push(sentence) })
        let runtimeData = await this.fetchRuntimeData()
        return {runtimeData, sentences, words}
    }

    async fetchRuntimeData() {
        let runtimeData = await this.other.getItem('runtimeData')
        if (runtimeData === null) runtimeData = {}
        if (runtimeData.xp === undefined) {
            runtimeData.xp = {
                today: 0,
                yesterday: 0,
                date: (new Date()).toLocaleDateString()
            }
        } else if (runtimeData.xp.date !== (new Date()).toLocaleDateString()) {
            runtimeData.xp.yesterday = runtimeData.xp.today
            runtimeData.xp.today = 0
            runtimeData.xp.date = (new Date()).toLocaleDateString()
            this.updateRuntimeData(runtimeData)
        }
        return runtimeData
    }

    updateRuntimeData(runtimeData) {
        this.other.setItem('runtimeData', runtimeData)
    }

    fetchTextFile() {
        return this.other.getItem('textFile')
    }

    updateTextFile(text) {
        this.other.setItem('textFile', text)
    }

    fetchAudioFile() {
        return this.other.getItem('audioFile')
    }

    updateAudioFile(file) {
        this.other.setItem('audioFile', file)
    }


}
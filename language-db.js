import {Benchmark} from "./benchmark.js";

export class LanguageDb {

    constructor() {
        this.db = new Dexie('LanguageDB')
        this.db.version(1).stores({
            words: 'word',
            sentences: 'sentence',
            other: 'key',
        })
    }

    getWord(word) {
        return this.db.words.get(word)
    }

    getSentence(sentence) {
        return this.db.sentences.get(sentence)
    }

    getNumberOfWords() {
        return this.db.words.count()
    }

    putWords(words) {
        return this.db.words.bulkPut(words)
    }

    putSentence(sentence) {
        console.log('Updating sentence', sentence)
        return this.db.sentences.put(sentence)
    }

    async import(db) {
        await this.db.words.clear()
        await this.db.sentences.clear()
        await this.db.other.delete('runtimeData')

        console.log('importing words')
        let now = Benchmark.now()
        await this.putWords(db.words)
        console.log(Benchmark.diff(now), db.words.length)
        console.log('done importing words')
        console.log('importing sentences')
        await this.db.sentences.bulkPut(db.sentences)
        console.log('done importing sentences')
        await this.db.other.put({key: 'runtimeData', value: db.runtimeData})
        console.log('done import')
        return 'done'
    }

    async export() {
        let words = await this.db.words.toArray()
        let sentences = await this.db.sentences.toArray()
        let runtimeData = await this.getRuntimeData()
        return {runtimeData, sentences, words}
    }

    async getRuntimeData() {
        let row = await this.db.other.get('runtimeData')
        let runtimeData = row === undefined ? {} : row.value
        if (runtimeData.currentPage === undefined) runtimeData.currentPage = 0
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
            this.putRuntimeData(runtimeData)
        }
        return runtimeData
    }

    putRuntimeData(runtimeData) {
        this.db.other.put({key: 'runtimeData', value: runtimeData})
    }

    getTextFile() {
        return this.db.other.get('textFile').then((row) => row === undefined ? undefined : row.value)
    }

    putTextFile(text) {
        this.db.other.put({key: 'textFile', value: text})
    }

    getAudioFile() {
        return this.db.other.get('audioFile').then((row) => row === undefined ? undefined : row.value)
    }

    putAudioFile(file) {
        this.db.other.put({key: 'audioFile', value: file})
    }

}
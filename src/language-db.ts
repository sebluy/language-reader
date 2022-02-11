import { Benchmark } from './benchmark'
import { RuntimeData } from './runtime-data'
import { Sentence } from './sentence'
import { Word } from './word'
import Dexie from 'dexie'

export class LanguageDb {

    db: any

    constructor() {
        this.db = new Dexie('LanguageDB')
        this.db.version(1).stores({
            words: 'word',
            sentences: 'sentence',
            other: 'key',
        })
        this.db.words.mapToClass(Word)
        this.db.sentences.mapToClass(Sentence)

        // TODO: this can be deleted after running this in prod
        let sentences = []
        this.db.sentences.each((sentence) => {
            let clean = sentence.sentence.trim()
            if (clean === sentence.sentence) return
            sentences.push(sentence)
        }).then(() => {
            sentences.forEach((sentence) => {
                console.log('DELETE: ' + sentence.sentence)
                this.db.sentences.delete(sentence.sentence)
                sentence.sentence = sentence.sentence.trim()
                console.log('PUT: ' + sentence.sentence)
                this.db.sentences.put(sentence)
            })
        })
    }

    getWord(word: string): Promise<Word> {
        return this.db.words.get(word)
    }

    getSentence(sentence: string): Promise<Sentence> {
        return this.db.sentences.get(sentence)
    }

    getNumberOfWords(): Promise<number> {
        return this.db.words.count()
    }

    putWords(words: Array<Word>) {
        return this.db.words.bulkPut(words)
    }

    putSentence(sentence: Sentence) {
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

    getRuntimeData(): Promise<RuntimeData> {
        return this.db.other.get('runtimeData').then((data) => {
            if (data === undefined) return undefined
            return RuntimeData.fromObject(data.value)
        })
    }

    putRuntimeData(runtimeData: RuntimeData) {
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
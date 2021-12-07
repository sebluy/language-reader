var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Benchmark } from './benchmark.js';
import { RuntimeData } from './runtime-data.js';
import { Sentence } from './sentence.js';
import { Word } from './word.js';
export class LanguageDb {
    constructor() {
        // @ts-ignore
        this.db = new Dexie('LanguageDB');
        this.db.version(1).stores({
            words: 'word',
            sentences: 'sentence',
            other: 'key',
        });
        this.db.words.mapToClass(Word);
        this.db.sentences.mapToClass(Sentence);
        // TODO: this can be deleted after running this in prod
        let sentences = [];
        this.db.sentences.each((sentence) => {
            let clean = sentence.sentence.trim();
            if (clean === sentence.sentence)
                return;
            sentences.push(sentence);
        }).then(() => {
            sentences.forEach((sentence) => {
                console.log('DELETE: ' + sentence.sentence);
                this.db.sentences.delete(sentence.sentence);
                sentence.sentence = sentence.sentence.trim();
                console.log('PUT: ' + sentence.sentence);
                this.db.sentences.put(sentence);
            });
        });
    }
    getWord(word) {
        return this.db.words.get(word);
    }
    getSentence(sentence) {
        return this.db.sentences.get(sentence);
    }
    getNumberOfWords() {
        return this.db.words.count();
    }
    putWords(words) {
        return this.db.words.bulkPut(words);
    }
    putSentence(sentence) {
        console.log('Updating sentence', sentence);
        return this.db.sentences.put(sentence);
    }
    import(db) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.words.clear();
            yield this.db.sentences.clear();
            yield this.db.other.delete('runtimeData');
            console.log('importing words');
            let now = Benchmark.now();
            yield this.putWords(db.words);
            console.log(Benchmark.diff(now), db.words.length);
            console.log('done importing words');
            console.log('importing sentences');
            yield this.db.sentences.bulkPut(db.sentences);
            console.log('done importing sentences');
            yield this.db.other.put({ key: 'runtimeData', value: db.runtimeData });
            console.log('done import');
            return 'done';
        });
    }
    export() {
        return __awaiter(this, void 0, void 0, function* () {
            let words = yield this.db.words.toArray();
            let sentences = yield this.db.sentences.toArray();
            let runtimeData = yield this.getRuntimeData();
            return { runtimeData, sentences, words };
        });
    }
    getRuntimeData() {
        return this.db.other.get('runtimeData').then((data) => {
            if (data === undefined)
                return undefined;
            return RuntimeData.fromObject(data.value);
        });
    }
    putRuntimeData(runtimeData) {
        this.db.other.put({ key: 'runtimeData', value: runtimeData });
    }
    getTextFile() {
        return this.db.other.get('textFile').then((row) => row === undefined ? undefined : row.value);
    }
    putTextFile(text) {
        this.db.other.put({ key: 'textFile', value: text });
    }
    getAudioFile() {
        return this.db.other.get('audioFile').then((row) => row === undefined ? undefined : row.value);
    }
    putAudioFile(file) {
        this.db.other.put({ key: 'audioFile', value: file });
    }
}

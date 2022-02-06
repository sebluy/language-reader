import { Utility } from './utility.js';
import { Word } from './word.js';
import { Sentence } from './sentence.js';
import { RawSentence } from './raw-sentence.js';
export class LanguageText {
    constructor(controller, filename, text, currentPage) {
        this.controller = controller;
        this.db = controller.db;
        this.filename = filename;
        this.pages = this.extractPages(text);
        this.setPage(currentPage);
    }
    onLoad() { }
    onUpdateDefinition(word) { }
    setPage(n) {
        if (n < 0 || n >= this.pages.length)
            return false;
        this.text = this.pages[n];
        this.expected = 0;
        this.loaded = 0;
        this.extractSentences();
        this.extractWords();
        return true;
    }
    extractPages(text) {
        let idealLength = 1000;
        let pages = [];
        let pageStart = 0;
        let lastTab = 0;
        let nextNewline = 0;
        let i = 0;
        while (true) {
            i++;
            if (i === 1000)
                break;
            nextNewline = text.indexOf("\n", lastTab + 1);
            if (nextNewline === -1) {
                pages.push(text.substring(pageStart));
                break;
            }
            if (nextNewline - pageStart > idealLength) {
                let diffA = Math.abs(lastTab - pageStart - idealLength);
                let diffB = Math.abs(nextNewline - pageStart - idealLength);
                let pageEnd = diffA < diffB ? lastTab : nextNewline;
                pages.push(text.substring(pageStart, pageEnd));
                pageStart = pageEnd;
            }
            lastTab = nextNewline;
        }
        return pages;
    }
    extractWords() {
        this.words = new Map();
        this.sentences.forEach((sentence) => {
            const words = sentence.getWords();
            words.forEach((word) => {
                if (this.words.has(word)) {
                    this.words.get(word).count += 1;
                }
                else {
                    this.words.set(word, new Word(word));
                }
            });
        });
        this.expected += this.words.size;
        this.words.forEach((word) => {
            return this.db.getWord(word.word).then(row => {
                if (row !== undefined) {
                    word.definition = row.definition;
                    word.mastery = row.mastery;
                }
                this.markLoaded();
            });
        });
        this.expected += 1;
        this.db.getNumberOfWords().then(n => {
            this.totalWordsTranslated = n;
            this.markLoaded();
        });
    }
    updateWordDefinition(word, definition) {
        const wordData = this.words.get(word);
        if (wordData.definition === definition)
            return;
        if (wordData.definition === '') {
            this.totalWordsTranslated += 1;
            this.controller.learnNewWords(1);
        }
        wordData.definition = definition;
        console.log('Updating definition... for ' + word + ' to ' + definition);
        this.db.putWords([wordData]);
        this.onUpdateDefinition(word);
    }
    updateSentenceDefinition(sentence, definition) {
        let sentenceO = this.sentenceMap.get(sentence);
        if (sentenceO.definition === definition)
            return;
        sentenceO.definition = definition;
        console.log('Updating definition... for ' + sentence + ' to ' + definition);
        this.db.putSentence(sentenceO);
    }
    updateMastery(words) {
        words = words.map((word) => this.words.get(word).nextMastery());
        this.db.putWords(words);
    }
    updateStats() {
        let countTranslated = 0;
        let wMastered = 0;
        let numberOfWords = 0;
        let newWords = 0;
        this.words.forEach((data) => {
            wMastered += data.mastery;
            numberOfWords += data.count;
            countTranslated += data.getTranslatedCount();
            newWords += data.getNewCount();
        });
        let percentTranslated = countTranslated === 0 ? 0 : countTranslated / numberOfWords;
        let percentWMastered = wMastered / (this.words.size * 5);
        return {
            newWords: newWords,
            totalWordsTranslated: this.totalWordsTranslated,
            percentTranslated: percentTranslated,
            percentWordsMastered: percentWMastered,
        };
    }
    extractSentences() {
        let i = 0;
        if (this.text === undefined)
            this.text = '';
        this.sentences = [];
        this.sentenceMap = new Map();
        while (true) {
            let endPos = Utility.nextEndPos(this.text, i);
            let text = (this.text).substring(i, endPos === false ? undefined : endPos + 1);
            if (text === '')
                break;
            let clean = text.trim();
            this.sentences.push(new RawSentence(text, clean));
            this.sentenceMap.set(clean, new Sentence(clean));
            if (endPos === false)
                break;
            i = endPos + 1;
        }
        this.expected += this.sentenceMap.size;
        this.sentenceMap.forEach(sentence => {
            this.db.getSentence(sentence.sentence).then(row => {
                if (row !== undefined) {
                    if (row.definition !== undefined)
                        sentence.definition = row.definition;
                    sentence.startTime = row.startTime;
                    sentence.endTime = row.endTime;
                }
                this.markLoaded();
            });
        });
    }
    markLoaded() {
        this.loaded += 1;
        if (this.loaded === this.expected)
            this.onLoad();
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
    updateSentenceTimes(sentence, startTime, endTime) {
        if (startTime !== null)
            sentence.startTime = startTime;
        if (endTime !== null)
            sentence.endTime = endTime;
        this.db.putSentence(sentence);
    }
    updateSentence(sentence) {
        this.sentenceMap.set(sentence.sentence, sentence);
        this.db.putSentence(sentence);
    }
    getWordMap(words) {
        let map = new Map();
        words.forEach((word) => {
            map.set(word, this.words.get(word));
        });
        return map;
    }
    getWordStrArray() {
        return Array.from(this.words).map((v) => v[1].word);
    }
    getSentenceDefinitionArray() {
        return Array.from(this.sentenceMap).map((v) => v[1].definition);
    }
    getDefinitionArray() {
        return Array.from(this.words).map((v) => v[1].definition);
    }
    leastMasteredWord(rawSentence) {
        let wordMap = this.getWordMap(rawSentence.getWords());
        return Utility.randomWordsByMastery(wordMap, 1)[0];
    }
    leastMastery() {
        let min = Word.MAX_MASTERY;
        Array.from(this.words).forEach(([k, v]) => {
            if (v.definition !== '' && v.mastery < min)
                min = v.mastery;
        });
        return min;
    }
}

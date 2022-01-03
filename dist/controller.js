var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { VocabularyMatching } from './vocabulary-matching.js';
import { Utility } from './utility.js';
import { LanguageText } from './language-text.js';
import { Reader } from './reader.js';
import { Unscramble } from './unscramble.js';
import { LanguageDb } from './language-db.js';
import { RuntimeData } from './runtime-data.js';
import { SideBar } from './side-bar.js';
import { Listening } from './listening.js';
import { VocabInContext } from './vocab-in-context.js';
export class Controller {
    constructor() {
        this.db = new LanguageDb();
        this.sidebar = new SideBar(this);
        this.load();
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let runtimeData = yield this.db.getRuntimeData();
            if (runtimeData === undefined)
                runtimeData = RuntimeData.empty();
            console.log(runtimeData);
            runtimeData.updateXP();
            this.runtimeData = runtimeData;
            if (runtimeData.openTextFile) {
                let text = yield this.db.getTextFile();
                this.loadTextFile(text);
            }
            if (runtimeData.openAudioFile) {
                let audio = yield this.db.getAudioFile();
                this.loadAudioFile(audio);
            }
        });
    }
    openTextFile() {
        Utility.upload((file) => {
            file.text().then((text) => {
                this.runtimeData.openTextFile = file.name;
                this.runtimeData.currentPage = 0;
                this.db.putRuntimeData(this.runtimeData);
                this.db.putTextFile(text);
                this.loadTextFile(text);
            });
        });
    }
    loadTextFile(text) {
        if (text === undefined)
            return;
        this.languageText = new LanguageText(this, this.runtimeData.openTextFile, text, this.runtimeData.currentPage);
        this.languageText.onUpdateDefinition = (word) => this.updateHighlighting(word);
        this.languageText.onLoad = () => {
            this.sidebar.updateStats();
            this.showReader();
        };
        this.sidebar.languageText = this.languageText;
    }
    openAudioFile() {
        Utility.upload((file) => {
            this.runtimeData.openAudioFile = file.name;
            this.db.putRuntimeData(this.runtimeData);
            this.db.putAudioFile(file);
            this.loadAudioFile(URL.createObjectURL(file));
        });
    }
    loadAudioFile(url) {
        if (url === undefined)
            return;
        if (url instanceof File) {
            let reader = new FileReader();
            reader.readAsDataURL(url);
            reader.onload = () => {
                if (typeof reader.result === 'string')
                    this.sidebar.setAudioSource(reader.result);
            };
        }
        else {
            this.sidebar.setAudioSource(url);
        }
    }
    showReader() {
        this.cleanupActivity();
        let reader = new Reader(this);
        reader.onClickWord = (word) => this.sidebar.showWord(word);
        this.sidebar.showSentence(undefined);
        this.sidebar.setAudio(reader.getFirstSentence().startTime);
        this.sidebar.loadActivity(reader);
        this.sidebar.onNextWord = () => reader.nextWord();
        this.sidebar.updateHighlighting = () => this.updateHighlighting();
        this.sidebar.highlightSentence = (i) => reader.highlightSentence(i);
        this.sidebar.unhighlightSentence = (i) => reader.removeSentenceHighlighting(i);
        if (this.sidebar.highlightingOn)
            reader.updateHighlighting(true);
        this.activity = reader;
    }
    showUnscramble() {
        this.cleanupActivity();
        let unscramble = new Unscramble(this);
        unscramble.onClickWord = (word) => this.sidebar.showWord(word);
        this.sidebar.showSentence(unscramble.sentence);
        this.sidebar.loadActivity(unscramble);
        this.sidebar.checkAnswer = () => unscramble.checkAnswer();
        this.activity = unscramble;
    }
    showVocabularyMatching() {
        this.cleanupActivity();
        let vocabularyMatching = new VocabularyMatching(this);
        this.sidebar.showSentence(undefined);
        this.sidebar.loadActivity(vocabularyMatching);
        this.activity = vocabularyMatching;
    }
    showListening(index = 0) {
        this.cleanupActivity();
        let listening = new Listening(this, index);
        listening.onClickWord = (word) => this.sidebar.showWord(word);
        this.sidebar.showSentence(listening.sentence);
        this.sidebar.loadActivity(listening);
        this.activity = listening;
    }
    showVocabInContext(index = 0) {
        this.cleanupActivity();
        let vocab = new VocabInContext(this, index);
        vocab.onClickWord = (word) => this.sidebar.showWord(word);
        this.sidebar.showSentence(vocab.sentence);
        this.sidebar.loadActivity(vocab);
        this.activity = vocab;
    }
    cleanupActivity() {
        if (this.activity) {
            this.activity.cleanup();
            this.activity = undefined;
        }
    }
    updateHighlighting(word) {
        if (this.activity instanceof Reader) {
            this.activity.updateHighlighting(this.sidebar.highlightingOn, word);
        }
    }
    importDatabase() {
        Utility.uploadText((name, db) => {
            this.db.import(JSON.parse(db)).then(() => this.load());
        });
    }
    exportDatabase() {
        this.db.export()
            .then(db => Utility.download('language-db.json', JSON.stringify(db)));
    }
    changePageBy(n) {
        this.runtimeData.currentPage += n;
        this.db.putRuntimeData(this.runtimeData);
        this.languageText.setPage(this.runtimeData.currentPage);
    }
    addXP(n) {
        this.runtimeData.xpToday += n;
        this.db.putRuntimeData(this.runtimeData);
    }
}
new Controller();

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
// TODO: add a controller class
// TODO: finish upgrading everything to Typescript
// TODO: cleanup drag and drop for vocabulary matching
// TODO: use only one activity field instead of having a separate field for each activity
// TODO: create new widgets or reuse
// TODO: Fix the span thing with clicking.
// TODO: new activity: show a sentence (with audio). Give user some options for next sentence (with audio)
// TODO: write a desktop version (Java?)
// TODO: upgrade to TypeSript?
// TODO: Fix sentence parsing for songs
// TODO: change export to CSV
// TODO: change fetch/update to get/set
// TODO: Update the styling to be more pretty/modern.
// TODO: use async/await more
// TODO: fix favicon error
/* TODO: come up with a better way than just random. Some progression through the exercises or something.
     Think a lesson, instead of just random exercises.
     Maybe a 5 stage Leitner system.
     Vocab - Each word goes through 5 levels until mastered. Random from lowest level.
     Unscramble - Each sentence goes through 5 levels until mastered. In order.
     Fill in the blanks - Each sentence goes through 5 levels until mastered. In order.
     Mastery = 1/3 of each.
*/
// TODO: Have someway to show the answer if you're wrong.
// TODO: use an actual dictionary instead of google translate
// TODO: make it mobile friendly
// TODO: find a way to sync with multiple clients
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
        // TODO: add generic cleanup method to activity
        this.cleanupVocabularyMatching();
        this.reader = new Reader(this);
        this.reader.onClickWord = (word) => this.sidebar.showWord(word);
        let sentence = this.reader.getFirstSentence();
        this.sidebar.setAudio(sentence.startTime);
        this.sidebar.loadActivity(this.reader);
        this.sidebar.onNextWord = () => this.reader.nextWord();
        this.sidebar.updateHighlighting = () => this.updateHighlighting();
        this.sidebar.highlightSentence = (i) => this.reader.highlightSentence(i);
        this.sidebar.unhighlightSentence = (i) => this.reader.removeSentenceHighlighting(i);
        if (this.sidebar.highlightingOn)
            this.reader.updateHighlighting(true);
    }
    showUnscramble() {
        this.cleanupVocabularyMatching();
        let sentence = this.languageText.getNextSentenceByMastery();
        this.unscramble = new Unscramble(this, sentence);
        this.unscramble.onClickWord = (word) => this.sidebar.showWord(word);
        this.sidebar.showSentence(sentence);
        this.sidebar.updateStats();
        this.sidebar.loadActivity(this.unscramble);
        this.sidebar.setAudio(sentence.startTime, sentence.endTime);
        this.sidebar.checkAnswer = () => this.unscramble.checkAnswer();
        if (sentence.startTime !== undefined)
            this.sidebar.playAudio();
    }
    showVocabularyMatching() {
        this.cleanupVocabularyMatching();
        this.vocabularyMatching = new VocabularyMatching(this);
        this.sidebar.setAudio(undefined, undefined);
        this.sidebar.showSentence(undefined);
        this.sidebar.updateStats();
        this.sidebar.loadActivity(this.vocabularyMatching);
    }
    cleanupVocabularyMatching() {
        if (this.vocabularyMatching) {
            this.vocabularyMatching.cleanup();
            this.vocabularyMatching = undefined;
        }
    }
    updateHighlighting(word) {
        this.reader.updateHighlighting(this.sidebar.highlightingOn, word);
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

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
import { Cloze } from './cloze.js';
import { Listening2 } from './listening2.js';
import { MainWindow } from './main-window.js';
export class Controller {
    constructor() {
        this.db = new LanguageDb();
        this.sidebar = new SideBar(this);
        this.mainWindow = new MainWindow();
        this.load();
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setMidnightWatch();
            let runtimeData = yield this.db.getRuntimeData();
            if (runtimeData === undefined)
                runtimeData = RuntimeData.empty();
            console.log(runtimeData);
            runtimeData.updateForNewDay();
            this.runtimeData = runtimeData;
            this.sidebar.setNames();
            this.sidebar.setLanguage(runtimeData.language);
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
    openTextFile(file) {
        file.text().then((text) => {
            this.runtimeData.openTextFile = file.name;
            this.runtimeData.currentPage = 0;
            this.sidebar.setNames();
            this.db.putRuntimeData(this.runtimeData);
            this.db.putTextFile(text);
            this.loadTextFile(text);
        });
    }
    openFiles() {
        Utility.upload((files) => {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                if (file.type === 'text/plain')
                    this.openTextFile(file);
                if (file.type === 'audio/mpeg' || file.type === 'audio/x-m4a')
                    this.openAudioFile(file);
            }
        });
    }
    loadTextFile(text) {
        if (text === undefined)
            return;
        this.languageText = new LanguageText(this, this.runtimeData.openTextFile, text, this.runtimeData.currentPage);
        this.languageText.onUpdateDefinition = (word) => this.updateHighlighting(word);
        this.languageText.onLoad = () => {
            this.sidebar.updateStats();
            this.showActivity(new Reader(this));
        };
        this.sidebar.languageText = this.languageText;
    }
    openAudioFile(file) {
        this.runtimeData.openAudioFile = file.name;
        this.sidebar.setNames();
        this.db.putRuntimeData(this.runtimeData);
        this.db.putAudioFile(file);
        this.loadAudioFile(file);
    }
    loadAudioFile(file) {
        if (file === undefined)
            return;
        this.sidebar.setAudioSource(URL.createObjectURL(file));
    }
    showActivityByName(name) {
        if (name === 'reader')
            this.showActivity(new Reader(this));
        else if (name === 'vocab-in-context')
            this.showActivity(new VocabInContext(this));
        else if (name === 'vocab-matching')
            this.showActivity(new VocabularyMatching(this));
        else if (name === 'listening')
            this.showActivity(new Listening(this));
        else if (name === 'listening-2')
            this.showActivity(new Listening2(this));
        else if (name === 'cloze')
            this.showActivity(new Cloze(this));
        else if (name === 'unscramble')
            this.showActivity(new Unscramble(this));
        else if (name === 'auto')
            this.showAuto();
    }
    showAuto() {
        let last = this.activity;
        let stats = this.languageText.updateStats();
        let next;
        // TODO: Make this user adjustable?
        if (stats.percentWordsMastered < 0.70)
            next = new VocabInContext(this);
        else if (stats.percentWordsMastered < 0.75)
            next = new Cloze(this);
        else if (stats.percentWordsMastered < 0.80)
            next = new Listening(this);
        else if (stats.percentWordsMastered < 0.90)
            next = new Listening2(this);
        else if (stats.percentWordsMastered < 1.00)
            next = new VocabularyMatching(this);
        else
            next = new Reader(this);
        next.update(last);
        next.nextActivity = () => this.showAuto();
        this.showActivity(next);
    }
    showActivity(activity) {
        if (this.activity)
            this.activity.cleanup();
        this.sidebar.hideAll();
        this.activity = activity;
        this.activity.show();
        this.sidebar.updateStats();
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
        let newPage = this.runtimeData.currentPage + n;
        let success = this.languageText.setPage(newPage);
        if (!success)
            return;
        this.runtimeData.currentPage = newPage;
        this.db.putRuntimeData(this.runtimeData);
    }
    addXP(n) {
        this.runtimeData.xpToday += n;
        this.db.putRuntimeData(this.runtimeData);
    }
    learnNewWords(n) {
        this.runtimeData.wordsLearnedToday += n;
        this.runtimeData.xpToday += n;
        this.db.putRuntimeData(this.runtimeData);
    }
    updateLanguage(language) {
        this.runtimeData.language = language;
        this.db.putRuntimeData(this.runtimeData);
    }
    setMidnightWatch() {
        // Need to use browser lifecycle to check for new day because setTimeout isn't reliable
        lifecycle.addEventListener('statechange', (event) => {
            this.updateForNewDay();
            this.setMidnightTimer(this.updateForNewDay.bind(this));
        });
    }
    updateForNewDay() {
        if (this.runtimeData.isNewDay()) {
            console.log('Updating for new day ' + new Date());
            this.runtimeData.updateForNewDay();
            this.sidebar.updateStats();
        }
    }
    setMidnightTimer(f) {
        let now = new Date();
        let next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        let timeToNext = next.getTime() - now.getTime();
        clearTimeout(this.midnightTimeout);
        this.midnightTimeout = setTimeout(() => {
            f();
            this.setMidnightTimer(f);
        }, timeToNext);
    }
}
new Controller();

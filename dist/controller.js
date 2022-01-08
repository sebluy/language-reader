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
            this.showActivity(new Reader(this));
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
    }
    showActivity(activity) {
        if (this.activity)
            this.activity.cleanup();
        this.activity = activity;
        this.activity.show();
        this.sidebar.loadActivity(activity);
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

import { VocabularyMatching } from './vocabulary-matching.js'
import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Reader } from './reader.js'
import { Unscramble } from './unscramble.js'
import { LanguageDb } from './language-db.js'
import { RuntimeData } from './runtime-data.js'
import { SideBar } from './side-bar.js'
import { ControllerInterface } from './controller-interface.js'
import { Listening } from './listening.js'
import { VocabInContext } from './vocab-in-context.js'
import { Cloze } from './cloze.js'
import { Listening2 } from './listening2.js'
import { MainWindow } from './main-window.js'
import { Activity } from './activity.js'

// TODO: Change threshold for matching to 70%.
// TODO: Fix XP for today and yesterday, make it switch at midnight, enforce actual yesterday, etc
// TODO: Maybe just change yesterday to last?
// TODO: Fix next/previous page when out of bounds.

// TODO: Keep sidebar in sync
// TODO: How to integrate more observables. For example, side bar "watches" runtime data for updates.
// TODO: Fix/hide unscramble? Fill in the blank?
// TODO: use anonymous classes instead of just overwriting properties
// TODO: add some tests
// TODO: remove sentence mastery and just update all the words for unscramble
// TODO: disable audio shortcuts when typing in definitions
// TODO: add a Google translate icon to the right instead of a button
// TODO: continue textview refactor
// TODO: keep working on Cloze
// TODO: change audio time edit to mm:ss
// TODO: how to handle new chapters (new audio file) in page. Split text files into chapters?
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


export class Controller implements ControllerInterface {

    db: LanguageDb
    runtimeData: RuntimeData
    sidebar: SideBar
    mainWindow: MainWindow
    languageText: LanguageText
    activity: Activity

    constructor() {
        this.db = new LanguageDb()
        this.sidebar = new SideBar(this)
        this.mainWindow = new MainWindow()
        this.load();
    }

    async load() {
        let runtimeData = await this.db.getRuntimeData()
        if (runtimeData === undefined) runtimeData = RuntimeData.empty()
        console.log(runtimeData)
        runtimeData.updateForNewDay()
        this.runtimeData = runtimeData
        this.sidebar.setNames()
        if (runtimeData.openTextFile) {
            let text = await this.db.getTextFile()
            this.loadTextFile(text)
        }
        if (runtimeData.openAudioFile) {
            let audio = await this.db.getAudioFile()
            this.loadAudioFile(audio)
        }
    }

    openTextFile(file) {
        file.text().then((text) => {
            this.runtimeData.openTextFile = file.name
            this.runtimeData.currentPage = 0
            this.sidebar.setNames()
            this.db.putRuntimeData(this.runtimeData)
            this.db.putTextFile(text)
            this.loadTextFile(text)
        })
    }

    openFiles() {
        Utility.upload((files) => {
            for (let i = 0; i < files.length; i++) {
                let file = files[i]
                if (file.type === 'text/plain') this.openTextFile(file)
                if (file.type === 'audio/mpeg') this.openAudioFile(file)
            }
        })
    }

    loadTextFile(text) {
        if (text === undefined) return
        this.languageText = new LanguageText(
            this,
            this.runtimeData.openTextFile,
            text,
            this.runtimeData.currentPage
        )
        this.languageText.onUpdateDefinition = (word) => this.updateHighlighting(word)
        this.languageText.onLoad = () => {
            this.sidebar.updateStats()
            this.showActivity(new Reader(this))
        }
        this.sidebar.languageText = this.languageText
    }

    openAudioFile(file) {
        this.runtimeData.openAudioFile = file.name
        this.sidebar.setNames()
        this.db.putRuntimeData(this.runtimeData)
        this.db.putAudioFile(file)
        this.loadAudioFile(URL.createObjectURL(file))
    }

    loadAudioFile(url) {
        if (url === undefined) return
        if (url instanceof File) {
            let reader = new FileReader()
            reader.readAsDataURL(url)
            reader.onload = () => {
                if (typeof reader.result === 'string') this.sidebar.setAudioSource(reader.result)
            }
        } else {
            this.sidebar.setAudioSource(url)
        }
    }

    showActivityByName(name: string) {
        if (name === 'reader') this.showActivity(new Reader(this))
        else if (name === 'vocab-in-context') this.showActivity(new VocabInContext(this))
        else if (name === 'vocab-matching') this.showActivity(new VocabularyMatching(this))
        else if (name === 'listening') this.showActivity(new Listening(this))
        else if (name === 'listening-2') this.showActivity(new Listening2(this))
        else if (name === 'cloze') this.showActivity(new Cloze(this))
        else if (name === 'unscramble') this.showActivity(new Unscramble(this))
        else if (name === 'auto') this.showAuto()
    }

    showAuto() {
        let last = this.activity
        let stats = this.languageText.updateStats()
        let next
        if (stats.percentWordsMastered < 0.80) next = new VocabInContext(this)
        else if (stats.percentWordsMastered < 0.85) next = new Listening(this)
        else if (stats.percentWordsMastered < 0.90) next = new VocabularyMatching(this)
        else if (stats.percentWordsMastered < 0.95) next = new Cloze(this)
        else next = new Listening2(this)
        next.update(last)
        next.nextActivity = () => this.showAuto()
        this.showActivity(next)
    }

    showActivity(activity: Activity) {
        if (this.activity) this.activity.cleanup()
        this.sidebar.hideAll()
        this.activity = activity
        this.activity.show()
        this.sidebar.updateStats()
    }

    updateHighlighting(word?) {
        if (this.activity instanceof Reader) {
            this.activity.updateHighlighting(this.sidebar.highlightingOn, word)
        }
    }

    importDatabase() {
        Utility.uploadText((name, db) => {
            this.db.import(JSON.parse(db)).then(() => this.load())
        })
    }

    exportDatabase() {
        this.db.export()
            .then(db => Utility.download('language-db.json', JSON.stringify(db)))
    }

    changePageBy(n) {
        this.runtimeData.currentPage += n
        this.db.putRuntimeData(this.runtimeData)
        this.languageText.setPage(this.runtimeData.currentPage)
    }

    addXP(n: number) {
        this.runtimeData.xpToday += n
        this.db.putRuntimeData(this.runtimeData)
    }

    learnNewWords(n: number) {
        this.runtimeData.wordsLearnedToday += n
        this.runtimeData.xpToday += n
        this.db.putRuntimeData(this.runtimeData)
    }

}

new Controller()

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

// TODO: add a component for the main view which encapsulates the activity
// TODO: add some tests
// TODO: why is cloze not mastering every time?
// TODO: add the page number to the reader
// TODO: add the sentence number to the activity
// TODO: add sentence translation to unscramble
// TODO: add an auto option that goes through the activities in order
// TODO: change activity picker to a select field
// TODO: fix right sidebar for the various activities
// TODO: remove sentence mastery and just update all the words for unscramble
// TODO: disable audio shortcuts when typing in defintions
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

export interface Activity {
    cleanup()
}

export class Controller implements ControllerInterface {

    db: LanguageDb
    runtimeData: RuntimeData
    sidebar: SideBar
    languageText: LanguageText
    activity: Activity

    constructor() {
        this.db = new LanguageDb()
        this.sidebar = new SideBar(this)
        this.load();
    }

    async load() {
        let runtimeData = await this.db.getRuntimeData()
        if (runtimeData === undefined) runtimeData = RuntimeData.empty()
        console.log(runtimeData)
        runtimeData.updateXP()
        this.runtimeData = runtimeData
        if (runtimeData.openTextFile) {
            let text = await this.db.getTextFile()
            this.loadTextFile(text)
        }
        if (runtimeData.openAudioFile) {
            let audio = await this.db.getAudioFile()
            this.loadAudioFile(audio)
        }
    }

    openTextFile() {
        Utility.upload((file) => {
            file.text().then((text) => {
                this.runtimeData.openTextFile = file.name
                this.runtimeData.currentPage = 0
                this.db.putRuntimeData(this.runtimeData)
                this.db.putTextFile(text)
                this.loadTextFile(text)
            })
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
            this.showReader()
        }
        this.sidebar.languageText = this.languageText
    }

    openAudioFile() {
        Utility.upload((file) => {
            this.runtimeData.openAudioFile = file.name
            this.db.putRuntimeData(this.runtimeData)
            this.db.putAudioFile(file)
            this.loadAudioFile(URL.createObjectURL(file))
        })
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

    showReader() {
        this.cleanupActivity();
        let reader = new Reader(this)
        reader.onClickWord = (word, sentence) => this.sidebar.showWord(word, sentence)
        this.sidebar.showSentence(undefined)
        this.sidebar.setAudio(reader.getFirstSentence().startTime)
        this.sidebar.loadActivity(reader)
        this.sidebar.onNextWord = () => reader.nextWord()
        this.sidebar.onNextSentence = () => reader.nextSentence()
        this.sidebar.updateHighlighting = () => this.updateHighlighting()
        this.sidebar.highlightSentence = (i) => reader.highlightSentence(i)
        this.sidebar.unhighlightSentence = (i) => reader.removeSentenceHighlighting(i)
        if (this.sidebar.highlightingOn) reader.updateHighlighting(true)
        this.activity = reader
    }

    showUnscramble() {
        this.cleanupActivity();
        let unscramble = new Unscramble(this)
        unscramble.onClickWord = (word) => this.sidebar.showWord(word.word)
        this.sidebar.showSentence(unscramble.sentence)
        this.sidebar.loadActivity(unscramble)
        this.sidebar.checkAnswer = () => unscramble.checkAnswer()
        this.activity = unscramble
    }

    showVocabularyMatching() {
        this.cleanupActivity();
        let vocabularyMatching = new VocabularyMatching(this)
        this.sidebar.showSentence(undefined)
        this.sidebar.loadActivity(vocabularyMatching)
        this.activity = vocabularyMatching
    }

    showListening(index = 0) {
        this.cleanupActivity();
        let listening = new Listening(this, index)
        listening.onClickWord = (word) => this.sidebar.showWord(word)
        this.sidebar.showSentence(listening.sentence)
        this.sidebar.loadActivity(listening)
        this.activity = listening
    }

    showVocabInContext(index = 0) {
        this.cleanupActivity();
        let vocab = new VocabInContext(this, index)
        vocab.onClickWord = (word) => this.sidebar.showWord(word)
        this.sidebar.showSentence(vocab.sentence)
        this.sidebar.loadActivity(vocab)
        this.activity = vocab
    }

    showCloze(index = 0) {
        this.cleanupActivity();
        let vocab = new Cloze(this, index)
        vocab.onClickWord = (word) => this.sidebar.showWord(word)
        // TODO: what to do with audio here?
        // this.sidebar.showSentence(vocab.sentence)
        this.sidebar.loadActivity(vocab)
        this.activity = vocab
    }

    cleanupActivity() {
        if (this.activity) {
            this.activity.cleanup()
            this.activity = undefined
        }
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

}

new Controller()

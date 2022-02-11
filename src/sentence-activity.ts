import { LanguageText } from './language-text'
import { Sentence } from './sentence';
import { Word } from './word';
import { RawSentence } from './raw-sentence'
import { Activity } from './activity'

// TODO: change this to just sentence activity
export abstract class SentenceActivity extends Activity {

    languageText: LanguageText
    textE: HTMLElement
    sentence: Sentence
    rawSentence: RawSentence
    index: number
    word: Word

    constructor(controller, index = 0) {
        super(controller)
        this.languageText = controller.languageText
        this.setIndex(index)
    }

    setIndex(index) {
        this.index = index % this.languageText.sentences.length
    }

    show() {
        this.pickSentenceAndWord()
        this.controller.mainWindow.reset(this.title(), 'Sentence ' + (this.index + 1))
        this.textE = this.controller.mainWindow.contentDiv
    }

    pickSentenceAndWord() {
        let leastMastery = this.languageText.leastMastery()
        for (let i = 0; i <= this.languageText.sentences.length; i += 1) {
            this.rawSentence = this.languageText.sentences[this.index]
            this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean)
            this.word = this.languageText.leastMasteredWord(this.rawSentence)
            if (this.word.mastery === leastMastery) break
            if (i === this.languageText.sentences.length) break;
            this.setIndex(this.index + 1)
        }
    }

    update(last: Activity) {
        if (last instanceof SentenceActivity) {
            this.setIndex(last.index + 1)
        }
    }

    nextActivity() {
        this.controller.showActivity(new (<any>this.constructor)(this.controller, this.index + 1))
    }

    onClickWord(word: string) {}

    abstract title(): string

}

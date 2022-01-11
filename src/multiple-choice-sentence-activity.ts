import { LanguageText } from './language-text.js'
import { Sentence } from './sentence.js';
import { Word } from './word.js';
import { RawSentence } from './raw-sentence.js'
import { Activity } from './activity.js'
import { MultipleChoice } from './multiple-choice.js'

export abstract class MultipleChoiceSentenceActivity extends Activity {

    languageText: LanguageText
    textE: HTMLElement
    sentence: Sentence
    rawSentence: RawSentence
    index: number
    word: Word
    multipleChoice: MultipleChoice

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
        this.createTextView()
        this.createMultipleChoice()
    }

    pickSentenceAndWord() {
        for (let i = 0; i <= this.languageText.sentences.length; i += 1) {
            this.rawSentence = this.languageText.sentences[this.index]
            this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean)
            this.word = this.languageText.leastMasteredWord(this.rawSentence)
            if (this.word.mastery < Word.MAX_MASTERY) break
            if (i === this.languageText.sentences.length) break;
            this.setIndex(this.index + 1)
        }
        console.log('Sentence index: ' + this.index)
    }

    cleanup() {
        this.multipleChoice.cleanup()
    }

    update(last: Activity) {
        if (last instanceof MultipleChoiceSentenceActivity) {
            this.setIndex(last.index + 1)
        }
    }

    nextActivity() {
        this.controller.showActivity(new (<any>this.constructor)(this.controller, this.index + 1))
    }

    onClickWord(word: string) {}

    abstract title(): string
    abstract createTextView()
    abstract createMultipleChoice()

}

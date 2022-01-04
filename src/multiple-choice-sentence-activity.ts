import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Sentence } from './sentence.js';
import { Word } from './word.js';
import { ControllerInterface } from './controller-interface.js'
import { RawSentence } from './raw-sentence.js'
import { Activity } from './controller.js'
import { MultipleChoice } from './multiple-choice.js'

export abstract class MultipleChoiceSentenceActivity implements Activity {

    controller: ControllerInterface
    languageText: LanguageText
    textE: HTMLElement
    sentence: Sentence
    rawSentence: RawSentence
    index: number
    word: Word
    multipleChoice: MultipleChoice

    constructor(controller, index = 0) {
        this.controller = controller
        this.languageText = controller.languageText
        this.index = index % this.languageText.sentences.length
        this.textE = Utility.resetMainView(this.title())

        this.pickSentenceAndWord()
        this.createTextView()
        this.createMultipleChoice()
    }

    pickSentenceAndWord() {
        let i = this.index
        while (true) {
            this.rawSentence = this.languageText.sentences[i]
            this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean)
            this.word = this.languageText.leastMasteredWord(this.rawSentence)
            if (i === this.index) break
            if (this.word.mastery < Word.MAX_MASTERY) break
            i = (i + 1) % this.languageText.sentences.length
        }
        this.index = i
        console.log('Sentence index: ' + this.index)
    }

    cleanup() {
        this.multipleChoice.cleanup()
    }

    onClickWord(word: string) {}

    abstract title(): string
    abstract createTextView()
    abstract createMultipleChoice()

}

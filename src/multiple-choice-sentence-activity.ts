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

        let i = this.languageText.sentences.length
        while (i > 0) {
            this.rawSentence = this.languageText.sentences[this.index]
            this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean)
            this.word = this.languageText.leastMasteredWord(this.rawSentence)
            if (this.word.mastery < Word.MAX_MASTERY) break
            this.index = (this.index + 1) % this.languageText.sentences.length
            i -= 1
        }

        this.createTextView()
        this.createMultipleChoice()
    }

    cleanup() {
        this.multipleChoice.cleanup()
    }

    onClickWord(word: string) {}

    abstract title(): string
    abstract createTextView()
    abstract createMultipleChoice()

}

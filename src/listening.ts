import { MultipleChoice } from './multiple-choice.js'
import { TextView } from './text-view.js'
import { MultipleChoiceSentenceActivity } from './multiple-choice-sentence-activity.js';

export class Listening extends MultipleChoiceSentenceActivity {

    title() {
        return 'Listening'
    }

    createTextView() {
        let textView = new TextView(this.rawSentence)
        textView.onClickWord = this.onClickWord
        textView.renderWord = (word, clean) => {
            if (clean === this.word.word) textView.renderBlank()
            else textView.defaultRenderWord(word)
        }
        textView.render(this.textE)
    }

    createMultipleChoice() {
        this.multipleChoice = new MultipleChoice(this.languageText.getWordStrArray(), this.word.word)
        this.multipleChoice.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.word.word])
            this.controller.addXP(1)
            this.controller.showListening(this.index + 1)
        }
        this.multipleChoice.render(this.textE)
    }

}
import { MultipleChoice } from './multiple-choice.js'
import { TextView } from './text-view.js'
import { MultipleChoiceSentenceActivity } from './multiple-choice-sentence-activity.js';

export class Cloze extends MultipleChoiceSentenceActivity {

    // TODO: dedupe with listening and vocab in context
    // TODO: dedupe using text area object?
    // TODO: add full sentence translation

    title() {
        return 'Cloze'
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
            this.controller.showCloze(this.index + 1)
        }
        this.multipleChoice.render(this.textE)
    }

}
import { MultipleChoice } from './multiple-choice.js'
import { TextView } from './text-view.js'
import { MultipleChoiceSentenceActivity } from './multiple-choice-sentence-activity.js';

export class Listening extends MultipleChoiceSentenceActivity {

    show(index = 0) {
        this.controller.sidebar.showSentence(this.sentence)
    }

    title() {
        return 'Listening'
    }

    createTextView() {
        let textView = new TextView(this.rawSentence)
        textView.onClickWord = (word) => this.controller.sidebar.showWord(word)
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
            this.controller.showActivity(new Listening(this.controller, this.index + 1))
        }
        this.multipleChoice.render(this.textE)
    }

}
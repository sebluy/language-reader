import { MultipleChoice } from './multiple-choice.js'
import { TextView } from './text-view.js'
import { MultipleChoiceSentenceActivity } from './multiple-choice-sentence-activity.js'

export class VocabInContext extends MultipleChoiceSentenceActivity {

    title() {
        return 'Vocabulary in Context'
    }

    createTextView() {
        let textView = new TextView(this.rawSentence)
        textView.onClickWord = (word) => this.onClickWord(word)
        textView.renderWord = (word, clean) => {
            if (clean === this.word.word) textView.renderBoldWord(word)
            else textView.defaultRenderWord(word)
        }
        textView.render(this.textE)
    }

    createMultipleChoice() {
        this.multipleChoice = new MultipleChoice(this.languageText.getDefinitionArray(), this.word.definition)
        this.multipleChoice.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.word.word])
            this.controller.addXP(1)
            this.controller.showVocabInContext(this.index + 1)
        }
        this.multipleChoice.render(this.textE)
    }

}
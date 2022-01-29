import { MultipleChoice } from './multiple-choice.js';
import { TextView } from './text-view.js';
import { SentenceActivity } from './sentence-activity.js';
export class Cloze extends SentenceActivity {
    show() {
        super.show();
        this.controller.sidebar.showWordDefinition();
        this.createTextView();
        this.createMultipleChoice();
    }
    title() {
        return 'Cloze';
    }
    cleanup() {
        this.multipleChoice.cleanup();
    }
    createTextView() {
        let textView = new TextView(this.rawSentence);
        textView.onClickWord = (word) => this.controller.sidebar.showWord(word);
        textView.renderWord = (word, clean) => {
            if (clean === this.word.word)
                textView.renderBlank();
            else
                textView.defaultRenderWord(word);
        };
        textView.render(this.textE);
        //        let p = document.createElement('p')
        //        p.innerText = this.sentence.definition
        //        this.textE.append(p)
    }
    createMultipleChoice() {
        this.multipleChoice = new MultipleChoice(this.languageText.getWordStrArray(), this.word.word);
        this.multipleChoice.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.word.word]);
            this.controller.addXP(1);
            this.nextActivity();
        };
        this.multipleChoice.render(this.textE);
    }
}

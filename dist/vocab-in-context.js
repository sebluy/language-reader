import { MultipleChoice } from './multiple-choice.js';
import { TextView } from './text-view.js';
import { SentenceActivity } from './sentence-activity.js';
export class VocabInContext extends SentenceActivity {
    show() {
        super.show();
        this.controller.sidebar.showWordDefinition();
        this.controller.sidebar.showSentence(this.sentence);
        this.controller.sidebar.showAudio();
        this.controller.sidebar.showAudioTimes();
        this.createTextView();
        this.createMultipleChoice();
    }
    cleanup() {
        this.multipleChoice.cleanup();
    }
    title() {
        return 'Vocabulary in Context';
    }
    createTextView() {
        // TODO: use clean sentence for exercises
        let textView = new TextView(this.rawSentence);
        textView.onClickWord = (word) => this.controller.sidebar.showWord(word);
        textView.renderWord = (word, clean) => {
            if (clean === this.word.word)
                textView.renderBoldWord(word);
            else
                textView.defaultRenderWord(word);
        };
        textView.render(this.textE);
    }
    createMultipleChoice() {
        this.multipleChoice = new MultipleChoice(this.languageText.getDefinitionArray(), this.word.definition);
        this.multipleChoice.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.word.word]);
            this.controller.addXP(1);
            this.nextActivity();
        };
        this.multipleChoice.render(this.textE);
    }
}

import { MultipleChoice } from './multiple-choice.js';
import { TextView } from './text-view.js';
import { SentenceActivity } from './sentence-activity.js';
export class Listening extends SentenceActivity {
    // TODO: Fix next word in word definition for these activities
    show(index = 0) {
        super.show();
        this.controller.sidebar.showSentence(this.sentence);
        this.controller.sidebar.showWordDefinition();
        this.controller.sidebar.showAudio();
        this.controller.sidebar.showAudioTimes();
        this.createTextView();
        this.createMultipleChoice();
    }
    title() {
        return 'Listening';
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

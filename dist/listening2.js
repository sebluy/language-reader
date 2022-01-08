import { MultipleChoice } from './multiple-choice.js';
import { MultipleChoiceSentenceActivity } from './multiple-choice-sentence-activity.js';
export class Listening2 extends MultipleChoiceSentenceActivity {
    show() {
        this.controller.sidebar.showSentence(this.sentence);
        this.controller.sidebar.showAudio();
        this.controller.sidebar.showAudioTimes();
    }
    title() {
        return 'Listening 2';
    }
    createTextView() { }
    createMultipleChoice() {
        let definitions = this.languageText.getSentenceDefinitionArray();
        this.multipleChoice = new MultipleChoice(definitions, this.sentence.definition);
        this.multipleChoice.onCorrectAnswer = () => {
            let words = this.rawSentence.getWords();
            this.languageText.updateMastery(words);
            this.controller.addXP(words.length);
            this.controller.showActivity(new Listening2(this.controller, this.index + 1));
        };
        this.multipleChoice.render(this.textE);
    }
}

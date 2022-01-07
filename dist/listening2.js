import { MultipleChoice } from './multiple-choice.js';
import { MultipleChoiceSentenceActivity } from './multiple-choice-sentence-activity.js';
export class Listening2 extends MultipleChoiceSentenceActivity {
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
            this.controller.showListening2(this.index + 1);
        };
        this.multipleChoice.render(this.textE);
    }
}

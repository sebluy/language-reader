import { Utility } from './utility.js';
import { Word } from './word.js';
export class MultipleChoiceSentenceActivity {
    constructor(controller, index = 0) {
        this.controller = controller;
        this.languageText = controller.languageText;
        this.index = index % this.languageText.sentences.length;
        this.pickSentenceAndWord();
        this.textE = Utility.resetMainView(this.title(), 'Sentence ' + (this.index + 1));
        this.createTextView();
        this.createMultipleChoice();
    }
    pickSentenceAndWord() {
        for (let i = 0; i <= this.languageText.sentences.length; i += 1) {
            this.rawSentence = this.languageText.sentences[this.index];
            this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean);
            this.word = this.languageText.leastMasteredWord(this.rawSentence);
            if (this.word.mastery < Word.MAX_MASTERY)
                break;
            if (i === this.languageText.sentences.length)
                break;
            this.index = (this.index + 1) % this.languageText.sentences.length;
        }
        console.log('Sentence index: ' + this.index);
    }
    cleanup() {
        this.multipleChoice.cleanup();
    }
    onClickWord(word) { }
}

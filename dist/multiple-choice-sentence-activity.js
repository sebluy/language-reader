import { Utility } from './utility.js';
import { Word } from './word.js';
export class MultipleChoiceSentenceActivity {
    constructor(controller, index = 0) {
        this.controller = controller;
        this.languageText = controller.languageText;
        this.index = index % this.languageText.sentences.length;
        this.textE = Utility.resetMainView(this.title());
        this.pickSentenceAndWord();
        this.createTextView();
        this.createMultipleChoice();
    }
    pickSentenceAndWord() {
        let i = this.index;
        while (true) {
            this.rawSentence = this.languageText.sentences[i];
            this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean);
            this.word = this.languageText.leastMasteredWord(this.rawSentence);
            if (i === this.index)
                break;
            if (this.word.mastery < Word.MAX_MASTERY)
                break;
            i = (i + 1) % this.languageText.sentences.length;
        }
        this.index = i;
        console.log('Sentence index: ' + this.index);
    }
    cleanup() {
        this.multipleChoice.cleanup();
    }
    onClickWord(word) { }
}

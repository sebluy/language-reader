import { Utility } from './utility.js';
import { Word } from './word.js';
export class MultipleChoiceSentenceActivity {
    constructor(controller, index = 0) {
        this.controller = controller;
        this.languageText = controller.languageText;
        this.index = index % this.languageText.sentences.length;
        this.textE = Utility.resetMainView(this.title());
        let i = this.languageText.sentences.length;
        while (i > 0) {
            this.rawSentence = this.languageText.sentences[this.index];
            this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean);
            this.word = this.languageText.leastMasteredWord(this.rawSentence);
            if (this.word.mastery < Word.MAX_MASTERY)
                break;
            this.index = (this.index + 1) % this.languageText.sentences.length;
            i -= 1;
        }
        this.createTextView();
        this.createMultipleChoice();
    }
    cleanup() {
        this.multipleChoice.cleanup();
    }
    onClickWord(word) { }
}

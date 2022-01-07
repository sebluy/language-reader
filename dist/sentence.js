export class Sentence {
    constructor(sentence, definition = '') {
        this.sentence = sentence;
        this.definition = definition;
    }
    getRawWords() {
        return this.sentence.split(/\s+/).filter(v => v !== '');
    }
}

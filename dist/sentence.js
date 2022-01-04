export class Sentence {
    constructor(sentence, definition = '', mastery = 0) {
        this.sentence = sentence;
        this.definition = definition;
        this.mastery = mastery;
    }
    nextMastery() {
        if (this.mastery === 5)
            return;
        this.mastery += 1;
    }
    getRawWords() {
        return this.sentence.split(/\s+/).filter(v => v !== '');
    }
}

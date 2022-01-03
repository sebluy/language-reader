export class Word {
    constructor(word, definition = '', mastery = 0, count = 1) {
        this.word = word;
        this.definition = definition;
        this.mastery = mastery;
        this.count = count;
    }
    nextMastery() {
        if (this.mastery === Word.MAX_MASTERY)
            return this;
        this.mastery += 1;
        return this;
    }
    getTranslatedCount() {
        if (this.definition === '')
            return 0;
        return this.count;
    }
}
Word.MAX_MASTERY = 5;

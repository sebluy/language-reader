export class Word {
    word: string
    definition: string
    mastery: number
    count: number
    static MAX_MASTERY = 5

    constructor(word, definition = '', mastery = 0, count = 1) {
        this.word = word
        this.definition = definition
        this.mastery = mastery
        this.count = count
    }

    nextMastery() {
        if (this.mastery === Word.MAX_MASTERY) return this
        this.mastery += 1
        return this
    }

    getTranslatedCount() {
        if (this.definition === '') return 0
        return this.count
    }

    getNewCount() {
        return this.definition === '' ? 1 : 0;
    }

}
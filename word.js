export class Word {

    constructor(word, definition = '', mastery = 0, count = 1) {
        this.word = word
        this.definition = definition
        this.mastery = mastery
        this.count = count
    }

    nextMastery() {
        if (this.mastery === 5) return
        this.mastery += 1
    }

    getTranslatedCount() {
        if (this.definition === '') return 0
        return this.count
    }

}
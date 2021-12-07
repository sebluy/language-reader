import { Utility } from "./utility.js"

export class Sentence {
    sentence: string
    mastery: number
    startTime: number
    endTime: number

    constructor(sentence, mastery = 0) {
        this.sentence = sentence
        this.mastery = mastery
    }

    nextMastery() {
        if (this.mastery === 5) return
        this.mastery += 1
    }

    getRawWords() {
        return this.sentence.split(/\s+/).filter(v => v !== '')
    }

}
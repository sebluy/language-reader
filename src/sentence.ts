
export class Sentence {
    sentence: string
    definition: string
    mastery: number
    startTime: number
    endTime: number

    constructor(sentence, definition = '') {
        this.sentence = sentence
        this.definition = definition
    }

    getRawWords() {
        return this.sentence.split(/\s+/).filter(v => v !== '')
    }

}
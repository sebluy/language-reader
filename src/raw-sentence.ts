import { Utility } from "./utility.js"

export class RawSentence {
    raw: string
    clean: string

    constructor(raw, clean) {
        this.raw = raw
        this.clean = clean
    }

    getWords() {
        return this.clean.split(/\s+/).map(Utility.cleanWord).filter(v => v !== '')
    }

    getWordsAndSpaces() {
        return this.raw.split(/(\s+)/)
    }

}
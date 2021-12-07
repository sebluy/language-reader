import { Utility } from "./utility.js";
export class RawSentence {
    constructor(raw, clean) {
        this.raw = raw;
        this.clean = clean;
    }
    getWords() {
        return this.clean.split(/\s+/).map(Utility.cleanWord).filter(v => v !== '');
    }
    getWordsAndSpaces() {
        return this.raw.split(/(\s+)/);
    }
}

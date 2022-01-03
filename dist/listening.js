import { Utility } from './utility.js';
import { MultipleChoice } from './multiple-choice.js';
export class Listening {
    constructor(controller, index = 0) {
        this.controller = controller;
        this.languageText = controller.languageText;
        this.index = index % this.languageText.sentences.length;
        let es = Utility.resetMainView();
        this.titleE = es[0];
        this.titleE.textContent = 'Listening';
        this.textE = es[1];
        this.textE.addEventListener('click', (e) => this.clickWord(e));
        this.rawSentence = this.languageText.sentences[this.index];
        this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean);
        this.solution = this.leastMastery().word;
        this.buildSentence();
        this.createOptions();
        this.multipleChoice = new MultipleChoice(this.options, this.solution);
        this.multipleChoice.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.solution]);
            this.controller.addXP(1);
            this.controller.showListening(this.index + 1);
        };
        this.multipleChoice.render(this.textE);
    }
    cleanup() {
        this.multipleChoice.cleanup();
    }
    createOptions() {
        let words = Array.from(this.languageText.words);
        this.options = [this.solution];
        while (this.options.length < 4) {
            let option = Utility.randomItem(words)[1].word;
            if (this.options.indexOf(option) === -1)
                this.options.push(option);
        }
        Utility.shuffle(this.options);
    }
    leastMastery() {
        let wordMap = this.languageText.getWordMap(this.rawSentence.getWords());
        return Utility.randomWordsByMastery(wordMap, 1)[0];
    }
    buildSentence() {
        this.textE.innerHTML = '';
        let wordsAndSpaces = this.rawSentence.getWordsAndSpaces();
        wordsAndSpaces.forEach((word) => {
            if (word.trim() === '') {
                this.textE.appendChild(document.createTextNode(word));
                return;
            }
            let cWord = Utility.cleanWord(word);
            if (cWord === '') {
                this.textE.appendChild(document.createTextNode(word));
                return;
            }
            if (cWord === this.solution) {
                this.textE.appendChild(document.createTextNode('________'));
                return;
            }
            const span = document.createElement('span');
            span.innerText = word;
            this.textE.appendChild(span);
        });
    }
    clickWord(e) {
        if (e.target.matches('span')) {
            const word = Utility.cleanWord(e.target.innerHTML);
            let wordO = this.languageText.words.get(word);
            if (wordO === undefined)
                return;
            this.onClickWord(wordO);
        }
    }
    onClickWord(word) { }
}

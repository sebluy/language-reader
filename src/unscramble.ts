import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Sentence } from './sentence.js';
import { Word } from './word.js';
import { ControllerInterface } from './controller-interface.js'
import { Activity } from './controller.js'

export class Unscramble implements Activity {

    controller: ControllerInterface
    languageText: LanguageText
    textE: HTMLElement
    sentence: Sentence
    words: Array<string>

    constructor(controller) {
        this.controller = controller
        this.languageText = controller.languageText
        this.sentence = this.languageText.getNextSentenceByMastery()

        this.textE = Utility.resetMainView('Unscramble')
        this.textE.addEventListener('click', (e) => this.clickWord(e))

        console.log(this.sentence)
        this.words = this.sentence.getRawWords()
        let shuffled = [...this.words]
        Utility.shuffle(shuffled)
        this.build(shuffled)
    }

    checkAnswer() {
        let current = this.getCurrentOrder()
        for (let i = 0; i < this.words.length; i++) {
            if (this.words[i] !== current[i]) return
        }
        this.sentence.nextMastery()
        this.languageText.updateSentence(this.sentence)
        this.controller.addXP(this.words.length * 3)
        this.controller.showUnscramble()
    }

    getCurrentOrder() {
        let els = this.textE.getElementsByClassName('matching-item')
        let current = []
        for (let i = 0; i < els.length; i++) {
            let input = <HTMLInputElement>els[i]
            if (input.innerText !== ' ') current.push(input.innerText)
        }
        return current
    }

    build(current) {
        this.textE.innerHTML = ''
        current.forEach((word, i) => {
            this.textE.append(Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-item-' + i,
                text: word,
            }))
            if (i === current.length - 1) return
            this.textE.append(Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-blank-' + i,
                text: ' ',
                onDrop: () => this.build(this.getCurrentOrder())
            }))
        })
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const word = Utility.cleanWord(e.target.innerHTML)
            let wordO = this.languageText.words.get(word)
            if (wordO === undefined) return
            this.onClickWord(word)
        }
    }

    onClickWord(word: Word) {}

    cleanup() {}

}
import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Sentence } from './sentence.js';
import { Activity } from './activity.js'

export class Unscramble extends Activity {

    languageText: LanguageText
    textE: HTMLElement
    sentence: Sentence
    words: Array<string>

    constructor(controller) {
        super(controller)
        this.languageText = controller.languageText
        this.sentence = null // TODO: fix this for new mastery

        this.controller.mainWindow.reset('Unscramble', 'TODO')
        this.textE = this.controller.mainWindow.contentDiv
        this.textE.addEventListener('click', (e) => this.clickWord(e))

        console.log(this.sentence)
        this.words = this.sentence.getRawWords()
        let shuffled = [...this.words]
        Utility.shuffle(shuffled)
        this.build(shuffled)
    }

    show() {
        let sidebar = this.controller.sidebar
        sidebar.showSentence(this.sentence)
        sidebar.showAudio()
        sidebar.showAudioTimes()
        sidebar.showCheckAnswerButton(() => this.checkAnswer())
    }

    checkAnswer() {
        let current = this.getCurrentOrder()
        for (let i = 0; i < this.words.length; i++) {
            if (this.words[i] !== current[i]) return
        }
        this.languageText.updateSentence(this.sentence)
        // this.controller.addXP(this.words.length * 3)
        this.nextActivity()
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
        let p = document.createElement('p')
        p.innerText = this.sentence.definition
        this.textE.append(p)
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const word = Utility.cleanWord(e.target.innerHTML)
            let wordO = this.languageText.words.get(word)
            if (wordO === undefined) return
            this.controller.sidebar.showWord(word.word)
        }
    }

    cleanup() {}

}
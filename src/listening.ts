import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Sentence } from './sentence.js';
import { Word } from './word.js';
import { ControllerInterface } from './controller-interface.js'
import { RawSentence } from './raw-sentence.js'
import { Activity } from './controller.js'

export class Listening implements Activity {

    controller: ControllerInterface
    languageText: LanguageText
    titleE: HTMLElement
    textE: HTMLElement
    sentence: Sentence
    rawSentence: RawSentence
    index: number
    solution: Word
    options: Array<string>
    keyListener: (Event) => void;

    constructor(controller, index = 0) {
        this.controller = controller
        this.languageText = controller.languageText
        this.index = index % this.languageText.sentences.length

        let es = Utility.resetMainView()
        this.titleE = es[0]
        this.titleE.textContent = 'Listening'
        this.textE = es[1]
        this.textE.addEventListener('click', (e) => this.clickWord(e))

        this.rawSentence = this.languageText.sentences[this.index]
        this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean)
        this.solution = this.leastMastery()
        this.buildSentence()
        this.createOptions()
        this.buildOptions()
        this.keyListener = (e) => this.handleKey(e)
        document.addEventListener('keydown', this.keyListener);
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyListener);
    }

    createOptions() {
        let words = Array.from(this.languageText.words)
        this.options = [this.solution.word]
        while (this.options.length < 4) {
            let option = Utility.randomItem(words)[0]
            if (this.options.indexOf(option) === -1) this.options.push(option)
        }
        Utility.shuffle(this.options)
    }

    leastMastery() {
        let wordMap = this.languageText.getWordMap(this.rawSentence.getWords())
        return Utility.randomWordsByMastery(wordMap, 1)[0]
    }

    buildSentence() {
        this.textE.innerHTML = ''
        let wordsAndSpaces = this.rawSentence.getWordsAndSpaces()
        wordsAndSpaces.forEach((word) => {
            if (word.trim() === '') {
                this.textE.appendChild(document.createTextNode(word))
                return
            }
            let cWord = Utility.cleanWord(word)
            if (cWord === '') {
                this.textE.appendChild(document.createTextNode(word))
                return
            }
            if (cWord === this.solution.word) {
                this.textE.appendChild(document.createTextNode('________'))
                return
            }
            const span = document.createElement('span')
            span.innerText = word
            this.textE.appendChild(span)
        })
    }

    buildOptions() {
        let div = document.createElement('div')
        this.options.forEach((option, index) => {
            let button = document.createElement('button')
            button.innerText = (index + 1) + '. ' + option
            button.classList.add('multiple-choice')
            button.addEventListener('click', () => this.checkAnswer(option))
            div.appendChild(button)
        })
        this.textE.append(div)
    }

    checkAnswer(option) {
        if (option === this.solution.word) {
            this.languageText.updateMastery([this.solution.word])
            this.controller.addXP(1)
            this.controller.showListening(this.index + 1)
        }
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const word = Utility.cleanWord(e.target.innerHTML)
            let wordO = this.languageText.words.get(word)
            if (wordO === undefined) return
            this.onClickWord(wordO)
        }
    }

    onClickWord(word: Word) {}

    handleKey(e) {
        if (['1', '2', '3', '4'].indexOf(e.key) !== -1) {
            e.preventDefault()
            let index = Number.parseInt(e.key) - 1
            this.checkAnswer(this.options[index])
        }
        e.stopPropagation()
    }
}
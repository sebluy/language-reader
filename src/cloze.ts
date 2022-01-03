import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Sentence } from './sentence.js';
import { Word } from './word.js';
import { ControllerInterface } from './controller-interface.js'
import { RawSentence } from './raw-sentence.js'
import { Activity } from './controller.js'
import { MultipleChoice } from './multiple-choice.js'

export class Cloze implements Activity {

    // TODO: dedupe with listening and vocab in context
    // TODO: dedupe using text area object?
    // TODO: add full sentence translation

    controller: ControllerInterface
    languageText: LanguageText
    titleE: HTMLElement
    textE: HTMLElement
    sentence: Sentence
    rawSentence: RawSentence
    index: number
    solution: Word
    multipleChoice: MultipleChoice

    constructor(controller, index = 0) {
        this.controller = controller
        this.languageText = controller.languageText
        this.index = index % this.languageText.sentences.length

        let es = Utility.resetMainView()
        this.titleE = es[0]
        this.titleE.textContent = 'Vocabulary In Context'
        this.textE = es[1]
        this.textE.addEventListener('click', (e) => this.clickWord(e))

        this.rawSentence = this.languageText.sentences[this.index]
        this.sentence = this.languageText.sentenceMap.get(this.rawSentence.clean)
        this.solution = this.leastMastery().word
        this.buildSentence()
        let options = this.createOptions()

        this.multipleChoice = new MultipleChoice(options, this.solution)
        this.multipleChoice.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.solution])
            this.controller.addXP(1)
            this.controller.showCloze(this.index + 1)
        }
        this.multipleChoice.render(this.textE)
    }

    cleanup() {
        this.multipleChoice.cleanup()
    }

    createOptions() {
        let words = Array.from(this.languageText.words)
        let options = [this.solution]
        while (options.length < 4) {
            let option = Utility.randomItem(words)[1].word
            if (options.indexOf(option) === -1) options.push(option)
        }
        Utility.shuffle(options)
        return options
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
            if (cWord === this.solution) {
                this.textE.appendChild(document.createTextNode('________'))
                return
            }
            const span = document.createElement('span')
            span.innerText = word
            this.textE.appendChild(span)
        })
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

}
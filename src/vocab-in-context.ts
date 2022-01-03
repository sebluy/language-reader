import { Utility } from './utility.js'
import { LanguageText } from './language-text.js'
import { Sentence } from './sentence.js';
import { Word } from './word.js';
import { ControllerInterface } from './controller-interface.js'
import { RawSentence } from './raw-sentence.js'
import { Activity } from './controller.js'
import { MultipleChoice } from './multiple-choice.js'

export class VocabInContext implements Activity {

    // TODO: dedupe with listening

    controller: ControllerInterface
    languageText: LanguageText
    titleE: HTMLElement
    textE: HTMLElement
    sentence: Sentence
    rawSentence: RawSentence
    index: number
    word: Word
    options: Array<string>
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
        this.word = this.leastMastery()
        this.buildSentence()
        this.createOptions()

        this.multipleChoice = new MultipleChoice(this.options, this.word.definition)
        this.multipleChoice.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.word.word])
            this.controller.addXP(1)
            this.controller.showVocabInContext(this.index + 1)
        }
        this.multipleChoice.render(this.textE)
    }

    cleanup() {
        this.multipleChoice.cleanup()
    }

    createOptions() {
        let words = Array.from(this.languageText.words)
        this.options = [this.word.definition]
        while (this.options.length < 4) {
            let option = Utility.randomItem(words)[1].definition
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
            const span = document.createElement('span')
            span.innerText = word
            if (cWord === this.word.word) span.classList.add('bold')
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
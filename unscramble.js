import { Utility } from './utility.js'

export class Unscramble {

    constructor(sidebar) {
        this.sidebar = sidebar
        this.languageText = sidebar.languageText

        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')

        this.titleE.textContent = 'Unscramble'

        this.sentence = this.languageText.getNextSentenceByMastery()
        let sentenceData = this.languageText.sentenceMap.get(this.sentence.sentence)
        console.log(sentenceData)
        this.words = this.sentence.sentence.split(/\s+/).filter((word) => word !== '')
        let shuffled = [...this.words]
        Utility.shuffle(shuffled)
        this.build(shuffled)
        this.sidebar.setAudio(sentenceData.startTime, sentenceData.endTime)
        this.sidebar.playAudio()
    }

    checkAnswer() {
        let current = this.getCurrentOrder()
        for (let i = 0; i < this.words.length; i++) {
            if (this.words[i] !== current[i]) return
        }
        this.sidebar.addXP(this.words.length * 3)
        this.languageText.updateSentenceMastery(this.sentence.sentence)
        this.sidebar.updateStats()
        new Unscramble(this.sidebar)
    }

    getCurrentOrder() {
        let els = this.element.getElementsByClassName('matching-item')
        let current = []
        for (let i = 0; i < els.length; i++) {
            if (els[i].innerText !== ' ') current.push(els[i].innerText)
        }
        return current
    }

    build(current) {
        this.element.innerHTML = ''
        current.forEach((word, i) => {
            this.element.append(Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-item-' + i,
                text: word,
            }))
            if (i === current.length - 1) return
            this.element.append(Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-blank-' + i,
                text: ' ',
                onDrop: () => this.build(this.getCurrentOrder())
            }))
        })
        let div = document.createElement('div')
        let button = document.createElement('button')
        button.innerText = 'Check Answer'
        button.onclick = () => this.checkAnswer()
        div.append(button)
        this.element.append(div)
    }

}
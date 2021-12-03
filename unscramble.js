import { Utility } from './utility.js'

export class Unscramble {

    constructor(sidebar) {
        this.sidebar = sidebar
        this.languageText = sidebar.languageText

        let es = Utility.resetMainView()
        this.titleE = es[0]
        this.titleE.textContent = 'Unscramble'
        this.textE = es[1]
        this.textE.addEventListener('click', (e) => this.clickWord(e))

        this.sentence = this.languageText.getNextSentenceByMastery()
        this.sidebar.showSentence(this.sentence)
        console.log(this.sentence)
        this.words = this.sentence.sentence.split(/\s+/).filter((word) => word !== '')
        let shuffled = [...this.words]
        Utility.shuffle(shuffled)
        this.build(shuffled)
        this.sidebar.setAudio(this.sentence.startTime, this.sentence.endTime)
        if (this.sentence.startTime !== undefined) this.sidebar.playAudio()
    }

    checkAnswer() {
        let current = this.getCurrentOrder()
        for (let i = 0; i < this.words.length; i++) {
            if (this.words[i] !== current[i]) return
        }
        this.sidebar.addXP(this.words.length * 3)
        this.languageText.updateSentenceMastery(this.sentence.sentence)
        this.sidebar.updateStats()
        this.sidebar.unscramble = new Unscramble(this.sidebar)
    }

    getCurrentOrder() {
        let els = this.textE.getElementsByClassName('matching-item')
        let current = []
        for (let i = 0; i < els.length; i++) {
            if (els[i].innerText !== ' ') current.push(els[i].innerText)
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
            this.sidebar.showWord(wordO)
        }
    }

}
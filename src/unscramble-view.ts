import { Utility } from './utility.js'

export class UnscrambleView {

    word: string
    words: Array<string>
    current: Array<string>
    p: HTMLElement
    SCRAMBLE_COUNT: number = 5

    constructor(parent, words, word) {
        this.p = document.createElement('p')
        this.words = words
        this.word = word
        this.p.addEventListener('click', (e) => this.clickWord(e))
        this.buildCurrent()
        parent.append(this.p)
    }

    buildCurrent() {
        this.current = [...this.words]
        if (this.current.length <= 1) return
        let currentIndex = this.words.indexOf(this.word)
        for (let i = 0; i < this.SCRAMBLE_COUNT; i++) {
            let randomIndex = Math.floor(Math.random() * this.words.length)
            let temp = this.current[currentIndex]
            this.current[currentIndex] = this.current[randomIndex]
            this.current[randomIndex] = temp
            currentIndex = randomIndex;
        }
    }

    checkAnswer() {
        for (let i = 0; i < this.words.length; i++) {
            if (this.words[i] !== this.current[i]) return false
        }
        return true
    }

    updateCurrentOrder() {
        let els = this.p.getElementsByClassName('matching-item')
        let current = []
        for (let i = 0; i < els.length; i++) {
            let input = <HTMLInputElement>els[i]
            if (input.innerText !== ' ') current.push(input.innerText)
        }
        this.current = current
    }

    render() {
        this.p.innerHTML = ''
        this.current.forEach((word, i) => {
            this.p.append(Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-item-' + i,
                text: word,
                onDrop: () => this.onDrop()
            }))
            if (i === this.current.length - 1) return
            this.p.append(Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-blank-' + i,
                text: ' ',
                onDrop: () => this.onDrop()
            }))
        })
    }

    onDrop() {
        this.updateCurrentOrder()
        if (this.checkAnswer()) {
            this.onCorrectAnswer()
        } else {
            this.render()
        }
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const word = Utility.cleanWord(e.target.innerHTML)
            this.onClickWord(word)
        }
    }

    onClickWord(word: string): void {}
    onCorrectAnswer(): void {}

}
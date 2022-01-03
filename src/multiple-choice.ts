import { Utility } from './utility.js'

export class MultipleChoice {

    solution: string
    options: Array<string>
    keyListener: (Event) => void;

    constructor(pool: Array<string>, solution: string) {
        this.solution = solution
        this.createOptions(pool)
        this.keyListener = (e) => this.handleKey(e)
        document.addEventListener('keydown', this.keyListener);
    }

    createOptions(pool: Array<string>) {
        this.options = [this.solution]
        while (this.options.length < 4) {
            let option = Utility.randomItem(pool)
            if (this.options.indexOf(option) === -1) this.options.push(option)
        }
        Utility.shuffle(this.options)
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyListener);
    }

    render(parent: HTMLElement) {
        let div = document.createElement('div')
        this.options.forEach((option, index) => {
            let button = document.createElement('button')
            button.innerText = (index + 1) + '. ' + option
            button.classList.add('multiple-choice')
            button.addEventListener('click', () => this.checkAnswer(option))
            div.appendChild(button)
        })
        parent.append(div)
    }

    checkAnswer(option) {
        if (option === this.solution) {
            this.onCorrectAnswer()
        }
    }

    onCorrectAnswer() {}

    handleKey(e) {
        if (['1', '2', '3', '4'].indexOf(e.key) !== -1) {
            e.preventDefault()
            let index = Number.parseInt(e.key) - 1
            this.checkAnswer(this.options[index])
        }
        e.stopPropagation()
    }
}
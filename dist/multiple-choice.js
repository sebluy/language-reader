export class MultipleChoice {
    constructor(options, solution) {
        this.options = options;
        this.solution = solution;
        this.keyListener = (e) => this.handleKey(e);
        document.addEventListener('keydown', this.keyListener);
    }
    cleanup() {
        document.removeEventListener('keydown', this.keyListener);
    }
    render(parent) {
        let div = document.createElement('div');
        this.options.forEach((option, index) => {
            let button = document.createElement('button');
            button.innerText = (index + 1) + '. ' + option;
            button.classList.add('multiple-choice');
            button.addEventListener('click', () => this.checkAnswer(option));
            div.appendChild(button);
        });
        parent.append(div);
    }
    checkAnswer(option) {
        if (option === this.solution) {
            this.onCorrectAnswer();
        }
    }
    onCorrectAnswer() { }
    handleKey(e) {
        if (['1', '2', '3', '4'].indexOf(e.key) !== -1) {
            e.preventDefault();
            let index = Number.parseInt(e.key) - 1;
            this.checkAnswer(this.options[index]);
        }
        e.stopPropagation();
    }
}

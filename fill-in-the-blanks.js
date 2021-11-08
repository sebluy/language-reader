module.exports = class FillInTheBlanks {
    constructor(languageText) {
        this.languageText = languageText

        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')

        this.element.innerHTML = ''
        this.titleE.textContent = 'Fill in the Blanks'

        let sentences = this.languageText.getRandomSentenceBlock(7)
        sentences.forEach((sentence) => {
            this.languageText.addText(sentence)
        })
        this.createBlanksAndChoices(sentences)
    }

    randomElement(a) {
        return a[Math.floor(Math.random() * a.length)]
    }

    createBlanksAndChoices(sentences)
    {
        let choices = []
        for (let i = 0; i < sentences.length; i++) {
            let [word, data] = this.languageText.weightedRandomWord(sentences[i].words)
            let span = this.randomElement(data.spans)
            let blank = this.languageText.createDraggableItem(
                'matching-blank-' + i, word, '          ', word, 'span'
            )
            choices.push([word, data])
            span.parentNode.replaceChild(blank, span)
        }
        this.languageText.shuffle(choices)
        this.element.append('\n')
        choices.forEach(([word, data], i) => {
            let item = this.languageText.createDraggableItem('matching-word-' + i, word, word, '', 'span')
            this.element.append(item)
        })
    }

}
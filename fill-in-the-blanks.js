const Utility = require('./utility')

module.exports = class FillInTheBlanks {
    constructor(sidebar) {
        this.sidebar = sidebar
        this.languageText = sidebar.languageText
        this.reader = this.sidebar.reader
        let sentences = this.languageText.getRandomSentenceBlock(7)
        this.reader.load('Fill in the Blanks', sentences)
        this.createBlanksAndChoices(sentences)
    }

    randomElement(a) {
        return a[Math.floor(Math.random() * a.length)]
    }

    createBlanksAndChoices(sentences)
    {
        let numCorrect = 0
        let onMatch = (word, correct) => {
            this.languageText.updateMastery(word, correct)
            numCorrect += 1
            if (numCorrect === sentences.length) {
                new FillInTheBlanks(this.sidebar)
            }
        }
        let choices = []
        for (let i = 0; i < sentences.length; i++) {
            let randomWord = Utility.weightedRandomWords(sentences[i].words, 1)
            if (randomWord.length === 0) continue
            let [word, data] = randomWord[0]
            let span = this.randomElement(data.spans)
            let blank = Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-blank-' + i,
                word: word,
                text: '           ',
                solution: word,
                onMatch: onMatch
            })
            choices.push([word, data])
            span.parentNode.replaceChild(blank, span)
        }
        Utility.shuffle(choices)
        this.reader.element.append('\n')
        choices.forEach(([word, data], i) => {
            let item = Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-word-' + i,
                text: word,
            })
            this.reader.element.append(item)
        })
    }

}
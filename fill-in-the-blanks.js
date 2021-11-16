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
        let onDrop = () => {
            if (this.checkAnswer(words, blanks)) {
                words.forEach(([word]) => this.languageText.updateMastery(word))
                this.sidebar.addXP(sentences.length * 2)
                this.sidebar.updateStats()
                new FillInTheBlanks(this.sidebar)
            }
        }
        let blanks = []
        let words = []
        for (let i = 0; i < sentences.length; i++) {
            let randomWord = Utility.weightedRandomWords(sentences[i].words, 1)
            if (randomWord.length === 0) continue
            let [word, data] = randomWord[0]
            let span = this.randomElement(data.spans)
            let blank = Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-blank-' + i,
                text: '           ',
                onDrop: onDrop
            })
            words.push([word, data])
            blanks.push(blank)
            span.parentNode.replaceChild(blank, span)
        }
        let choices = [...words]
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

    checkAnswer(words, blanks) {
        let wrong = words.find(([word], i) => blanks[i].innerHTML !== word)
        return wrong === undefined
    }
}
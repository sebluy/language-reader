module.exports = class VocabularyMatching {

    constructor(languageText) {
        this.languageText = languageText

        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')

        this.titleE.textContent = 'Vocabulary Matching'
        this.languageText.sidebar.updateStats()

        this.buildGrid()
    }

    buildGrid() {
        this.element.innerHTML = ''
        let words = [];
        let definitions = [];
        let randomWords = this.languageText.weightedRandomWords(this.languageText.words, 8)
        randomWords.forEach(([word, data]) => {
            words.push(word)
            definitions.push(data.definition)
        })
        let shuffled = [...definitions]
        this.languageText.shuffle(shuffled)
        let rows = []
        let numCorrect = 0
        let correctCb = () => {
            numCorrect += 1
            if (numCorrect === words.length) {
                new VocabularyMatching(this.languageText)
            }
        }
        for (let i in words) {
            rows.push(['tr',
                ['td', {className: 'matching-item'}, words[i]],
                this.languageText.createDraggableItem('matching-blank-' + i, words[i], '', definitions[i], correctCb),
                this.languageText.createDraggableItem('matching-definition-' + i, words[i], shuffled[i], '', correctCb),
            ])
        }
        this.element.append(this.languageText.createHTML(['table', ['tbody', ...rows]]))
    }

}
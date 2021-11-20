const Utility = require('./utility')

module.exports = class VocabularyMatching {

    constructor(sidebar) {
        this.sidebar = sidebar
        this.languageText = sidebar.languageText

        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')

        this.titleE.textContent = 'Vocabulary Matching'
        this.sidebar.updateStats()

        this.buildGrid(this.getRandomWords())
    }

    getRandomWords()
    {
        let words = [];
        let definitions = [];
        let randomWords = Utility.randomWordsByMastery(this.languageText.words, 8)
        randomWords.forEach((word) => {
            words.push(word.word)
            definitions.push(word.definition)
        })
        let shuffled = [...definitions]
        Utility.shuffle(shuffled)
        return [words, definitions, shuffled]
    }

    checkAnswer(rows, definitions) {
        for (let i = 0; i < rows.length; i++) {
            let el = rows[i][2]
            if (el.innerHTML !== definitions[i]) return false
        }
        return true
    }

    buildGrid([words, definitions, shuffled]) {
        let onDrop = () => {
            if (this.checkAnswer(rows, definitions)) {
                words.forEach((word) => this.languageText.updateMastery(word))
                this.sidebar.addXP(definitions.length)
                new VocabularyMatching(this.sidebar)
            }
        }
        let rows = []
        for (let i in words) {
            rows.push(['tr',
                ['td', {className: 'matching-item'}, words[i]],
                Utility.createDraggableItem({
                    tag: 'td',
                    id: 'matching-blank-' + i,
                    text: '',
                    onDrop: onDrop
                }),
                Utility.createDraggableItem({
                    tag: 'td',
                    id: 'matching-definition-' + i,
                    text: shuffled[i],
                })
            ])
        }
        this.element.innerHTML = ''
        this.element.append(Utility.createHTML(['table', ['tbody', ...rows]]))
    }

}
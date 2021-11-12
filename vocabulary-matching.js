const Utility = require('./utility')

module.exports = class VocabularyMatching {

    constructor(languageText) {
        this.languageText = languageText

        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')

        this.titleE.textContent = 'Vocabulary Matching'
        this.languageText.sidebar.updateStats()

        this.buildGrid(this.getRandomWords())
    }

    getRandomWords()
    {
        let words = [];
        let definitions = [];
        let randomWords = Utility.weightedRandomWords(this.languageText.words, 8)
        randomWords.forEach(([word, data]) => {
            words.push(word)
            definitions.push(data.definition)
        })
        let shuffled = [...definitions]
        Utility.shuffle(shuffled)
        return [words, definitions, shuffled]
    }

    buildGrid([words, definitions, shuffled]) {
        let numCorrect = 0
        let onMatch = (word, success) => {
            this.languageText.updateMastery(word, success)
            numCorrect += 1
            if (numCorrect === words.length) {
                new VocabularyMatching(this.languageText)
            }
        }
        let rows = []
        for (let i in words) {
            rows.push(['tr',
                ['td', {className: 'matching-item'}, words[i]],
                Utility.createDraggableItem({
                    tag: 'td',
                    id: 'matching-blank-' + i,
                    word: words[i],
                    text: '',
                    solution: definitions[i],
                    onMatch: onMatch
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
const Utility = require('./utility')

module.exports = class Unscramble {

    constructor(sidebar) {
        this.sidebar = sidebar
        this.languageText = sidebar.languageText

        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')

        this.titleE.textContent = 'Unscramble'

        let sentence = this.languageText.getRandomSentenceBlock(1)[0]
        this.build(sentence)
        this.sidebar.setAudio(sentence.startTime, sentence.endTime)
    }

    build(sentence) {
        let words = sentence.text.split(/\s+/).filter((word) => word !== '')
        let numCorrect = 0
        let onMatch = (word, success) => {
            if (success) numCorrect += 1
            if (numCorrect === words.length) {
                new Unscramble(this.sidebar)
            }
        }
        let shuffled = [...words]
        Utility.shuffle(shuffled)
        this.element.innerHTML = ''
        words.forEach((word, i) => {
            this.element.append(Utility.createDraggableItem({
                tag: 'span',
                id: 'matching-item-' + i,
                word: shuffled[i],
                text: shuffled[i],
                solution: words[i],
                onMatch: onMatch
            }))
        })
    }

}
const Utility = require('./utility')

module.exports = class Reader {

    constructor(sidebar) {
        this.sidebar = sidebar
        this.languageText = sidebar.languageText

        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')

        this.element.addEventListener('click', (e) => this.clickWord(e))
        // How to remove this for new instances
        document.addEventListener('keydown', (e) => this.sidebar.handleKey(e))
    }

    load(title = null, sentences = null) {
        if (title === null) title = this.languageText.filename
        if (sentences === null) sentences = this.languageText.sentences
        this.languageText.words.forEach((v, k) => v.spans = [])
        this.titleE.textContent = title
        this.element.innerHTML = ''
        this.addSentences(sentences)
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const oldWordE = document.querySelector('span.selected')
            if (oldWordE) oldWordE.classList.remove('selected')
            e.target.classList.add('selected')
            const word = Utility.cleanWord(e.target.innerHTML)
            this.sidebar.showWordAndDefinition(word, this.languageText.words.get(word).definition)
        }
    }

    nextWord() {
        const current = document.querySelector('span.selected')
        if (!current) return
        let sibling = current.nextElementSibling
        if (sibling) {
            sibling.click()
            return
        }
        let parentSibling = current.parentNode.nextSibling
        if (parentSibling && parentSibling.firstChild) {
            parentSibling.firstChild.click()
        }
    }

    updateHighlighting(word) {
        const data = this.languageText.words.get(word)
        data.spans.forEach((span) => {
            if (this.sidebar.isHighlightChecked() && data.definition !== '') {
                let hue = ((1 - data.mastery) * 120).toString(10)
                span.style.backgroundColor = 'hsl(' + hue + ',100%,75%)'
            } else {
                span.style.backgroundColor = ''
            }
        })
    }

    highlight() {
        this.languageText.words.forEach((data, word) => this.updateHighlighting(word))
    }

    addSentences(sentences) {
        sentences.forEach((sentence) => {
            let wordsAndSpaces = sentence.text.split(/(\s+)/)
            sentence.span = document.createElement('span')
            this.element.appendChild(sentence.span)
            wordsAndSpaces.forEach((word) => {
                if (word.trim() === '') {
                    sentence.span.appendChild(document.createTextNode(word))
                    return
                }
                const span = document.createElement('span')
                span.innerHTML = word
                sentence.span.appendChild(span)
                word = Utility.cleanWord(word)
                if (word === '') return
                // TODO: FIX THIS
                this.languageText.words.get(word).spans.push(span)
            })
        })
    }

    highlightSentence(sentence) {
        sentence.span.classList.add('highlight-sentence')
    }

    removeSentenceHighlighting(sentence) {
        sentence.span.classList.remove('highlight-sentence')
    }
}

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

    load(title, text) {
        this.languageText.words.forEach((v, k) => v.spans = [])
        this.titleE.textContent = title
        this.element.innerHTML = ''
        this.addText(text)
    }

    addWordToDisplay(word) {
        const span = document.createElement('span')
        span.innerHTML = word
        this.element.appendChild(span)
        return span
    }

    cleanWord(word) {
        const punctuation = /[,.!?"“„:\-–;]+/
        const regex = new RegExp('^' + punctuation.source + '|' + punctuation.source + '$', 'g')
        return word.replaceAll(regex, '').toLowerCase()
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const oldWordE = document.querySelector('span.selected')
            if (oldWordE) oldWordE.classList.remove('selected')
            e.target.classList.add('selected')
            const word = this.cleanWord(e.target.innerHTML)
            console.log('Switching word... to ' + word)
            this.sidebar.showWordAndDefinition(word, this.languageText.words.get(word).definition)
        }
    }

    nextWord() {
        const current = document.querySelector('span.selected')
        if (!current) return
        const sibling = current.nextElementSibling
        if (sibling) sibling.click()
    }

    updateHighlighting(word) {
        const data = this.languageText.words.get(word)
        data.spans.forEach((span) => {
            if (this.sidebar.isHighlightChecked() && data.definition !== '') {
                let hue = ((1 - data.mastery) * 120).toString(10)
                span.style.backgroundColor = 'hsl(' + hue + ',100%,75%)'
            } else {
                span.style.backgroundColor = 'white'
            }
        })
    }

    highlight() {
        this.languageText.words.forEach((data, word) => this.updateHighlighting(word))
    }

    addText(text) {
        let wordsAndSpaces = text.split(/(\s+)/)
        wordsAndSpaces.forEach((word) => {
            if (word.trim() === '') {
                this.element.appendChild(document.createTextNode(word))
                return
            }
            let span = this.addWordToDisplay(word)
            word = this.cleanWord(word)
            if (word === '') return
            this.languageText.words.get(word).spans.push(span)
        })
    }
}
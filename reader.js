import { Utility } from './utility.js'

export class Reader {

    constructor(sidebar) {
        this.sidebar = sidebar
        this.languageText = sidebar.languageText
        let es = Utility.resetMainView()
        this.titleE = es[0]
        this.textE = es[1]
        this.textE.addEventListener('click', (e) => this.clickWord(e))
        this.load()
    }

    load(title = null, sentences = null) {
        if (title === null) title = this.languageText.filename
        if (sentences === null) this.sentences = this.languageText.sentences
        this.titleE.textContent = title
        this.textE.innerHTML = ''
        this.spansByWord = new Map()
        this.spansBySentence = []
        this.spansBySentenceAndWord = []
        this.addSentences()
        this.sidebar.setAudio()
        this.sidebar.showSentence()
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const oldWordE = document.querySelector('span.selected')
            if (oldWordE) oldWordE.classList.remove('selected')
            e.target.classList.add('selected')
            const word = Utility.cleanWord(e.target.innerHTML)
            let wordO = this.languageText.words.get(word)
            if (wordO === undefined) return
            this.sidebar.showWord(wordO)
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
        let spans = this.spansByWord.get(word)
        spans.forEach((span) => {
            if (this.sidebar.highlightingOn && data.definition !== '') {
                let hue = ((data.mastery / 5) * 120).toString(10)
                span.style.backgroundColor = 'hsl(' + hue + ',100%,75%)'
            } else {
                span.style.backgroundColor = ''
            }
        })
    }

    highlight() {
        this.languageText.words.forEach((data, word) => this.updateHighlighting(word))
    }

    addSentences() {
        this.sentences.forEach((sentence, i) => {
            let wordsAndSpaces = sentence.raw.split(/(\s+)/)
            let sentenceSpan = document.createElement('span')
            this.spansBySentence.push(sentenceSpan)
            this.spansBySentenceAndWord[i] = new Map()
            this.textE.appendChild(sentenceSpan)
            wordsAndSpaces.forEach((word) => {
                if (word.trim() === '') {
                    sentenceSpan.appendChild(document.createTextNode(word))
                    return
                }
                let cWord = Utility.cleanWord(word)
                if (cWord === '') {
                    sentenceSpan.appendChild(document.createTextNode(word))
                    return
                }
                const span = document.createElement('span')
                span.innerText = word
                sentenceSpan.appendChild(span)
                if (!this.spansByWord.has(cWord)) this.spansByWord.set(cWord, [])
                this.spansByWord.get(cWord).push(span)
                let spansSW = this.spansBySentenceAndWord[i]
                if (!spansSW.has(cWord)) spansSW.set(cWord, [])
                spansSW.get(cWord).push(span)
            })
        })
    }

    highlightSentence(i) {
        this.spansBySentence[i].classList.add('highlight-sentence')
    }

    removeSentenceHighlighting(i) {
        this.spansBySentence[i].classList.remove('highlight-sentence')
    }
}
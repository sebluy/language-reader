import { Utility } from './utility'
import { LanguageText } from './language-text'
import { RawSentence } from './raw-sentence'
import { Activity } from './activity'
import { Word } from './word'
import { SideBar } from './side-bar'

export class Reader extends Activity {

    languageText: LanguageText
    paragraphE: HTMLElement
    sentences: Array<RawSentence>
    spansByWord: Map<string, Array<HTMLSpanElement>>
    spansBySentence: Array<HTMLSpanElement>
    spansBySentenceAndWord: Array<Map<string, Array<HTMLSpanElement>>>

    constructor(controller) {
        super(controller)
        this.languageText = controller.languageText
        this.paragraphE = document.createElement('p')
        this.paragraphE.addEventListener('click', (e) => this.clickWord(e))
        this.controller.mainWindow.reset('Reader', 'Page ' + (this.controller.runtimeData.currentPage + 1))
        this.controller.mainWindow.contentDiv.append(this.paragraphE)
        this.sentences = this.languageText.sentences
        this.paragraphE.innerHTML = ''
        this.spansByWord = new Map()
        this.spansBySentence = []
        this.spansBySentenceAndWord = []
    }

    show() {
        this.addSentences()
        let sidebar = this.controller.sidebar
        this.setAudio(sidebar)
        sidebar.showWordDefinition(() => this.nextWord())
        sidebar.showSentenceDefinition(() => this.nextSentence())
        sidebar.showAudio()
        sidebar.showPageButtons()
        sidebar.showHighlightButton((on) => this.updateHighlighting(on))
        sidebar.highlightSentence = (i) => this.highlightSentence(i)
        sidebar.unhighlightSentence = (i) => this.removeSentenceHighlighting(i)
        if (sidebar.highlightingOn) this.updateHighlighting(true)
    }

    cleanup() {}

    setAudio(sidebar: SideBar) {
        if (this.sentences.length === 0) return
        let first = this.sentences[0].clean
        let last = this.sentences[this.sentences.length - 1].clean
        let start = this.languageText.sentenceMap.get(first).startTime
        let end = this.languageText.sentenceMap.get(last).endTime
        sidebar.setAudio(start, end)
    }

    clickWord(e) {
        if (!e.target.matches('span') || e.target.firstElementChild) return
        const oldWordE = document.querySelector('span.selected')
        if (oldWordE) oldWordE.classList.remove('selected')
        e.target.classList.add('selected')
        let word = Utility.cleanWord(e.target.innerText)
        let sentence = e.target.parentElement.innerText.trim()
        let wordO = this.languageText.words.get(word)
        let sentenceO = this.languageText.sentenceMap.get(sentence)
        if (wordO === undefined || sentenceO === undefined) return
        this.controller.sidebar.showWord(word, sentence)
    }

    nextWord() {
        const current = document.querySelector('span.selected')
        if (!current) return
        let sibling = current.nextElementSibling
        if (sibling) {
            (<HTMLSpanElement>sibling).click()
            return
        }
        let parentSibling = current.parentNode.nextSibling
        if (parentSibling && parentSibling.firstChild) {
            (<HTMLSpanElement>parentSibling.firstChild).click()
        }
    }

    nextSentence() {
        let current = document.querySelector('span.selected')
        if (!current) return
        let parentSibling = current.parentElement.nextElementSibling
        if (parentSibling && parentSibling.firstChild) {
            (<HTMLSpanElement>parentSibling.firstChild).click()
        }
    }

    updateHighlightingWord(highlightingOn: boolean, word: string) {
        const data = this.languageText.words.get(word)
        let spans = this.spansByWord.get(word)
        spans.forEach((span) => {
            if (highlightingOn && data.definition !== '') {
                let hue = ((data.mastery / Word.MAX_MASTERY) * 120).toString(10)
                span.style.backgroundColor = 'hsl(' + hue + ',100%,75%)'
            } else {
                span.style.backgroundColor = ''
            }
        })
    }

    updateHighlighting(highlightingOn, word?) {
        if (highlightingOn) {
            this.paragraphE.classList.add('highlight')
        } else {
            this.paragraphE.classList.remove('highlight')
        }
        if (word === undefined) {
            this.languageText.words.forEach((data, word) => this.updateHighlighting(highlightingOn, word))
        } else {
            this.updateHighlightingWord(highlightingOn, word)
        }
    }

    addSentences() {
        this.sentences.forEach((sentence, i) => {
            let wordsAndSpaces = sentence.getWordsAndSpaces()
            let sentenceSpan = document.createElement('span')
            this.spansBySentence.push(sentenceSpan)
            this.spansBySentenceAndWord[i] = new Map()
            this.paragraphE.appendChild(sentenceSpan)
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
        this.spansBySentence[i].classList.add('selected')
    }

    removeSentenceHighlighting(i) {
        this.spansBySentence[i].classList.remove('selected')
    }
}
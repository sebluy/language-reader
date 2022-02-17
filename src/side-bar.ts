import { Utility } from './utility'
import { LanguageText } from './language-text'
import { Sentence } from './sentence'
import { ControllerInterface } from './controller-interface'
import { DefinitionInput } from './components/DefinitionInput'
import * as ReactDOM from 'react-dom'
import * as React from 'react'

export class SideBar {

    controller: ControllerInterface
    languageText: LanguageText

    highlightingOn: boolean
    timeout: number
    audioStart: number
    audioEnd: number
    currentSentence: Sentence
    marker: number

    wordDefinitionProps: any
    sentenceDefinitionProps: any

    statsE: HTMLElement
    highlightCB: HTMLElement
    audioE: HTMLAudioElement
    audioStartE: HTMLInputElement
    audioEndE: HTMLInputElement
    previousPageE: HTMLElement
    nextPageE: HTMLElement
    textNameE: HTMLElement
    audioNameE: HTMLElement
    languageE: HTMLInputElement

    // TODO: extract object for audio

    constructor(controller) {
        this.controller = controller
        this.highlightingOn = false
        this.setElementsAndListeners()
    }

    renderDefinitionInputs() {
        let definitions = document.getElementById('definitions')
        ReactDOM.render([
            React.createElement(DefinitionInput, {
                key: 1,
                id: 'word-definition',
                onUpdateDefinition: (text, definition) => {
                    this.languageText.updateWordDefinition(text, definition)
                },
                onNext: () => this.onNextWord(),
                onDefinitionChange: (value) => {
                    this.wordDefinitionProps.definition = value
                    this.renderDefinitionInputs()
                },
                ...this.wordDefinitionProps
            }),
            React.createElement(DefinitionInput, {
                key: 2,
                id: 'sentence-definition',
                tag: 'textarea',
                onUpdateDefinition: (text, definition) => {
                    this.languageText.updateSentenceDefinition(text, definition)
                },
                onNext: () => this.onNextSentence(),
                onDefinitionChange: (value) => {
                    this.sentenceDefinitionProps.definition = value
                    this.renderDefinitionInputs()
                },
                ...this.sentenceDefinitionProps
            }),
        ], definitions)
    }

    setElementsAndListeners() {
        this.wordDefinitionProps = {}
        this.sentenceDefinitionProps = {}
        this.renderDefinitionInputs()

        this.statsE = document.getElementById('stats')
        this.highlightCB = document.getElementById('highlight')
        this.audioE = <HTMLAudioElement>document.getElementById('audio')
        this.audioStartE = <HTMLInputElement>document.getElementById('audio-start')
        this.audioEndE = <HTMLInputElement>document.getElementById('audio-end')
        this.previousPageE = document.getElementById('previous-page')
        this.nextPageE = document.getElementById('next-page')
        this.audioNameE = document.getElementById('audio-name')
        this.textNameE = document.getElementById('text-name')
        this.languageE = <HTMLInputElement>document.getElementById('language')

        this.highlightCB.addEventListener('click', () => {
            this.highlightingOn = !this.highlightingOn
            this.updateHighlighting(this.highlightingOn)
        })
        this.audioStartE.addEventListener('focusout', () => this.updateAudioTimes())
        this.audioEndE.addEventListener('focusout', () => this.updateAudioTimes())
        this.previousPageE.addEventListener('click', (e) => this.controller.changePageBy(-1))
        this.nextPageE.addEventListener('click', (e) => this.controller.changePageBy(1))
        this.languageE.addEventListener('focusout', (e) => {
            this.controller.updateLanguage(this.languageE.value)
        })

        document.getElementById('update-stats').addEventListener('click', () => this.updateStats())

        document.getElementById('open-files')
            .addEventListener('click', () => this.controller.openFiles())

        let select = <HTMLSelectElement>document.getElementById('activity-select')
        select.addEventListener('click', () => this.controller.showActivityByName(select.value))

        document.getElementById('export')
            .addEventListener('click', () => this.controller.exportDatabase())
        document.getElementById('import')
            .addEventListener('click', () => this.controller.importDatabase())

        document.addEventListener('keydown', (e) => this.handleKey(e))
    }

    setAudio(startTime, endTime = undefined) {
        this.audioStart = startTime
        this.audioEnd = endTime
        if (this.audioStart !== undefined) this.audioE.currentTime = startTime
        clearTimeout(this.timeout)
        if (!this.audioE.paused) this.audioE.pause()
    }

    playAudio() {
        // TODO: Fix playback for 0
        clearTimeout(this.timeout)
        this.audioE.play()
        if (this.audioEnd) {
            let remaining = this.audioEnd - this.audioE.currentTime
            this.timeout = window.setTimeout(() => {
                this.audioE.currentTime = this.audioStart
                this.audioE.pause()
            }, remaining * 1000)
        }
    }

    handleKey(e) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
        if (e.key === 'p') {
            if (this.audioE.paused) {
                this.playAudio()
            } else {
                clearTimeout(this.timeout)
                this.audioE.pause()
            }
        } else if (e.key === 'r') {
            if (this.audioStart) this.audioE.currentTime = this.audioStart
            this.playAudio()
        } else if (e.key === 'm') {
            this.markAudio()
        }
    }

    showWord(word: string, sentence?: string) {
        let wordO = this.languageText.words.get(word)
        let sentenceO = this.languageText.sentenceMap.get(sentence)
        this.wordDefinitionProps.text = wordO.word
        this.wordDefinitionProps.definition = wordO.definition
        this.wordDefinitionProps.focus = true
        this.sentenceDefinitionProps.text = sentenceO.sentence
        this.sentenceDefinitionProps.definition = sentenceO.definition
        this.renderDefinitionInputs()
    }

    showSentence(sentence) {
        if (sentence === undefined) {
            this.currentSentence = undefined
            this.audioStartE.value = this.audioEndE.value = ''
            this.setAudio(undefined)
            return
        }
        this.currentSentence = sentence
        this.audioStartE.value = sentence.startTime === undefined ? '' : sentence.startTime.toFixed(1)
        this.audioEndE.value = sentence.endTime === undefined ? '' : sentence.endTime.toFixed(1)
        this.setAudio(sentence.startTime, sentence.endTime)
        if (sentence.startTime !== undefined) this.playAudio()
    }

    updateStats() {
        let stats = this.languageText.updateStats()
        let runtimeData = this.controller.runtimeData
        let fp = (p) => (p * 100).toFixed(2) + '%'
        let newTable = Utility.createHTML(
            ['tbody',
                ['tr', ['td', 'Total Words Translated'], ['td', stats.totalWordsTranslated]],
                ['tr', ['td', 'New Words'], ['td', stats.newWords]],
                ['tr', ['td', 'Words Learned Today'], ['td', runtimeData.wordsLearnedToday]],
                ['tr', ['td', 'Percent Translated'], ['td', fp(stats.percentTranslated)]],
                ['tr', ['td', 'Words Mastered'], ['td', fp(stats.percentWordsMastered)]],
                ['tr', ['td', 'Today\'s XP'], ['td', runtimeData.xpToday]],
                ['tr', ['td', 'Last XP'], ['td', runtimeData.xpLast]]
            ]
        )
        this.statsE.replaceChild(newTable, this.statsE.childNodes[0])
    }

    markAudio() {
        let sentences = this.languageText.sentences
        if (this.marker === undefined) {
            this.audioE.play()
            this.marker = 0
        }
        if (this.marker > 0) {
            let lastSentence = sentences[this.marker - 1]
            let lastData = this.languageText.sentenceMap.get(lastSentence.clean)
            this.languageText.updateSentenceTimes(lastData, null, this.audioE.currentTime)
            this.unhighlightSentence(this.marker - 1)
        }
        if (this.marker === sentences.length) {
            this.audioE.pause()
            this.marker = undefined
            return
        }
        let sentence = sentences[this.marker]
        let sentenceData = this.languageText.sentenceMap.get(sentence.clean)
        this.highlightSentence(this.marker)
        this.languageText.updateSentenceTimes(sentenceData, this.audioE.currentTime, null)
        this.marker += 1
    }

    parseTime(str) {
        if (str === '') return undefined
        return Number.parseFloat(str)
    }

    updateAudioTimes() {
        if (this.currentSentence === undefined) return

        let start = this.parseTime(this.audioStartE.value)
        let end = this.parseTime(this.audioEndE.value)

        if (!Number.isNaN(start)) this.currentSentence.startTime = start
        if (!Number.isNaN(end)) this.currentSentence.endTime = end

        this.setAudio(this.currentSentence.startTime, this.currentSentence.endTime)
        this.languageText.updateSentence(this.currentSentence)
    }

    showElement(element, show) {
        element.style.display = show ? '' : 'none'
    }

    setAudioSource(source: string) {
        this.audioE.src = source
    }

    hideAll() {
        this.wordDefinitionProps.hidden = true
        this.sentenceDefinitionProps.hidden = true
        this.renderDefinitionInputs()
        this.showElement(this.audioE, false)
        this.showElement(this.highlightCB, false)
        this.showElement(this.previousPageE, false)
        this.showElement(this.nextPageE, false)
        this.showElement(this.audioStartE, false)
        this.showElement(this.audioEndE, false)
    }

    showWordDefinition(onNextWord?) {
        this.onNextWord = onNextWord
        this.wordDefinitionProps.hidden = false
        this.renderDefinitionInputs()
    }

    showSentenceDefinition(onNextSentence?) {
        this.onNextSentence = onNextSentence
        this.sentenceDefinitionProps.hidden = false
        this.renderDefinitionInputs()
    }

    showAudio() {
        this.showElement(this.audioE, true)
    }

    showAudioTimes() {
        this.showElement(this.audioStartE, true)
        this.showElement(this.audioEndE, true)
    }

    showHighlightButton(updateHighlighting) {
        this.updateHighlighting = updateHighlighting
        this.showElement(this.highlightCB, true)
    }

    showPageButtons() {
        this.showElement(this.previousPageE, true)
        this.showElement(this.nextPageE, true)
    }

    setNames() {
        let tf = this.controller.runtimeData.openTextFile
        let af = this.controller.runtimeData.openAudioFile
        this.textNameE.innerText = tf || 'Please open file.'
        this.audioNameE.innerText = af || 'Please open file.'
    }

    setLanguage(language: string) {
        this.languageE.value = language
        this.wordDefinitionProps.language = language
        this.sentenceDefinitionProps.language = language
        this.renderDefinitionInputs()
    }

    highlightSentence(i) {}
    unhighlightSentence(i) {}
    updateHighlighting(on: boolean) {}
    onNextWord() {}
    onNextSentence() {}

}


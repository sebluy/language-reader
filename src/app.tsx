import * as React from 'react'
import { Sidebar } from './Sidebar'
import { MainWindow } from './MainWindow'
import { RightSidebar } from './RightSidebar'
import { RuntimeData } from './runtime-data'
import { LanguageText } from './language-text'

export class App extends React.Component<any, any> {

    languageText: LanguageText

    constructor(props) {
        super(props)
        this.state = {runtimeData: RuntimeData.empty()}
    }

    async componentDidMount() {
        let state = await this.props.controller.load()
        this.languageText = this.props.controller.languageText
        this.setState(state)
    }

    selectWord(word: string, wordIndex: number, sentence: string, sentenceIndex: number) {
        let wordO = this.languageText.words.get(word)
        let sentenceO = this.languageText.sentenceMap.get(sentence)
        let newState = {
            ...this.state,
            selectedWord: wordO,
            selectedWordIndex: wordIndex,
            selectedSentence: sentenceO,
            selectedSentenceIndex: sentenceIndex,
        }
        this.setState(newState)
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <Sidebar runtimeData={this.state.runtimeData}/>
                <MainWindow
                    reader={this.state.reader}
                    selectedWordIndex={this.state.selectedWordIndex}
                    selectedSentenceIndex={this.state.selectedSentenceIndex}
                    onSelectWord={this.selectWord.bind(this)}
                />
                <RightSidebar
                    selectedWord={this.state.selectedWord}
                    selectedSentence={this.state.selectedSentence}
                    onWordDefinitionUpdate={(word, definition) => {
                        this.languageText.updateWordDefinition(word, definition)
                    }}
                    onSentenceDefinitionUpdate={(sentence, definition) => {
                        this.languageText.updateSentenceDefinition(sentence, definition)
                    }}
                    onNextWord={this.nextWord.bind(this)}
                    onNextSentence={this.nextSentence.bind(this)}
                />
            </div>
        )
    }

    nextWord() {
        if (this.state.selectedWordIndex === undefined || this.state.reader === undefined) return
        let wordIndex = this.state.selectedWordIndex + 1
        let selectedSentence = this.state.reader.sentences[this.state.selectedSentenceIndex]
        let words = selectedSentence.getWords()
        if (wordIndex >= selectedSentence.getWords().length) {
            this.nextSentence()
            return
        }
        this.selectWord(words[wordIndex], wordIndex, selectedSentence.clean, this.state.selectedSentenceIndex)
    }

    nextSentence() {
        if (this.state.selectedWordIndex === undefined || this.state.reader === undefined) return
        let index = this.state.selectedSentenceIndex + 1
        if (index >= this.state.reader.sentences.length) return
        let sentence = this.state.reader.sentences[index]
        let words = sentence.getWords()
        this.selectWord(words[0], 0, sentence.clean, index)
    }

}
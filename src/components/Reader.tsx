import * as React from 'react'
import { Utility } from '../utility'
import { MainWindow } from './MainWindow'
import { DefinitionInput } from './DefinitionInput'
import { Word } from '../word'

export class Reader extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: props.currentPage,
            highlighting: false,
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.currentPage !== state.currentPage) {
            return {
                selectedWord: undefined,
                selectedWordIndex: undefined,
                selectedSentence: undefined,
                selectedSentenceIndex: undefined,
                currentPage: props.currentPage,
            }
        }
        return null
    }

    wordHighlighting(word: string) {
        let wordO = this.props.languageText.words.get(word)
        if (!this.state.highlighting || wordO.definition === '') return {backgroundColor: ''}
        let hue = ((wordO.mastery / Word.MAX_MASTERY) * 120).toString(10)
        return {backgroundColor: 'hsl(' + hue + ',100%,75%)'}
    }

    renderSentences() {
        if (this.props.languageText === undefined) return
        let sentences = this.props.languageText.sentences
        return sentences.map((sentence, si) => {
            let wordsAndSpaces = sentence.getWordsAndSpaces()
            let wi = 0
            let wordSpans = wordsAndSpaces.map((word) => {
                if (word.trim() === '') return word;
                let cWord = Utility.cleanWord(word)
                if (cWord === '') return word
                let wi2 = wi
                wi += 1
                let selected = this.state.selectedWordIndex === wi2 && this.state.selectedSentenceIndex === si
                return (
                    <span
                        key={wi2}
                        style={this.wordHighlighting(cWord)}
                        className={selected ? 'selected' : ''}
                        onClick={() => this.selectWord(cWord, wi2, sentence.clean, si)}>
                        {word}
                    </span>
                )
            })
            return <span key={si}>{wordSpans}</span>
        })
    }

    render() {
        return (
            <MainWindow
                title="Reader"
                subtitle={`Page ${this.props.currentPage + 1}`}
                renderActivity={() =>
                    <p className={this.state.highlighting ? 'highlight' : ''}>
                        {this.renderSentences()}
                    </p>
                }
                renderSidebar={this.renderSidebar.bind(this)}
            />
        )
    }

    renderSidebar() {
        let selectedWord = this.state.selectedWord
        let selectedSentence = this.state.selectedSentence
        return (
            <div className="sidebar right">
                <div className="sidebar-group">
                    <DefinitionInput
                        id="word-definition"
                        key={selectedWord && selectedWord.word}
                        language={this.props.language}
                        text={selectedWord && selectedWord.word}
                        definition={selectedWord && selectedWord.definition}
                        onDefinitionUpdate={(word, definition) => {
                            this.props.languageText.updateWordDefinition(word, definition)
                        }}
                        onNext={this.nextWord.bind(this)}
                        focus={this.state.selectedWord !== undefined}
                    />
                    <DefinitionInput
                        id="sentence-definition"
                        key={selectedSentence && selectedSentence.sentence}
                        language={this.props.language}
                        text={selectedSentence && selectedSentence.sentence}
                        definition={selectedSentence && selectedSentence.definition}
                        onDefinitionUpdate={(sentence, definition) => {
                            this.props.languageText.updateSentenceDefinition(sentence, definition)
                        }}
                        onNext={this.nextSentence.bind(this)}
                        tag="textarea"
                    />
                </div>
                <div className="sidebar-group">
                    <button onClick={() => this.props.onChangePageBy(-1)}>Previous Page</button>
                    <button onClick={() => this.props.onChangePageBy(+1)}>Next Page</button>
                </div>
                <div className="sidebar-group">
                    <button onClick={this.toggleHighlighting.bind(this)}>Toggle Highlighting</button>
                </div>
            </div>
        )
    }

    nextWord() {
        if (this.state.selectedWordIndex === undefined) return
        let sentences = this.props.languageText.sentences
        let wordIndex = this.state.selectedWordIndex + 1
        let selectedSentence = sentences[this.state.selectedSentenceIndex]
        let words = selectedSentence.getWords()
        if (wordIndex >= selectedSentence.getWords().length) {
            this.nextSentence()
            return
        }
        this.selectWord(words[wordIndex], wordIndex, selectedSentence.clean, this.state.selectedSentenceIndex)
    }

    nextSentence() {
        if (this.state.selectedWordIndex === undefined) return
        let sentences = this.props.languageText.sentences
        let index = this.state.selectedSentenceIndex + 1
        if (index >= sentences.length) return
        let sentence = sentences[index]
        let words = sentence.getWords()
        this.selectWord(words[0], 0, sentence.clean, index)
    }

    selectWord(word: string, wordIndex: number, sentence: string, sentenceIndex: number) {
        let wordO = this.props.languageText.words.get(word)
        let sentenceO = this.props.languageText.sentenceMap.get(sentence)
        let newState = {
            selectedWord: wordO,
            selectedWordIndex: wordIndex,
            selectedSentence: sentenceO,
            selectedSentenceIndex: sentenceIndex,
        }
        this.setState(newState)
    }

    toggleHighlighting() {
        this.setState({highlighting: !this.state.highlighting})
    }

}
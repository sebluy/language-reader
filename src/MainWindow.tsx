import * as React from 'react'
import {RawSentence} from "./raw-sentence";
import {Utility} from "./utility";

export class MainWindow extends React.Component<any, any> {

    spans(sentences: Array<RawSentence>) {
        let selectedWord = this.props.selectedWord && this.props.selectedWord.word
        return sentences.map((sentence, i) => {
            let wordsAndSpaces = sentence.getWordsAndSpaces()
            let wordSpans = wordsAndSpaces.map((word, i) => {
                if (word.trim() === '') return word;
                let cWord = Utility.cleanWord(word)
                if (cWord === '') return word
                return (
                    <span
                        key={i}
                        className={selectedWord === cWord ? 'selected' : ''}
                        onClick={() => this.props.onSelectWord(cWord)}>
                        {word}
                    </span>
                )
            })
            return <span key={i}>{wordSpans}</span>
        })
    }

    render() {
        return (
            <div id="main">
                <h2>Reader</h2>
                <h3>Page 1</h3>
                <div>
                    <p>
                        {this.props.reader ? this.spans(this.props.reader.sentences) : []}
                    </p>
                </div>
            </div>
        )
    }

}
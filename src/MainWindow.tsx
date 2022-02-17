import * as React from 'react'
import {RawSentence} from "./raw-sentence";
import {Utility} from "./utility";

export class MainWindow extends React.Component<any, any> {

    spans(sentences: Array<RawSentence>) {
        return sentences.map((sentence, si) => {
            let wordsAndSpaces = sentence.getWordsAndSpaces()
            let wi = 0
            let wordSpans = wordsAndSpaces.map((word) => {
                if (word.trim() === '') return word;
                let cWord = Utility.cleanWord(word)
                if (cWord === '') return word
                let wi2 = wi
                wi += 1
                let selected = this.props.selectedWordIndex === wi2 && this.props.selectedSentenceIndex === si
                return (
                    <span
                        key={wi2}
                        className={selected ? 'selected' : ''}
                        onClick={() => this.props.onSelectWord(cWord, wi2, sentence.clean, si)}>
                        {word}
                    </span>
                )
            })
            return <span key={si}>{wordSpans}</span>
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
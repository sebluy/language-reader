import * as React from 'react'
import { DefinitionInput } from './definition-input'

export class RightSidebar extends React.Component<any, any> {

    render() {
        let selectedWord = this.props.selectedWord
        let selectedSentence = this.props.selectedSentence
        return (
            <div className="sidebar right">
                <div className="sidebar-group">
                    <DefinitionInput
                        id="word-definition"
                        key={selectedWord && selectedWord.word}
                        text={selectedWord && selectedWord.word}
                        definition={selectedWord && selectedWord.definition}
                        onDefinitionUpdate={this.props.onWordDefinitionUpdate}
                        onNext={this.props.onNextWord}
                        focus={true}
                    />
                    <DefinitionInput
                        id="sentence-definition"
                        key={selectedSentence && selectedSentence.sentence}
                        text={selectedSentence && selectedSentence.sentence}
                        definition={selectedSentence && selectedSentence.definition}
                        onDefinitionUpdate={this.props.onSentenceDefinitionUpdate}
                        onNext={this.props.onNextSentence}
                        tag="textarea"
                    />
                </div>
                <div className="sidebar-group">
                    <audio controls/>
                    <input type="number" step="0.1"/>
                    <input type="number" step="0.1"/>
                </div>
                <div className="sidebar-group">
                    <button>Previous Page</button>
                    <button>Next Page</button>
                </div>
                <div className="sidebar-group">
                    <button>Toggle Highlighting</button>
                </div>
            </div>
        )
    }

}
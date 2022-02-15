import * as React from 'react'
import { Sidebar } from './Sidebar'
import { MainWindow } from './MainWindow'
import { RightSidebar } from './RightSidebar'
import { RuntimeData } from './runtime-data'

export class App extends React.Component<any, any> {

    constructor(props) {
        super(props)
        this.state = {runtimeData: RuntimeData.empty()}
    }

    async componentDidMount() {
        let state = await this.props.controller.load()
        this.setState(state)
    }

    selectWord(word: string, sentence: string) {
        let wordO = this.props.controller.languageText.words.get(word)
        let sentenceO = this.props.controller.languageText.sentenceMap.get(sentence)
        let newState = {...this.state, selectedWord: wordO, selectedSentence: sentenceO}
        this.setState(newState)
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <Sidebar runtimeData={this.state.runtimeData}/>
                <MainWindow
                    reader={this.state.reader}
                    selectedWord={this.state.selectedWord}
                    onSelectWord={this.selectWord.bind(this)}
                />
                <RightSidebar
                    selectedWord={this.state.selectedWord}
                    selectedSentence={this.state.selectedSentence}
                />
            </div>
        )
    }

}
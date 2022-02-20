import * as React from 'react'
import { Sidebar } from './Sidebar'
import { RuntimeData } from '../runtime-data'
import { Reader } from './Reader'

export class App extends React.Component<any, any> {

    constructor(props) {
        super(props)
        this.state = {
            runtimeData: RuntimeData.empty(),
            audio: {},
        }
    }

    async componentDidMount() {
        let state = await this.props.controller.load()
        state.languageText.onLoad = () => {
            console.log('Language text reloaded')
            this.setState({statistics: this.updateStats(this.state)})
        }
        state.statistics = this.updateStats(state)
        this.setState(state)
    }

    updateStats(state) {
        let statistics = state.languageText.updateStats()
        statistics.wordsLearnedToday = state.runtimeData.wordsLearnedToday
        statistics.xpToday = state.runtimeData.xpToday
        statistics.xpLast = state.runtimeData.xpLast
        statistics.update = () => {
            this.setState({statistics: this.updateStats(this.state)})
        }
        return statistics
    }

    render() {
        console.log(this.state)
        let audioProps = {
            ...this.state.audio,
            play: this.playAudio.bind(this),
            pause: this.pauseAudio.bind(this)
        }
        return (
            <div>
                <Sidebar
                    runtimeData={this.state.runtimeData}
                    audio={...audioProps}
                    statistics={this.state.statistics}
                />
                <Reader
                    language={this.state.runtimeData.language}
                    languageText={this.state.languageText}
                    currentPage={this.state.runtimeData.currentPage}
                    onChangePageBy={this.changePageBy.bind(this)}
                />
            </div>
        )
    }

    playAudio() {
        this.setState({audio: {...this.state.audio, playing: true}})
    }

    pauseAudio() {
        this.setState({audio: {...this.state.audio, playing: false}})
    }

    changePageBy(n) {
        this.props.controller.changePageBy(n)
    }

}
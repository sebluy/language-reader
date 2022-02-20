import * as React from 'react'
import { AudioPlayer } from './AudioPlayer'
import { Statistics } from './Statistics'

export class Sidebar extends React.Component<any, any> {

    render() {
        return (
            <div className="sidebar">
                <div className="sidebar-group">
                    <h3>{this.props.runtimeData.openTextFile}</h3>
                    <h4>{this.props.runtimeData.openAudioFile}</h4>
                    <AudioPlayer {...this.props.audio}/>
                    <button>Open Files</button>
                    <input
                        placeholder="Language"
                        type="text"
                        value={this.props.runtimeData.language}
                        readOnly/>
                </div>
                <div className="sidebar-group">
                    <select name="activity">
                        <option value="reader">Reader</option>
                        <option value="auto">Auto</option>
                        <option value="vocab-in-context">Vocabulary in Context</option>
                        <option value="vocab-matching">Vocabulary Matching</option>
                        <option value="listening">Listening</option>
                        <option value="listening2">Listening 2</option>
                        <option value="cloze">Cloze</option>
                        <option value="unscramble">Unscramble</option>
                    </select>
                </div>
                <Statistics {...this.props.statistics}/>
                <div className="sidebar-group">
                    <button>Export Database</button>
                    <button>Import Database</button>
                </div>
            </div>
        )
    }

}
import * as React from 'react'
import { Sidebar } from './Sidebar'
import { RuntimeData } from '../runtime-data'
import { Reader } from './Reader'

export class App extends React.Component<any, any> {

    constructor(props) {
        super(props)
        this.state = {runtimeData: RuntimeData.empty()}
    }

    async componentDidMount() {
        let state = await this.props.controller.load()
        state.languageText.onLoad = () => {
            console.log('Language text reloaded')
            this.setState({languageText: state.languageText})
        }
        this.setState(state)
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <Sidebar runtimeData={this.state.runtimeData}/>
                <Reader
                    language={this.state.runtimeData.language}
                    languageText={this.state.languageText}
                    currentPage={this.state.runtimeData.currentPage}
                    onChangePageBy={this.changePageBy.bind(this)}
                />
            </div>
        )
    }

    changePageBy(n) {
        this.props.controller.changePageBy(n)
    }

}
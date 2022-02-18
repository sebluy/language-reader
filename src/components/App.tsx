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
        this.setState(state)
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <Sidebar runtimeData={this.state.runtimeData}/>
                <Reader
                    key={this.state.runtimeData.currentPage}
                    language={this.state.runtimeData.language}
                    languageText={this.state.languageText}
                    currentPage={this.state.runtimeData.currentPage}
                    changePageBy={this.changePageBy.bind(this)}
                />
            </div>
        )
    }

    changePageBy(n) {
        this.props.controller.changePageBy(n)
        this.setState(this.state)
    }

}
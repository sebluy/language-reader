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

    render() {
        console.log(this.state)
        return (
            <div>
                <Sidebar runtimeData={this.state.runtimeData}/>
                <MainWindow reader={this.state.reader}/>
                <RightSidebar/>
            </div>
        )
    }

}
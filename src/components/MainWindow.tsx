import * as React from 'react'
import { Reader } from './Reader'

export class MainWindow extends React.Component<any, any> {

    render() {
        return (
            <div id="main">
                <h2>Reader</h2>
                <h3>Page 1</h3>
                <Reader {...this.props}/>
            </div>
        )
    }

}
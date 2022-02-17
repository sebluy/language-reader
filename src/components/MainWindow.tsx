import * as React from 'react'

export class MainWindow extends React.Component<any, any> {

    render() {
        return (
            <React.Fragment>
                <div id="main">
                    <h2>{this.props.title}</h2>
                    <h3>{this.props.subtitle}</h3>
                    {this.props.renderActivity()}
                </div>
                {this.props.renderSidebar()}
            </React.Fragment>
        )
    }

}
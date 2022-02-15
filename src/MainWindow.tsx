import * as React from 'react'

export class MainWindow extends React.Component<any, any> {

    render() {
        let sentences
        if (this.props.reader) {
            sentences = this.props.reader.sentences.map((s) => <span>{s.raw}</span>)
        }
        return (
            <div id="main">
                <h2>Reader</h2>
                <h3>Page 1</h3>
                <div>
                    <p>
                        {sentences}
                    </p>
                </div>
            </div>
        )
    }

}
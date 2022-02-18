import * as React from 'react'

// TODO: add an interface for props

export class DefinitionInput extends React.Component<any, any> {

    static defaultProps = {
        tag: 'input',
        text: '...',
        definition: '',
        focus: false,
    }

    private readonly definition: React.RefObject<any>

    constructor(props) {
        super(props)
        this.definition = React.createRef()
        this.state = {definition: props.definition}
    }

    render() {
        let Tag = this.props.tag
        return (
            <div id={this.props.id}>
                <span>{this.props.text}</span>
                <Tag type="text"
                     ref={this.definition}
                     onBlur={() => this.props.onDefinitionUpdate(this.props.text, this.state.definition)}
                     onKeyDown={(e) => this.next(e)}
                     onChange={() => this.setState({definition: this.definition.current.value})}
                     value={this.state.definition}
                     placeholder="Definition"
                />
                <button onClick={() => this.googleTranslate()}>Google Translate</button>
            </div>
        );
    }

    componentDidMount() {
        if (this.props.focus) this.definition.current.focus()
    }

    componentDidUpdate() {
        if (this.props.focus) this.definition.current.focus()
    }

    next(e: KeyboardEvent) {
        if (e.key === 'Tab') {
            e.preventDefault()
            this.definition.current.blur()
            this.props.onNext()
        }
        e.stopPropagation()
    }

    googleTranslate() {
        const text = this.props.text
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl='
            + this.props.language + '&tl=en&dt=t&q=' + encodeURI(text)
        fetch(url).then(res => res.json()).then(res => {
            this.setState({definition: (res[0].map(([v]) => v).join(''))})
            this.definition.current.focus()
        })
    }

}
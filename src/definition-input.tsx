import * as React from 'react'

// TODO: add an interface for props

export class DefinitionInput extends React.Component<any, any> {

    static defaultProps = {
        tag: 'input',
        text: '...',
        definition: '',
        focus: false,
        hidden: false,
    }

    private readonly definition: React.RefObject<any>

    constructor(props) {
        super(props)
        this.definition = React.createRef()
    }

    render() {
        let Tag = this.props.tag
        if (this.props.hidden) return null
        return (
            <div id={this.props.id}>
                <span>{this.props.text}</span>
                <Tag type="text"
                     ref={this.definition}
                     onBlur={() => this.props.onUpdateDefinition(this.props.text, this.props.definition)}
                     onKeyDown={(e) => this.next(e)}
                     onChange={() => this.props.onDefinitionChange(this.definition.current.value)}
                     value={this.props.definition}
                />
                <button onClick={() => this.googleTranslate()}>Google Translate</button>
            </div>
        );
    }

    componentDidMount() {
        if (this.props.focus && !this.props.hidden) this.definition.current.focus()
    }

    componentDidUpdate() {
        if (this.props.focus && !this.props.hidden) this.definition.current.focus()
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
            this.props.onDefinitionChange(res[0].map(([v]) => v).join(''))
            this.definition.current.focus()
        })
    }

}
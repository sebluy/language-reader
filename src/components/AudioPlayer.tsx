import * as React from 'react'

export class AudioPlayer extends React.Component<any, any> {

    keyListener: (Event) => void
    audio: React.RefObject<HTMLAudioElement>

    constructor(props) {
        super(props)
        this.audio = React.createRef()
    }

    render() {
        return (
            <audio controls
                   src={this.props.src}
                   ref={this.audio}
            />
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let current = this.audio.current
        if (this.props.playing && current.paused) {
            current.play()
        } else if (!this.props.playing && !current.paused) {
            current.pause()
        }
    }

    componentDidMount() {
        this.keyListener = (e) => {
            if (e.target instanceof HTMLInputElement
                || e.target instanceof HTMLTextAreaElement) return
            if (e.key === 'p') {
                if (this.props.playing) {
                    this.props.pause()
                } else {
                    this.props.play()
                }
            }
        }
        document.addEventListener('keydown', this.keyListener)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyListener)
    }

}
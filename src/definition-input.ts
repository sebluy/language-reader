
export class DefinitionInput {

    parent: HTMLElement
    textE: HTMLElement
    definitionE: HTMLInputElement
    language: string

    constructor(parent: HTMLElement) {
        this.parent = parent
    }

    render(definitionElement: string = 'input') {
        this.textE = document.createElement('span')
        this.textE.innerText = '...'

        this.definitionE = <HTMLInputElement>document.createElement(definitionElement)
        this.definitionE.addEventListener('focusout', () => this.updateDefinition())
        this.definitionE.addEventListener('keydown', (e) => this.next(e))

        let googleTranslateB = document.createElement('button')
        googleTranslateB.innerText = 'Google Translate'
        googleTranslateB.addEventListener('click', () => this.googleTranslate())

        this.parent.append(this.textE, this.definitionE, googleTranslateB)
    }

    updateDefinition() {
        let text = this.textE.innerText
        let definition = this.definitionE.value
        this.onUpdateDefinition(text, definition)
    }

    show(text: string, definition: string, focus: boolean = true) {
        this.textE.innerText = text
        this.definitionE.value = definition
        if (focus) this.definitionE.focus()
    }

    next(e: KeyboardEvent) {
        if (e.key === 'Tab') {
            e.preventDefault()
            this.definitionE.blur()
            this.onNext()
        }
        e.stopPropagation()
    }

    googleTranslate() {
        const text = this.textE.innerText
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl='
            + this.language + '&tl=en&dt=t&q=' + encodeURI(text)
        fetch(url).then(res => res.json()).then(res => {
            this.definitionE.value = res[0].map(([v]) => v).join('')
            this.definitionE.focus()
        })
    }

    onUpdateDefinition(text: string, definition: string) {}
    onNext() {}
}
export class DefinitionInput {
    constructor(parent) {
        this.parent = parent;
    }
    render(definitionElement = 'input') {
        this.textE = document.createElement('span');
        this.textE.innerText = '...';
        this.definitionE = document.createElement(definitionElement);
        this.definitionE.addEventListener('focusout', () => this.updateDefinition());
        this.definitionE.addEventListener('keydown', (e) => this.next(e));
        let googleTranslateB = document.createElement('button');
        googleTranslateB.innerText = 'Google Translate';
        googleTranslateB.addEventListener('click', () => this.googleTranslate());
        this.parent.append(this.textE, this.definitionE, googleTranslateB);
    }
    updateDefinition() {
        let text = this.textE.innerText;
        let definition = this.definitionE.value;
        this.onUpdateDefinition(text, definition);
    }
    show(text, definition, focus = true) {
        this.textE.innerText = text;
        this.definitionE.value = definition;
        if (focus)
            this.definitionE.focus();
    }
    next(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            this.definitionE.blur();
            this.onNext();
        }
        e.stopPropagation();
    }
    // TODO: escape ;
    googleTranslate() {
        const text = this.textE.innerText;
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl='
            + this.language + '&tl=en&dt=t&q=' + text;
        fetch(url).then(res => res.json()).then(res => {
            this.definitionE.value = res[0][0][0];
            this.definitionE.focus();
        });
    }
    onUpdateDefinition(text, definition) { }
    onNext() { }
}

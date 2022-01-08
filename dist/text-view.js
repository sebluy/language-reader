import { Utility } from './utility.js';
export class TextView {
    constructor(sentences) {
        this.sentences = Array.isArray(sentences) ? sentences : [sentences];
    }
    renderSentence(sentence) {
        let wordsAndSpaces = sentence.getWordsAndSpaces();
        wordsAndSpaces.forEach((word) => {
            if (word.trim() === '') {
                this.p.appendChild(document.createTextNode(word));
                return;
            }
            let cWord = Utility.cleanWord(word);
            if (cWord === '') {
                this.p.appendChild(document.createTextNode(word));
                return;
            }
            this.renderWord(word, cWord);
        });
    }
    renderWord(word, clean) {
        this.defaultRenderWord(word);
    }
    renderBoldWord(word) {
        const span = document.createElement('span');
        span.innerText = word;
        span.classList.add('bold');
        this.p.appendChild(span);
    }
    renderBlank() {
        this.p.appendChild(document.createTextNode('________'));
    }
    defaultRenderWord(word) {
        const span = document.createElement('span');
        span.innerText = word;
        this.p.appendChild(span);
    }
    render(parent) {
        this.p = document.createElement('p');
        this.p.addEventListener('click', (e) => this.clickWord(e));
        this.sentences.forEach((sentence) => {
            this.renderSentence(sentence);
        });
        parent.append(this.p);
    }
    clickWord(e) {
        if (e.target.matches('span')) {
            const oldWordE = document.querySelector('span.selected');
            if (oldWordE)
                oldWordE.classList.remove('selected');
            e.target.classList.add('selected');
            this.onClickWord(Utility.cleanWord(e.target.innerHTML));
        }
    }
    nextWord() {
        const current = document.querySelector('span.selected');
        if (!current)
            return;
        let sibling = current.nextElementSibling;
        if (sibling) {
            sibling.click();
            return;
        }
        let parentSibling = current.parentNode.nextSibling;
        if (parentSibling && parentSibling.firstChild) {
            parentSibling.firstChild.click();
        }
    }
    onClickWord(word) { }
}

import { Utility } from './utility.js';
export class VocabularyMatching {
    constructor(controller) {
        this.controller = controller;
        this.languageText = controller.languageText;
        this.elementGrid = [];
        this.shuffledElements = [];
        this.selectedIndex = 0;
        this.textE = Utility.resetMainView('Vocabulary Matching', 'TODO');
        this.getRandomWords();
        this.buildGrid();
        this.selectElement(this.nextDefinition());
        this.keyListener = (e) => this.handleKey(e);
        document.addEventListener('keydown', this.keyListener);
    }
    cleanup() {
        document.removeEventListener('keydown', this.keyListener);
    }
    getRandomWords() {
        this.words = [];
        this.definitions = [];
        let randomWords = Utility.randomWordsByMastery(this.languageText.words, 8);
        randomWords.forEach((word) => {
            this.words.push(word.word);
            this.definitions.push(word.definition);
        });
        this.shuffled = [...this.definitions];
        Utility.shuffle(this.shuffled);
    }
    checkAnswer() {
        for (let i = 0; i < this.elementGrid.length; i++) {
            let el = this.elementGrid[i][0];
            if (el.innerHTML !== this.definitions[i]) {
                return false;
            }
        }
        Utility.benchmark(() => {
            this.languageText.updateMastery(this.words);
        });
        this.controller.addXP(this.definitions.length);
        this.controller.showVocabularyMatching();
    }
    buildGrid() {
        // let onDrop = () => {
        //     if (this.checkAnswer(rows)) {
        //         Utility.benchmark(() => {
        //             this.languageText.updateMastery(this.words)
        //         })
        //         this.sidebar.addXP(this.definitions.length)
        //         new VocabularyMatching(this.sidebar)
        //     }
        // }
        let rows = [];
        for (let i in this.words) {
            let blank = Utility.createDraggableItem({
                tag: 'td',
                id: 'matching-blank-' + i,
                text: '',
                // onDrop: onDrop
            });
            let definition = Utility.createDraggableItem({
                tag: 'td',
                id: 'matching-definition-' + i,
                text: this.shuffled[i],
            });
            this.shuffledElements.push(definition);
            this.elementGrid.push([blank, definition]);
            rows.push(['tr',
                ['td', { className: 'matching-item' }, this.words[i]],
                blank,
                definition
            ]);
        }
        this.textE.innerHTML = '';
        this.textE.append(Utility.createHTML(['table', ['tbody', ...rows]]));
    }
    selectElement(element) {
        if (this.selectedElement !== undefined) {
            this.selectedElement.classList.remove('selected');
        }
        this.selectedElement = element;
        this.selectedElement.classList.add('selected');
        for (let y = 0; y < this.elementGrid.length; y++) {
            let row = this.elementGrid[y];
            for (let x = 0; x < row.length; x++) {
                if (row[x] === element) {
                    this.selectedCoord = [x, y];
                    return;
                }
            }
        }
    }
    nextDefinition() {
        if (this.selectedElement === undefined) {
            return this.elementGrid[0][1];
        }
        this.selectedIndex = (this.selectedIndex + 1) % this.shuffled.length;
        return this.shuffledElements[this.selectedIndex];
    }
    handleKey(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            this.selectElement(this.nextDefinition());
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.swapWith(0, 1);
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.swapWith(-1, 0);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.swapWith(0, -1);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.swapWith(1, 0);
        }
        e.stopPropagation();
    }
    swapWith(xOff, yOff) {
        let source = this.selectedElement;
        let [x1, y1] = this.selectedCoord;
        let [x2, y2] = [x1 + xOff, y1 + yOff];
        if (this.elementGrid[y2][x2] === undefined)
            return;
        let dest = this.elementGrid[y2][x2];
        this.swap(source, dest);
        this.elementGrid[y1][x1] = dest;
        this.elementGrid[y2][x2] = source;
        this.selectedCoord = [x2, y2];
        this.checkAnswer();
    }
    swap(nodeA, nodeB) {
        const parentA = nodeA.parentNode;
        const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
        nodeB.parentNode.insertBefore(nodeA, nodeB);
        parentA.insertBefore(nodeB, siblingA);
    }
}

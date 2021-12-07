import { Utility } from './utility.js'

export class VocabularyMatching {
    constructor(sidebar) {
        this.sidebar = sidebar;
        this.languageText = sidebar.languageText;
        let es = Utility.resetMainView();
        this.titleE = es[0];
        this.titleE.textContent = 'Vocabulary Matching';
        this.textE = es[1];
        this.sidebar.setAudio(undefined, undefined);
        this.sidebar.showSentence(undefined);
        this.sidebar.updateStats();
        this.getRandomWords();
        this.buildGrid();
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
    checkAnswer(rows) {
        for (let i = 0; i < rows.length; i++) {
            let el = rows[i][2];
            if (el.innerHTML !== this.definitions[i])
                return false;
        }
        return true;
    }
    buildGrid() {
        let onDrop = () => {
            if (this.checkAnswer(rows)) {
                Utility.benchmark(() => {
                    this.languageText.updateMastery(this.words);
                });
                this.sidebar.addXP(this.definitions.length);
                new VocabularyMatching(this.sidebar);
            }
        };
        let rows = [];
        for (let i in this.words) {
            rows.push(['tr',
                ['td', { className: 'matching-item' }, this.words[i]],
                Utility.createDraggableItem({
                    tag: 'td',
                    id: 'matching-blank-' + i,
                    text: '',
                    onDrop: onDrop
                }),
                Utility.createDraggableItem({
                    tag: 'td',
                    id: 'matching-definition-' + i,
                    text: this.shuffled[i],
                })
            ]);
        }
        this.textE.innerHTML = '';
        this.textE.append(Utility.createHTML(['table', ['tbody', ...rows]]));
    }
}

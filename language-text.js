const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');

module.exports = class LanguageText {
    constructor(text) {
        this.element = document.querySelector('#text p')
        this.originalE = document.getElementById('original')
        this.definitionE = document.getElementById('definition')
        this.statsE = document.getElementById('stats')
        this.highlightTranslatedCB = document.getElementById('highlight-translated')
        this.googleTranslateB = document.getElementById('google-translate')
        this.updateStatsB = document.getElementById('update-stats')

        this.db = new sqlite3.Database('./words.db')
        this.numberOfWords = 0
        this.words = new Map()
        this.text = text
        this.extractWords()
        setTimeout(this.updateStats.bind(this), 1000);

        this.element.addEventListener('click', this.clickWord.bind(this))
        this.definitionE.addEventListener('focusout', this.updateDefinition.bind(this))
        this.definitionE.addEventListener('keydown', this.nextWord.bind(this))
        this.highlightTranslatedCB.addEventListener('change', this.highlightTranslated.bind(this))
        this.googleTranslateB.addEventListener('click', this.googleTranslate.bind(this))
        this.updateStatsB.addEventListener('click', this.updateStats.bind(this))
    }

    addWordToDisplay(word) {
        const span = document.createElement('span')
        span.innerHTML = word
        this.element.appendChild(span)
        this.element.appendChild(document.createTextNode(' '));
        return span;
    }

    cleanWord(word) {
        const punctuation = /[,.!?"“„]/g
        return word.replaceAll(punctuation, '').toLowerCase()
    }

    extractWords() {
        const clean = this.text.replaceAll('-\n', '')
        const words = clean.split(/\s+/)
        this.numberOfWords = words.length;
        words.forEach((word) => {
            let span = this.addWordToDisplay(word)
            word = this.cleanWord(word)
            if (!this.words.has(word)) {
                this.words.set(word, {spans: [],})
                this.lookupDefinition(word, def => this.words.get(word).definition = def)
            }
            this.words.get(word).spans.push(span)
        })
    }

    lookupDefinition(word, cb) {
        this.db.get("SELECT definition FROM words WHERE original = ?", [word], (err, row) => {
            cb(row !== undefined ? row.definition : '')
        })
    }

    updateDefinition() {
        const definition = this.definitionE.value
        const original = this.originalE.innerHTML
        this.words.get(original).definition = definition;
        console.log('Updating definition... for ' + original + ' to ' + definition);
        let sql = 'INSERT OR IGNORE INTO words (original, definition) VALUES ($original, $definition)'
        this.db.run(sql, {$definition: definition, $original: original})
        sql = 'UPDATE words SET definition = $definition WHERE original = $original'
        this.db.run(sql, {$definition: definition, $original: original})
        this.updateHighlightTranslated(original)
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const oldWordE = document.querySelector('span.selected')
            if (oldWordE) oldWordE.classList.remove('selected')
            e.target.classList.add('selected')

            const word = this.cleanWord(e.target.innerHTML)
            console.log('Switching word... to ' + word)
            console.log(this.words.get(word))
            this.originalE.innerText = word
            this.definitionE.value = this.words.get(word).definition
            this.definitionE.focus()
        }
    }

    nextWord(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            console.log('Pressed tab');
            const current = document.querySelector('span.selected');
            if (!current) return;
            console.log('Current word: ' + current.innerHTML)
            this.definitionE.blur()
            const sibling = current.nextElementSibling;
            if (sibling) sibling.click();
        }
    }

    updateHighlightTranslated(word) {
        const data = this.words.get(word)
        data.spans.forEach((span) => {
            if (data.definition === '' || !this.highlightTranslatedCB.checked) {
                span.classList.remove('translated')
            } else {
                span.classList.add('translated')
            }
        })
    }

    highlightTranslated(e) {
        this.words.forEach((data, word) => this.updateHighlightTranslated(word))
    }

    googleTranslate() {
        const original = this.originalE.innerText
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=cs&tl=en&dt=t&q=' + original;
        console.log(url);
        fetch(url).then(res => res.json()).then(res => {
            console.log(res)
            this.definitionE.value = res[0][0][0]
            this.definitionE.focus()
        })
    }

    updateStats() {
        let countTranslated = 0
        this.words.forEach((data) => {
            if (data.definition !== '') countTranslated += data.spans.length
        })
        const percent = countTranslated === 0 ? 0 : countTranslated / this.numberOfWords
        this.statsE.innerText =
            'Number of words: ' + this.numberOfWords + "\n" +
            'Number of distinct words: ' + this.words.size + "\n" +
            'Number of translated words: ' + countTranslated + "\n" +
            'Percent translated: ' + (percent * 100).toFixed(2) + '%'
    }
}
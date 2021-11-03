const sqlite3 = require('sqlite3')
const fetch = require('node-fetch')
const { ipcRenderer } = require('electron')
const fs = require('fs')

module.exports = class LanguageText {
    constructor(text) {
        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')
        this.originalE = document.getElementById('original')
        this.definitionE = document.getElementById('definition')
        this.statsE = document.getElementById('stats')
        this.highlightCB = document.getElementById('highlight')
        this.googleTranslateB = document.getElementById('google-translate')
        this.updateStatsB = document.getElementById('update-stats')
        this.selectRandomB = document.getElementById('select-random')
        this.openFileB = document.getElementById('open-file')
        this.vocabMatchingB = document.getElementById('vocab-matching')

        this.db = new sqlite3.Database('./words.db')
        this.numberOfWords = 0
        this.words = new Map()
        this.text = text
        this.extractWords()

        this.element.addEventListener('click', this.clickWord.bind(this))
        this.definitionE.addEventListener('focusout', this.updateWord.bind(this))
        this.definitionE.addEventListener('keydown', this.nextWord.bind(this))
        this.highlightCB.addEventListener('change', this.highlight.bind(this))
        this.googleTranslateB.addEventListener('click', this.googleTranslate.bind(this))
        this.updateStatsB.addEventListener('click', this.updateStats.bind(this))
        this.selectRandomB.addEventListener('click', this.selectRandom.bind(this))
        this.openFileB.addEventListener('click', this.openFile.bind(this))
        this.vocabMatchingB.addEventListener('click', this.vocabMatching.bind(this))
    }

    addWordToDisplay(word) {
        const span = document.createElement('span')
        span.innerHTML = word
        this.element.appendChild(span)
        this.element.appendChild(document.createTextNode(' '))
        return span
    }

    cleanWord(word) {
        const punctuation = /[,.!?"“„]/g
        return word.replaceAll(punctuation, '').toLowerCase()
    }

    extractWords() {
        const clean = this.text.replaceAll('-\n', '')
        const words = clean.split(/\s+/)
        this.numberOfWords = words.length
        this.element.innerHTML = ''
        words.forEach((word) => {
            let span = this.addWordToDisplay(word)
            word = this.cleanWord(word)
            if (!this.words.has(word)) {
                this.words.set(word, {
                    spans: [],
                    status: 'unknown',
                    definition: ''
                })
                this.lookupWord(word, (row) => {
                    if (row === undefined) return
                    let wordData = this.words.get(word)
                    wordData.definition = row.definition
                    wordData.status = row.status
                })
            }
            this.words.get(word).spans.push(span)
        })
    }

    lookupWord(word, cb) {
        this.db.get("SELECT * FROM words WHERE original = ?", [word], (err, row) => cb(row))
    }

    updateWord() {
        const definition = this.definitionE.value
        const original = this.originalE.innerHTML
        const wordData = this.words.get(original)
        wordData.definition = definition
        if (definition !== '' && wordData.status === 'unknown') wordData.status = 'learning'
        const status = wordData.status
        console.log('Updating definition... for ' + original + ' to ' + definition)
        let sql = 'INSERT OR IGNORE INTO words (original, definition, status)' +
            ' VALUES ($original, $definition, $status)'
        const params =  {$definition: definition, $original: original, $status: status}
        this.db.run(sql, params)
        sql = 'UPDATE words SET definition = $definition, status = $status WHERE original = $original'
        this.db.run(sql, params)
        this.updateHighlighting(original)
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
            e.preventDefault()
            console.log('Pressed tab')
            const current = document.querySelector('span.selected')
            if (!current) return
            console.log('Current word: ' + current.innerHTML)
            this.definitionE.blur()
            const sibling = current.nextElementSibling
            if (sibling) sibling.click()
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            this.changeStatus(-1)
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            this.changeStatus(1)
        }
    }

    changeStatus(n) {
        const current = document.querySelector('span.selected')
        if (!current) return
        let word = this.cleanWord(current.innerHTML)
        let wordData = this.words.get(word)
        let statuses = ['known', 'learning', 'unknown']
        let index = statuses.indexOf(wordData.status) + n
        if (index > 2) index -= 3
        if (index < 0) index += 3
        console.log('Old status for ' + word + ' is ' + wordData.status)
        wordData.status = statuses[index]
        this.updateHighlighting(word)
    }

    updateHighlighting(word) {
        const data = this.words.get(word)
        console.log('Updating status for ' + word + ' to ' + data.status)
        data.spans.forEach((span) => {
            let statuses = ['unknown', 'learning', 'known']
            span.classList.remove(...statuses)
            if (this.highlightCB.checked) {
                span.classList.add(data.status)
            }
        })
    }

    highlight(e) {
        this.words.forEach((data, word) => this.updateHighlighting(word))
    }

    googleTranslate() {
        const original = this.originalE.innerText
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=cs&tl=en&dt=t&q=' + original
        console.log(url)
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

    selectRandom() {
        let values = Array.from(this.words.values()).filter(e => e.definition !== '')
        if (values.length === 0) return
        let index = Math.floor(Math.random() * values.length)
        let data = values[index]
        index = Math.floor(Math.random() * data.spans.length)
        let span = data.spans[index]
        span.scrollIntoView({block: 'center'})
        span.click()
    }

    openFile() {
        ipcRenderer.invoke('open-file').then((result) => {
            fs.readFile(result[0], (err, contents) => {
                this.titleE.textContent = result[0]
                this.numberOfWords = 0
                this.words = new Map()
                this.text = contents.toString()
                this.extractWords()
                fs.writeFile('runtime-data.json', JSON.stringify({openFile: result[0]}), err => {})
            })
        });
    }

    randomWord() {
        let defined = []
        this.words.forEach((value, key) => {
            if (value.definition === '') return;
            defined.push([key, value])
        })
        if (defined.length === 0) return
        let index = Math.floor(Math.random() * defined.length)
        return defined[index];
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            let r = Math.floor(Math.random() * (i + 1));
            [a[i], a[r]] = [a[r], a[i]]
        }
    }

    createDraggableItem(id, text, solution) {
        let td = document.createElement('td')
        td.id = id
        td.classList.add('matching-item')
        td.innerText = text
        td.draggable = true
        td.dataset.solution = solution

        td.addEventListener('drop', (e) => {
            e.preventDefault()
            let other = document.getElementById(e.dataTransfer.getData('text/plain'))
            let thisHTML = e.target.innerHTML
            e.target.innerHTML = other.innerHTML
            other.innerHTML = thisHTML
            e.target.classList.remove('drag-over')
            if (e.target.dataset.solution === '') return;
            if (e.target.innerHTML === e.target.dataset.solution) {
                e.target.classList.add('correct-match')
            } else {
                e.target.classList.add('incorrect-match')
            }
        });
        td.addEventListener('dragenter', (e) => {
            e.preventDefault()
            e.target.classList.add('drag-over')
        });
        td.addEventListener('dragover', (e) => {
            e.preventDefault()
            e.target.classList.add('drag-over')
        });
        td.addEventListener('dragleave', (e) => {
            e.target.classList.remove('drag-over')
        });
        td.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id)
            e.target.classList.remove('correct-match', 'incorrect-match')
        })
        return td
    }

    vocabMatching() {
        this.titleE.textContent = 'Vocabulary Matching'
        this.element.innerHTML = ''
        let words = [];
        let definitions = [];
        for (let i = 0; i < 8; i++) {
            let [word, data] = this.randomWord()
            words.push(word)
            definitions.push(data.definition)
        }
        let shuffled = [...definitions]
        this.shuffle(shuffled)
        let rows = []
        for (let i in words) {
            rows.push(['tr',
                ['td', {className: 'matching-item'}, words[i]],
                this.createDraggableItem('matching-blank-' + i, '', definitions[i]),
                this.createDraggableItem('matching-definition-' + i, shuffled[i], ''),
            ])
        }
        this.element.append(this.createHTML(['table', ['tbody', ...rows]]))
    }

    createHTML(a) {
        let [tag, ...rest] = a
        let element = document.createElement(tag)
        for (let i in rest) {
            let item = rest[i]
            if (Array.isArray(item)) {
                element.append(this.createHTML(item))
            } else if (typeof item === 'string' || item instanceof Element) {
                element.append(item)
            } else if (typeof item === 'object') {
                for (let prop in item) {
                    element[prop] = item[prop]
                }
            }
        }
        return element
    }
}
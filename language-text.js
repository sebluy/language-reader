const sqlite3 = require('sqlite3')
const SideBar = require('./side-bar')

module.exports = class LanguageText {
    constructor() {
        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')
        this.element.addEventListener('click', (e) => this.clickWord(e))
        this.db = new sqlite3.Database('./words.db')
        this.sidebar = new SideBar(this)
    }

    loadText(text, filename) {
        this.numberOfWords = 0
        this.words = new Map()
        this.text = text
        this.sentences = []
        this.cleanText()
        this.extractWords()
        this.extractSentences()
        this.titleE.textContent = filename
    }

    addWordToDisplay(word) {
        const span = document.createElement('span')
        span.innerHTML = word
        this.element.appendChild(span)
        return span
    }

    cleanWord(word) {
        const punctuation = /[,.!?"“„]/g
        return word.replaceAll(punctuation, '').toLowerCase()
    }

    cleanText() {
        this.text = this.text.replaceAll('-\n', '')
        this.text = this.text.replaceAll('\n', ' ')
        this.text = this.text.replaceAll('\t', '\n\t')
    }

    extractWords() {
        const words = this.text.split(/\s+/)
        const wordsAndSpaces = this.text.split(/(\s+)/)
        this.numberOfWords = words.length
        this.element.innerHTML = ''
        wordsAndSpaces.forEach((word) => {
            if (word.trim() === '') {
                this.element.appendChild(document.createTextNode(word))
                return
            }
            let span = this.addWordToDisplay(word)
            word = this.cleanWord(word)
            if (!this.words.has(word)) {
                this.words.set(word, {
                    spans: [],
                    mastery: 1.0,
                    definition: ''
                })
                this.lookupWord(word, (row) => {
                    if (row === undefined) return
                    let wordData = this.words.get(word)
                    wordData.definition = row.definition
                    wordData.mastery = row.mastery
                })
            }
            this.words.get(word).spans.push(span)
        })
    }

    lookupWord(word, cb) {
        this.db.get("SELECT * FROM words WHERE original = ?", [word], (err, row) => cb(row))
    }

    updateWord(original, definition) {
        const wordData = this.words.get(original)
        wordData.definition = definition
        console.log('Updating definition... for ' + original + ' to ' + definition)
        let sql = 'INSERT OR IGNORE INTO words (original, definition)' +
            ' VALUES ($original, $definition)'
        const params =  {$definition: definition, $original: original}
        this.db.run(sql, params)
        sql = 'UPDATE words SET definition = $definition WHERE original = $original'
        this.db.run(sql, params)
        this.updateHighlighting(original)
    }

    updateMastery(word, success) {
        let data = this.words.get(word)
        let sql
        if (success) {
            data.mastery /= 2
            sql = 'UPDATE words SET mastery = mastery / 2  WHERE original = $original'
        } else {
            data.mastery = 1
            sql = 'UPDATE words SET mastery = 1 WHERE original = $original'
        }
        this.db.run(sql, {$original: word})
    }

    clickWord(e) {
        if (e.target.matches('span')) {
            const oldWordE = document.querySelector('span.selected')
            if (oldWordE) oldWordE.classList.remove('selected')
            e.target.classList.add('selected')
            const word = this.cleanWord(e.target.innerHTML)
            console.log('Switching word... to ' + word)
            console.log(this.words.get(word))
            this.sidebar.showWordAndDefinition(word, this.words.get(word).definition)
        }
    }

    nextWord() {
        const current = document.querySelector('span.selected')
        if (!current) return
        const sibling = current.nextElementSibling
        if (sibling) sibling.click()
    }

    // changeStatus(n) {
    //     const current = document.querySelector('span.selected')
    //     if (!current) return
    //     let word = this.cleanWord(current.innerHTML)
    //     let wordData = this.words.get(word)
    //     let statuses = ['known', 'learning', 'unknown']
    //     let index = statuses.indexOf(wordData.status) + n
    //     if (index > 2) index -= 3
    //     if (index < 0) index += 3
    //     console.log('Old status for ' + word + ' is ' + wordData.status)
    //     wordData.status = statuses[index]
    //     this.updateHighlighting(word)
    // }

    updateHighlighting(word) {
        const data = this.words.get(word)
        data.spans.forEach((span) => {
            if (this.sidebar.isHighlightChecked() && data.definition !== '') {
                let hue = ((1 - data.mastery) * 120).toString(10)
                span.style.backgroundColor = 'hsl(' + hue + ',100%,75%)'
            } else {
                span.style.backgroundColor = 'white'
            }
        })
    }

    highlight(e) {
        this.words.forEach((data, word) => this.updateHighlighting(word))
    }

    updateStats() {
        let countTranslated = 0
        let mastered = 0
        this.words.forEach((data) => {
            mastered += data.mastery
            if (data.definition === '') return
            countTranslated += data.spans.length
        })
        return {
            numberOfWords: this.numberOfWords,
            numberOfDistinctWords: this.words.size,
            countTranslated: countTranslated,
            mastered: mastered
        }
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

    weightedRandomWord(words) {
        let defined = []
        let cumWeight = 0
        words.forEach((value, key) => {
            if (value.definition === '') return
            cumWeight += value.mastery
            defined.push([key, value, cumWeight])
        })
        if (defined.length === 0) return
        let index = Math.floor(Math.random() * cumWeight)
        return defined.find(([v, k, cumWeight]) => index < cumWeight)
    }

    randomElement(a) {
        return a[Math.floor(Math.random() * a.length)]
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            let r = Math.floor(Math.random() * (i + 1));
            [a[i], a[r]] = [a[r], a[i]]
        }
    }

    createDraggableItem(id, word, text, solution, element = 'td') {
        let el = document.createElement(element)
        el.id = id
        el.classList.add('matching-item')
        el.innerText = text
        el.draggable = true

        el.addEventListener('drop', (e) => {
            e.preventDefault()
            let source = document.getElementById(e.dataTransfer.getData('text/plain'))
            let dest = e.target
            if (dest.draggable === false) return
            let destHTML = dest.innerHTML
            dest.innerHTML = source.innerHTML
            source.innerHTML = destHTML
            dest.classList.remove('drag-over')
            if (solution === '') return;
            console.log(dest.innerHTML, solution)
            if (dest.innerHTML === solution) {
                this.updateMastery(word, true)
                dest.draggable = false
                dest.classList.remove('incorrect-match')
                dest.classList.add('correct-match')
            } else {
                this.updateMastery(word, false)
                dest.classList.add('incorrect-match')
            }
        });
        el.addEventListener('dragenter', (e) => {
            e.preventDefault()
            if (e.target.draggable === false) return
            e.target.classList.add('drag-over')
        });
        el.addEventListener('dragover', (e) => {
            e.preventDefault()
            if (e.target.draggable === false) return
            e.target.classList.add('drag-over')
        });
        el.addEventListener('dragleave', (e) => {
            e.target.classList.remove('drag-over')
        });
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id)
            e.target.classList.remove('incorrect-match')
        })
        return el
    }

    vocabMatching() {
        this.titleE.textContent = 'Vocabulary Matching'
        this.element.innerHTML = ''
        let words = [];
        let definitions = [];
        for (let i = 0; i < 8; i++) {
            let [word, data] = this.weightedRandomWord(this.words)
            words.push(word)
            definitions.push(data.definition)
        }
        let shuffled = [...definitions]
        this.shuffle(shuffled)
        let rows = []
        for (let i in words) {
            rows.push(['tr',
                ['td', {className: 'matching-item'}, words[i]],
                this.createDraggableItem('matching-blank-' + i, words[i], '', definitions[i]),
                this.createDraggableItem('matching-definition-' + i, words[i], shuffled[i], ''),
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

    fillInTheBlanks() {
        this.titleE.textContent = 'Fill in the Blanks'
        let sentenceIndex = Math.floor(Math.random() * (this.sentences.length - 10))
        let sentences = []
        this.element.innerHTML = ''
        for (let i = 0; i < 10; i++) {
            let text = this.sentences[sentenceIndex + i].text
            let sentenceData = {
                text: text,
                words: new Map()
            }
            let wordsAndSpaces = text.split(/(\s+)/)
            wordsAndSpaces.forEach((word) => {
                if (word.trim() === '') {
                    this.element.appendChild(document.createTextNode(word))
                    return
                }
                let span = this.addWordToDisplay(word)
                word = this.cleanWord(word)
                if (!sentenceData.words.has(word)) {
                    let wordData = {...this.words.get(word)}
                    wordData.spans = []
                    sentenceData.words.set(word, wordData)
                }
                sentenceData.words.get(word).spans.push(span)
            })
            sentences.push(sentenceData)
        }

        let choices = []
        for (let i = 0; i < sentences.length; i++) {
            let [word, data] = this.weightedRandomWord(sentences[i].words)
            let span = this.randomElement(data.spans)
            let blank = this.createDraggableItem('matching-blank-' + i, word, '', word, 'span')
            choices.push([word, data])
            span.parentNode.replaceChild(blank, span)
        }
        this.shuffle(choices)
        this.element.append('\n')
        choices.forEach(([word, data], i) => {
            let item = this.createDraggableItem('matching-word-' + i, word, word, '', 'span')
            this.element.append(item)
        })
        // add choices
        // drag and drop
        // allow click translation
        // move to another class
    }

    extractSentences() {
        let i = 0;
        while (true) {
            let endPos = this.nextPos(this.text, i);
            if (endPos === false) return
            let text = (this.text).substring(i, endPos + 1);
            this.sentences.push({text: text, index: i})
            i = endPos + 1
        }
    }

    isEndChar(char)
    {
        return char.match(/[.?!]/) !== null
    }

    nextPos(book, i)
    {
        let inQuote = false
        while (true) {
            let char = book.substring(i, i + 1)
            if (char === false || char === '') return false
            if (char === '„') inQuote = true
            if (inQuote) {
                if (char === '“') inQuote = false
                i++
                continue
            }
            let match = this.isEndChar(char)
            if (match) break
            i++
        }
        while (this.isEndChar(book.substring(i + 1, i + 2))) i++
        return i
    }

}
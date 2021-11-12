const sqlite3 = require('sqlite3')
const SideBar = require('./side-bar')

module.exports = class LanguageText {

    constructor() {
        this.element = document.querySelector('#text p')
        this.titleE = document.querySelector('#text h2')
        this.element.addEventListener('click', (e) => this.clickWord(e))
        document.addEventListener('keydown', (e) => this.sidebar.handleKey(e))
        this.db = new sqlite3.Database('./words.db')
        this.sidebar = new SideBar(this)
    }

    loadText(text, filename) {
        this.words = new Map()
        this.filename = filename
        this.text = text
        this.sentences = []
        this.extractAudio()
        this.cleanText()
        this.extractWords()
        this.extractSentences()
        this.loadPage()
    }

    loadPage() {
        this.titleE.textContent = this.filename
        this.element.innerHTML = ''
        this.words.forEach((v, k) => v.spans = [])
        this.addText({text: this.text, words: this.words})
    }

    extractAudio() {
        let match = this.text.match(/<audio>([\d:]+)<\/audio>/)
        if (match === null) return
        this.sidebar.setAudio(match[1])
        this.text = this.text.replace(match[0], '')
    }

    addWordToDisplay(word) {
        const span = document.createElement('span')
        span.innerHTML = word
        this.element.appendChild(span)
        return span
    }

    cleanWord(word) {
        const punctuation = /[,.!?"“„:\-–;]+/
        const regex = new RegExp('^' + punctuation.source + '|' + punctuation.source + '$', 'g')
        return word.replaceAll(regex, '').toLowerCase()
    }

    cleanText() {
        this.text = this.text.replaceAll('-\n', '')
        this.text = this.text.replaceAll('\n', ' ')
        this.text = this.text.replaceAll('\t', '\n\t')
    }

    extractWords() {
        const words = this.text.split(/\s+/)
        words.forEach((word) => {
            word = this.cleanWord(word)
            if (word === '') return
            if (!this.words.has(word)) {
                this.words.set(word, {
                    mastery: 1.0,
                    definition: ''
                })

            }
        })
        this.fetchWords((rows) => {
            rows.forEach((row) => {
                if (!this.words.has(row.original)) return
                let wordData = this.words.get(row.original)
                wordData.definition = row.definition
                wordData.mastery = row.mastery
            })
            this.sidebar.updateStats()
            this.highlight()
        })
    }

    fetchWords(cb) {
        this.db.all("SELECT * FROM words", (err, rows) => cb(rows))
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

    highlight() {
        this.words.forEach((data, word) => this.updateHighlighting(word))
    }

    updateStats() {
        let countTranslated = 0
        let mastered = 0
        let numberOfWords = 0
        this.words.forEach((data) => {
            mastered += data.mastery
            numberOfWords += data.spans.length
            if (data.definition === '') return
            countTranslated += data.spans.length
        })
        let percentTranslated = countTranslated === 0 ? 0 : countTranslated / numberOfWords
        let percentMastered = 1 - (mastered / this.words.size)
        return {
            numberOfWords: numberOfWords,
            numberOfDistinctWords: this.words.size,
            percentTranslated: percentTranslated,
            percentMastered: percentMastered,
        }
    }

    weightedRandomWords(words, n) {
        let defined = []
        let cumWeight = 0
        words.forEach((value, key) => {
            if (value.definition === '') return
            defined.push([key, value, cumWeight, cumWeight + value.mastery])
            cumWeight += value.mastery
        })
        if (defined.length < n) return []

        let random = []
        while (random.length < n) {
            let index = Math.random() * cumWeight
            let word = defined.find(([k, v, start, end]) => start <= index && index < end)
            if (random.find(chosen => chosen[0] === word[0])) continue
            random.push(word)
            console.log(word[1].mastery)
        }
        return random
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            let r = Math.floor(Math.random() * (i + 1));
            [a[i], a[r]] = [a[r], a[i]]
        }
    }

    createDraggableItem(id, word, text, solution, correctCb, element = 'td') {
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
                correctCb()
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

    createHTML(a) {
        let [tag, ...rest] = a
        let element = document.createElement(tag)
        for (let i in rest) {
            let item = rest[i]
            if (Array.isArray(item)) {
                element.append(this.createHTML(item))
            } else if (typeof item === 'string' || typeof item === 'number' || item instanceof Element) {
                element.append(item)
            } else if (typeof item === 'object') {
                for (let prop in item) {
                    element[prop] = item[prop]
                }
            }
        }
        return element
    }

    extractSentences() {
        let i = 0;
        while (true) {
            let endPos = this.nextPos(this.text, i);
            if (endPos === false) return
            let text = (this.text).substring(i, endPos + 1);
            this.sentences.push(text)
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

    getRandomSentenceBlock(n)
    {
        let sentenceIndex = Math.floor(Math.random() * (this.sentences.length - n))
        let block = []
        for (let i = 0; i < n; i++) {
            let text = this.sentences[sentenceIndex + i]
            let sentenceData = {
                text: text,
                words: new Map()
            }
            let words = text.split(/\s+/)
            words.forEach((word) => {
                word = this.cleanWord(word)
                if (word === '') return
                if (!sentenceData.words.has(word)) {
                    let wordData = {...this.words.get(word)}
                    wordData.spans = []
                    sentenceData.words.set(word, wordData)
                }
            })
            block.push(sentenceData)
        }
        return block
    }

    addText(textData) {
        let wordsAndSpaces = textData.text.split(/(\s+)/)
        wordsAndSpaces.forEach((word) => {
            if (word.trim() === '') {
                this.element.appendChild(document.createTextNode(word))
                return
            }
            let span = this.addWordToDisplay(word)
            word = this.cleanWord(word)
            if (word === '') return
            textData.words.get(word).spans.push(span)
        })
    }
}
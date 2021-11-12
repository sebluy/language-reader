module.exports = class Utility {

    static weightedRandomWords(words, n) {
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

    static shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            let r = Math.floor(Math.random() * (i + 1));
            [a[i], a[r]] = [a[r], a[i]]
        }
    }

    static createHTML(a) {
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

    static isEndChar(char)
    {
        return char.match(/[.?!]/) !== null
    }

    static nextEndPos(book, i)
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

    static createDraggableItem(props) {
        let el = document.createElement(props.tag)
        el.id = props.id
        el.classList.add('matching-item')
        el.innerText = props.text
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
            if (props.solution === undefined) return;
            console.log(dest.innerHTML, props.solution)
            if (dest.innerHTML === props.solution) {
                dest.draggable = false
                dest.classList.remove('incorrect-match')
                dest.classList.add('correct-match')
                props.onMatch(props.word, true)
            } else {
                dest.classList.add('incorrect-match')
                props.onMatch(props.word, false)
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

}
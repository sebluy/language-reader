export class Utility {

    static randomWordsByMastery(words, n) {
        let values = Array.from(words.values()).filter((v) => v.definition !== '')
        if (values.length < n) return []
        let mastery = values.map((v) => v.mastery)
        let minimum = Math.min(...mastery)

        let random = []
        while (random.length < n) {
            let pool = values.filter((v) => v.mastery === minimum)
            Utility.shuffle(pool)
            random = random.concat(pool.slice(0, n - random.length))
            minimum += 1
        }
        return random
    }

    static cleanWord(word) {
        const punctuation = /[,.!?"“„‘‚:\-–;…()]+/
        const regex = new RegExp('^' + punctuation.source + '|' + punctuation.source + '$', 'g')
        return word.replaceAll(regex, '').toLowerCase()
    }

    static shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            let r = Math.floor(Math.random() * (i + 1));
            [a[i], a[r]] = [a[r], a[i]]
        }
    }

    static randomItem(a) {
        let index = Math.floor(Math.random() * a.length);
        return a[index]
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
        while (true) {
            let char = book.substring(i, i + 1)
            if (char === false || char === '') return false
            let match = this.isEndChar(char)
            if (match) break
            i += 1
        }
        while (true) {
            let char = book.substring(i + 1, i + 2)
            let match = this.isEndChar(char)
            if (!match) break
            i += 1
        }
        while (true) {
            let char = book.substring(i + 1, i + 2)
            let match = char.match(/[\s“]/) !== null
            if (!match) break
            i += 1
        }
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
            if (props.onDrop) props.onDrop(source, dest, props)
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
            // e.target.classList.remove('incorrect-match')
        })
        return el
    }

    static benchmark(f) {
        let t1 = (new Date()).getTime()
        f()
        let t2 = (new Date()).getTime()
        console.log((t2 - t1)/1000)
    }

    static download(filename, text) {
        let element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
        element.setAttribute('download', filename)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    static upload(cb) {
        let element = document.createElement('input')
        element.setAttribute('type', 'file')
        element.style.display = 'none'
        document.body.appendChild(element)
        element.addEventListener('change', () => {
            cb(element.files[0])
            element.remove()
        })
        element.click()
    }

    static uploadText(cb) {
        Utility.upload((file) => {
            file.text().then(text => cb(file.name, text))
        })
    }

    static resetMainView(title) {
        let mainE = document.getElementById('main')
        mainE.innerHTML = ''
        let titleE = document.createElement('h2')
        titleE.textContent = title
        let textE = document.createElement('p')
        mainE.append(titleE, textE)
        return textE
    }

}
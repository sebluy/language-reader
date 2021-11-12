const sqlite3 = require('sqlite3')

module.exports = class LanguageDB {

    constructor() {
        this.db = new sqlite3.Database('./words.db')
    }

    fetchWords(cb) {
        this.db.all("SELECT * FROM words", (err, rows) => cb(rows))
    }

    updateWord(word, definition) {
        let sql = 'INSERT OR IGNORE INTO words (original, definition)' +
            ' VALUES ($original, $definition)'
        const params =  {$definition: definition, $original: word}
        this.db.run(sql, params)
        sql = 'UPDATE words SET definition = $definition WHERE original = $original'
        this.db.run(sql, params)
    }

    updateMastery(word, mastery) {
        let sql = 'UPDATE words SET mastery = $mastery WHERE original = $original'
        this.db.run(sql, {$original: word, $mastery: mastery})
    }

}
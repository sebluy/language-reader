const sqlite3 = require('sqlite3')

module.exports = class LanguageDB {

    constructor() {
        this.db = new sqlite3.Database('./words.db')
    }

    fetchWords(cb) {
        this.db.all("SELECT * FROM words", (err, rows) => cb(rows))
    }

    fetchSentences(cb) {
        this.db.all("SELECT * FROM sentences", (err, rows) => cb(rows))
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

    updateSentenceMastery(sentence, mastery) {
        let sql = 'UPDATE sentences SET mastery = $mastery WHERE sentence = $sentence'
        this.db.run(sql, {$sentence: sentence, $mastery: mastery})
    }

    updateSentenceTimes(sentence) {
        let params = {
            $sentence: sentence.text,
            $startTime: sentence.startTime,
            $endTime: sentence.endTime
        }
        let sql = 'INSERT OR IGNORE INTO sentences (sentence, startTime, endTime)' +
            ' VALUES ($sentence, $startTime, $endTime)'
        this.db.run(sql, params)
        sql = 'UPDATE sentences SET startTime = $startTime, endTime = $endTime WHERE sentence = $sentence'
        this.db.run(sql, params)
    }

}
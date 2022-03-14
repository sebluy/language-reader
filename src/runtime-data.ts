export class RuntimeData {

    currentPage: number
    xpToday: number
    xpLast: number
    xpDate: string
    openAudioFile: string
    openTextFile: string
    wordsLearnedToday: number
    language: string

    static empty() {
        let data = new RuntimeData()
        data.xpToday = 0
        data.xpLast = 0
        data.xpDate = (new Date()).toLocaleDateString()
        data.currentPage = 0
        data.wordsLearnedToday = 0
        data.language = 'es'
        return data
    }

    static fromObject(o) {
        let data = new RuntimeData()
        Object.assign(data, o)
        return data
    }

    updateForNewDay() {
        if (this.isNewDay()) {
            this.xpLast = this.xpToday
            this.xpToday = 0
            this.xpDate = (new Date()).toLocaleDateString()
            this.wordsLearnedToday = 0
        }
    }

    isNewDay() {
        return this.xpDate !== (new Date()).toLocaleDateString()
    }

}
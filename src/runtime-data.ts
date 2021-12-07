export class RuntimeData {

    currentPage: number
    xpToday: number
    xpYesterday: number
    xpDate: string
    openAudioFile: string
    openTextFile: string

    static empty() {
        let data = new RuntimeData()
        data.xpToday = 0
        data.xpYesterday = 0
        data.xpDate = (new Date()).toLocaleDateString()
        data.currentPage = 0
        return data
    }

    static fromObject(o) {
        let data = new RuntimeData()
        Object.assign(data, o)
        return data
    }

    updateXP() {
        if (this.xpDate !== (new Date()).toLocaleDateString()) {
            this.xpYesterday = this.xpToday
            this.xpToday = 0
            this.xpDate = (new Date()).toLocaleDateString()
        }
    }

}
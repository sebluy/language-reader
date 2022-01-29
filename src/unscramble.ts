import { UnscrambleView } from './unscramble-view.js'
import { SentenceActivity } from './sentence-activity.js'

export class Unscramble extends SentenceActivity {

    // TODO: fix drag-and-drop. Chrome bug?
    // TODO: fix "clean" words

    title() {
        return 'Unscramble'
    }

    show() {
        super.show()
        let sidebar = this.controller.sidebar
        sidebar.showSentence(this.sentence)
        sidebar.showAudio()
        sidebar.showAudioTimes()
        this.createUnscrambleView()
    }

    createUnscrambleView() {
        let rawWords = this.sentence.getRawWords()
        let words = this.rawSentence.getWords()
        let index = words.indexOf(this.word.word)
        let view = new UnscrambleView(this.textE, rawWords, rawWords[index])
        view.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.word.word])
            this.controller.addXP(1)
            this.nextActivity()
        }
        view.onClickWord = (word) => this.controller.sidebar.showWord(word)
        view.render()
    }

    cleanup() {}

}
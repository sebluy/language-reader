import { MultipleChoice } from './multiple-choice'
import { SentenceActivity } from './sentence-activity';

export class Listening2 extends SentenceActivity {

    multipleChoice: MultipleChoice

    show() {
        super.show()
        this.controller.sidebar.showSentence(this.sentence)
        this.controller.sidebar.showAudio()
        this.controller.sidebar.showAudioTimes()
        this.createMultipleChoice()
    }

    title() {
        return 'Listening 2'
    }

    cleanup() {
        this.multipleChoice.cleanup()
    }

    createMultipleChoice() {
        let definitions = this.languageText.getSentenceDefinitionArray()
        this.multipleChoice = new MultipleChoice(definitions, this.sentence.definition)
        this.multipleChoice.onCorrectAnswer = () => {
            this.languageText.updateMastery([this.word.word])
            this.controller.addXP(1)
            this.nextActivity()
        }
        this.multipleChoice.render(this.textE)
    }

}
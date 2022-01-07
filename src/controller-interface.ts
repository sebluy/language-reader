import { RuntimeData } from './runtime-data.js'
import { LanguageText } from './language-text.js'

export interface ControllerInterface {
    runtimeData: RuntimeData
    languageText: LanguageText

    openTextFile()
    openAudioFile()
    changePageBy(n)

    importDatabase()
    exportDatabase()

    showReader()
    showUnscramble()
    showVocabularyMatching()
    showListening(index?: number)
    showListening2(index?: number)
    showVocabInContext(index?: number)
    showCloze(index?: number)

    addXP(n: number)

}
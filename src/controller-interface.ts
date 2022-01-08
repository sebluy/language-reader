import { RuntimeData } from './runtime-data.js'
import { LanguageText } from './language-text.js'
import { MainWindow } from './main-window.js'
import { SideBar } from './side-bar.js'

export interface ControllerInterface {
    mainWindow: MainWindow
    runtimeData: RuntimeData
    languageText: LanguageText
    sidebar: SideBar

    openTextFile()
    openAudioFile()
    changePageBy(n)

    importDatabase()
    exportDatabase()

    showActivity(name: string)
    showReader()
    showUnscramble()
    showVocabularyMatching()
    showListening(index?: number)
    showListening2(index?: number)
    showVocabInContext(index?: number)
    showCloze(index?: number)

    addXP(n: number)

}
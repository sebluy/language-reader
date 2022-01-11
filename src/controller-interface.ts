import { RuntimeData } from './runtime-data.js'
import { LanguageText } from './language-text.js'
import { MainWindow } from './main-window.js'
import { SideBar } from './side-bar.js'
import { Activity } from './controller.js'

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

    showActivityByName(name: string)
    showActivity(activity: Activity)

    addXP(n: number)
    learnNewWords(n: number)

}
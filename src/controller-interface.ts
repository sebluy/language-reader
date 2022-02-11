import { RuntimeData } from './runtime-data'
import { LanguageText } from './language-text'
import { MainWindow } from './main-window'
import { SideBar } from './side-bar'
import { Activity } from './activity'

export interface ControllerInterface {
    mainWindow: MainWindow
    runtimeData: RuntimeData
    languageText: LanguageText
    sidebar: SideBar

    openFiles()
    changePageBy(n)

    importDatabase()
    exportDatabase()

    showActivityByName(name: string)
    showActivity(activity: Activity)

    addXP(n: number)
    learnNewWords(n: number)
    updateLanguage(language: string): void
}
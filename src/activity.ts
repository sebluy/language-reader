import { ControllerInterface } from './controller-interface.js'

export class Activity {

    controller: ControllerInterface

    constructor(controller) {
        this.controller = controller
    }

    nextActivity(): void {
        this.controller.showActivity(new (<any>this.constructor)(this.controller))
    }

    show(): void {}
    cleanup(): void {}
    update(last: Activity): void {}

}

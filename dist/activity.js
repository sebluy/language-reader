export class Activity {
    constructor(controller) {
        this.controller = controller;
    }
    nextActivity() {
        this.controller.showActivity(new this.constructor(this.controller));
    }
    show() { }
    cleanup() { }
    update(last) { }
}

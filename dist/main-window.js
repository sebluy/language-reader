export class MainWindow {
    constructor() {
        this.titleE = document.querySelector('#main h2');
        this.subTitleE = document.querySelector('#main h3');
        this.contentDiv = document.querySelector('#main div');
    }
    reset(title, subTitle) {
        this.titleE.textContent = title;
        this.subTitleE.textContent = subTitle;
        this.contentDiv.innerHTML = '';
    }
}

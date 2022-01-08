import { Utility } from './utility.js';
import { Reader } from './reader.js';
import { Unscramble } from './unscramble.js';
import { Listening } from './listening.js';
import { VocabInContext } from './vocab-in-context.js';
import { Cloze } from './cloze.js';
import { Listening2 } from './listening2.js';
import { DefinitionInput } from './definition-input.js';
export class SideBar {
    constructor(controller) {
        this.controller = controller;
        this.highlightingOn = false;
        this.setElementsAndListeners();
    }
    setElementsAndListeners() {
        this.wordDefinitionE = new DefinitionInput(document.getElementById('word-definition'));
        this.wordDefinitionE.onUpdateDefinition = (text, definition) => {
            this.languageText.updateWordDefinition(text, definition);
        };
        this.wordDefinitionE.onNext = () => this.onNextWord();
        this.wordDefinitionE.render();
        this.sentenceDefinitionE = new DefinitionInput(document.getElementById('sentence-definition'));
        this.sentenceDefinitionE.onUpdateDefinition = (text, definition) => {
            this.languageText.updateSentenceDefinition(text, definition);
        };
        this.sentenceDefinitionE.onNext = () => this.onNextSentence();
        this.sentenceDefinitionE.render('textarea');
        this.statsE = document.getElementById('stats');
        this.highlightCB = document.getElementById('highlight');
        this.audioE = document.getElementById('audio');
        this.audioStartE = document.getElementById('audio-start');
        this.audioEndE = document.getElementById('audio-end');
        this.previousPageE = document.getElementById('previous-page');
        this.nextPageE = document.getElementById('next-page');
        this.checkAnswerE = document.getElementById('check-answer');
        this.highlightCB.addEventListener('click', () => {
            this.highlightingOn = !this.highlightingOn;
            this.updateHighlighting(this.highlightingOn);
        });
        this.audioStartE.addEventListener('focusout', () => this.updateAudioTimes());
        this.audioEndE.addEventListener('focusout', () => this.updateAudioTimes());
        this.previousPageE.addEventListener('click', (e) => this.controller.changePageBy(-1));
        this.nextPageE.addEventListener('click', (e) => this.controller.changePageBy(1));
        // TODO: move to unscramble
        this.checkAnswerE.addEventListener('click', (e) => this.checkAnswer());
        document.getElementById('update-stats').addEventListener('click', () => this.updateStats());
        document.getElementById('open-text-file')
            .addEventListener('click', () => this.controller.openTextFile());
        document.getElementById('open-audio-file')
            .addEventListener('click', () => this.controller.openAudioFile());
        let select = document.getElementById('activity-select');
        select.addEventListener('click', () => this.controller.showActivityByName(select.value));
        document.getElementById('export')
            .addEventListener('click', () => this.controller.exportDatabase());
        document.getElementById('import')
            .addEventListener('click', () => this.controller.importDatabase());
        document.addEventListener('keydown', (e) => this.handleKey(e));
    }
    setAudio(startTime, endTime = undefined) {
        this.audioStart = startTime;
        this.audioEnd = endTime;
        if (this.audioStart !== undefined)
            this.audioE.currentTime = startTime;
        clearTimeout(this.timeout);
        if (!this.audioE.paused)
            this.audioE.pause();
    }
    playAudio() {
        // TODO: Fix playback for 0
        clearTimeout(this.timeout);
        this.audioE.play();
        if (this.audioEnd) {
            let remaining = this.audioEnd - this.audioE.currentTime;
            this.timeout = window.setTimeout(() => {
                this.audioE.currentTime = this.audioStart;
                this.audioE.pause();
            }, remaining * 1000);
        }
    }
    handleKey(e) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
            return;
        if (e.key === 'p') {
            if (this.audioE.paused) {
                this.playAudio();
            }
            else {
                clearTimeout(this.timeout);
                this.audioE.pause();
            }
        }
        else if (e.key === 'r') {
            if (this.audioStart)
                this.audioE.currentTime = this.audioStart;
            this.playAudio();
        }
        else if (e.key === 'm') {
            this.markAudio();
        }
    }
    showWord(word, sentence) {
        let wordO = this.languageText.words.get(word);
        let sentenceO = this.languageText.sentenceMap.get(sentence);
        if (wordO !== undefined)
            this.wordDefinitionE.show(wordO.word, wordO.definition);
        if (sentenceO !== undefined)
            this.sentenceDefinitionE.show(sentenceO.sentence, sentenceO.definition, false);
    }
    showSentence(sentence) {
        if (sentence === undefined) {
            this.currentSentence = undefined;
            this.audioStartE.value = this.audioEndE.value = '';
            this.setAudio(undefined);
            return;
        }
        this.currentSentence = sentence;
        this.audioStartE.value = sentence.startTime === undefined ? '' : sentence.startTime.toFixed(1);
        this.audioEndE.value = sentence.endTime === undefined ? '' : sentence.endTime.toFixed(1);
        this.setAudio(sentence.startTime, sentence.endTime);
        if (sentence.startTime !== undefined)
            this.playAudio();
    }
    updateStats() {
        let stats = this.languageText.updateStats();
        let runtimeData = this.controller.runtimeData;
        let fp = (p) => (p * 100).toFixed(2) + '%';
        let newTable = Utility.createHTML(['tbody',
            ['tr', ['td', 'Number of words'], ['td', stats.numberOfWords]],
            ['tr', ['td', 'Number of distinct words'], ['td', stats.numberOfDistinctWords]],
            ['tr', ['td', 'Percent translated'], ['td', fp(stats.percentTranslated)]],
            ['tr', ['td', 'Total Words Translated'], ['td', stats.totalWordsTranslated]],
            ['tr', ['td', 'Words Learned Today'], ['td', stats.wordsLearnedToday]],
            ['tr', ['td', 'Words mastered'], ['td', fp(stats.percentWordsMastered)]],
            ['tr', ['td', 'Today\'s XP'], ['td', runtimeData.xpToday]],
            ['tr', ['td', 'Yesterday\'s XP'], ['td', runtimeData.xpYesterday]]
        ]);
        this.statsE.replaceChild(newTable, this.statsE.childNodes[0]);
    }
    markAudio() {
        let sentences = this.languageText.sentences;
        if (this.marker === undefined) {
            this.audioE.play();
            this.marker = 0;
        }
        if (this.marker > 0) {
            let lastSentence = sentences[this.marker - 1];
            let lastData = this.languageText.sentenceMap.get(lastSentence.clean);
            this.languageText.updateSentenceTimes(lastData, null, this.audioE.currentTime);
            this.unhighlightSentence(this.marker - 1);
        }
        if (this.marker === sentences.length) {
            this.audioE.pause();
            this.marker = undefined;
            return;
        }
        let sentence = sentences[this.marker];
        let sentenceData = this.languageText.sentenceMap.get(sentence.clean);
        this.highlightSentence(this.marker);
        this.languageText.updateSentenceTimes(sentenceData, this.audioE.currentTime, null);
        this.marker += 1;
    }
    parseTime(str) {
        if (str === '')
            return undefined;
        return Number.parseFloat(str);
    }
    updateAudioTimes() {
        if (this.currentSentence === undefined)
            return;
        let start = this.parseTime(this.audioStartE.value);
        let end = this.parseTime(this.audioEndE.value);
        if (!Number.isNaN(start))
            this.currentSentence.startTime = start;
        if (!Number.isNaN(end))
            this.currentSentence.endTime = end;
        this.setAudio(this.currentSentence.startTime, this.currentSentence.endTime);
        this.languageText.updateSentence(this.currentSentence);
    }
    showElement(element, show) {
        element.style.display = show ? '' : 'none';
    }
    setAudioSource(source) {
        this.audioE.src = source;
    }
    loadActivity(activity) {
        // TODO: refactor
        let r = activity instanceof Reader;
        let us = activity instanceof Unscramble;
        let l = activity instanceof Listening;
        let v = activity instanceof VocabInContext;
        let c = activity instanceof Cloze;
        let l2 = activity instanceof Listening2;
        this.showElement(this.wordDefinitionE.parent, r || us || l || v || c);
        this.showElement(this.sentenceDefinitionE.parent, r);
        this.showElement(this.audioE, r || us || l || v || l2);
        this.showElement(this.highlightCB, r);
        this.showElement(this.previousPageE, r);
        this.showElement(this.nextPageE, r);
        this.showElement(this.audioStartE, us || l || v || l2);
        this.showElement(this.audioEndE, us || l || v || l2);
        this.showElement(this.checkAnswerE, us);
    }
    highlightSentence(i) { }
    unhighlightSentence(i) { }
    checkAnswer() { }
    updateHighlighting(on) { }
    onNextWord() { }
    onNextSentence() { }
}

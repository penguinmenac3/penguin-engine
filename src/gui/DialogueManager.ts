export interface Dialogue {
    speakerName: string,
    speakerTitle: string | null,
    interactorName: string,
    interactorTitle: string | null,
    textHTML: string,
    answers: DialogueAnswer[]
}

export interface DialogueAnswer {
    textHTML: string,
    disabled: boolean,
    action: Action
}

export interface Action {
    /**
     * Handle action clicked.
     * 
     * Returns true if dialogue is done. (Dialogue manager then closes dialogue).
     */
    (): boolean
}

export class DialogueManager {
    public constructor(
        protected readonly overlay: HTMLElement,
        protected readonly speakerDiv: HTMLElement,
        protected readonly speakerJob: HTMLElement,
        protected readonly interactorDiv: HTMLElement,
        protected readonly interactorJob: HTMLElement,
        protected readonly textDiv: HTMLElement,
        protected readonly answersDiv: HTMLElement
    ) {}

    protected setSpeaker(speakerName: string, speakerTitle: string | null) {
        this.speakerDiv.innerHTML = speakerName
        if (speakerTitle != null) {
            this.speakerJob.innerHTML = speakerTitle
        } else {
            this.speakerJob.innerHTML = ""
        }
    }

    protected setInteractor(interactorName: string, interactorTitle: string | null) {
        this.interactorDiv.innerHTML = interactorName
        if (interactorTitle != null) {
            this.interactorJob.innerHTML = interactorTitle
        } else {
            this.interactorJob.innerHTML = ""
        }
    }

    protected setText(text: string) {
        this.textDiv.innerHTML = text
    }

    protected createAnswer(answer: DialogueAnswer) {
        let answerDiv = document.createElement("a")
        if (answer.disabled) {
            answerDiv.innerHTML = answer.textHTML + " (unavailable)"
            answerDiv.style.color = "gray"
        } else {
            answerDiv.innerHTML = answer.textHTML
            answerDiv.onclick = (ev) => {
                if (answer.action()) {
                    this.hideDialogue()
                }
            }
        }
        return answerDiv
    }

    protected setAnswers(answers: DialogueAnswer[]) {
        let children = this.answersDiv.children
        while (children.length > 0) {
            this.answersDiv.removeChild(children[0])
        }
        for (let answer of answers) {
            let answerDiv = this.createAnswer(answer)
            this.answersDiv.appendChild(answerDiv)
        }
    }
    
    protected showDialogue() {
        this.overlay.style.display = "block"
    }
    
    public hideDialogue() {
        this.overlay.style.display = "none"
    }

    public openDialogue(dialogue: Dialogue) {
        this.showDialogue()
        this.setSpeaker(dialogue.speakerName, dialogue.speakerTitle)   
        this.setInteractor(dialogue.interactorName, dialogue.interactorTitle)
        this.setText(dialogue.textHTML)
        this.setAnswers(dialogue.answers)
    }
}

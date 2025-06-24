import {
    App,
    Modal,
    Instruction,
} from "obsidian";

export class PromptModal extends Modal {
    private resolve: (value: string) => void;
    private reject: () => void;
    private submitted = false;

    inputEl: HTMLInputElement;
    inputListener: EventListener;

    constructor(
        app: App,
        private placeholder: string,
        private promptClass: string,
        private escapeSymbol: string,
        private instructions: Instruction[]
    ) {
        super(app);

        // Create input
        this.inputEl = document.createElement('input');
        this.inputEl.type = 'text';
        this.inputEl.placeholder = placeholder;
        this.inputEl.className = 'prompt-input';

        this.modalEl.className = `prompt ${this.promptClass}`;
        this.modalEl.innerHTML = '';
        this.modalEl.appendChild(this.inputEl);

        if(instructions.length) {
            // Suggestions block
            const instructionsHeadingEl = document.createElement('div');
            instructionsHeadingEl.className = 'prompt-instructions prompt-instructions-heading';
            instructionsHeadingEl.innerText = "Prefixed folders:";

            const instructionsFooterEl = document.createElement('div');
            instructionsFooterEl.className = 'prompt-instructions';
            instructionsFooterEl.innerHTML = `Use <code>${this.escapeSymbol}</code> to escape the prefix.`;

            const instructionsListEl = document.createElement('div');
            instructionsListEl.addClass('prompt-instructions');
            const children = instructions.map((instruction) => {
                const child = document.createElement('div');
                child.addClass('prompt-instruction');

                const command = document.createElement('span');
                command.addClass('prompt-instruction-command');
                command.innerText = instruction.command;
                child.appendChild(command);

                const purpose = document.createElement('span');
                purpose.innerText = instruction.purpose;
                child.appendChild(purpose);

                return child;
            });
            for (const child of children) {
                instructionsListEl.appendChild(child);
            }
            this.modalEl.appendChild(instructionsHeadingEl);
            this.modalEl.appendChild(instructionsListEl);
            this.modalEl.appendChild(instructionsFooterEl);
        }

        this.inputListener = this.listenInput.bind(this);
    }

    listenInput(evt: KeyboardEvent) {
        if (evt.key === 'Enter') {
            // prevent enter after note creation
            evt.preventDefault();
            this.enterCallback(evt);
        }
    }

    onOpen(): void {
        this.inputEl.focus();
        this.inputEl.addEventListener('keydown', this.inputListener);
    }

    onClose(): void {
        this.inputEl.removeEventListener('keydown', this.inputListener);
        this.contentEl.empty();
        if (!this.submitted) {
            // TOFIX: for some reason throwing Error on iOS causes the app to freeze.
            this.reject();
        }
    }

    private enterCallback(evt: KeyboardEvent) {
        if (evt.key === "Enter") {
            this.resolveAndClose(evt);
        }
    }

    private resolveAndClose(evt: Event | KeyboardEvent) {
        this.submitted = true;
        evt.preventDefault();
        this.resolve(this.inputEl.value);
        this.close();
    }

    async openAndGetValue(
        resolve: (value: string) => void,
        reject: () => void
    ): Promise<void> {
        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }
}
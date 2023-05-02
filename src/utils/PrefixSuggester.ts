// Credits go to SilentVoid13's Templater Plugin: https://github.com/SilentVoid13/Templater

import {
  ButtonComponent,
  Modal,
  Platform,
  TextAreaComponent,
  TextComponent,
  Instruction,
} from "obsidian";
import { FuzzyMatch, FuzzySuggestModal } from "obsidian";

export interface PrefixFolderTuple {
  prefix: string;
  filenamePrefix: string;
  folder: string;
  addCommand: boolean;
}

export class PrefixModal extends FuzzySuggestModal<PrefixFolderTuple> {
  private resolve: (value: T) => void;
  private reject: () => void;
  private submitted = false;
  suggestionEmpty: HTMLDivElement;
  noSuggestion: boolean;


  // inputEl: HTMLInputElement;
  // instructionsEl: HTMLElement;
  // inputListener: EventListener;


  constructor(
      private text_items: string[] | ((item: T) => string),
      private items: T[],
      placeholder: string,
      limit?: number
  ) {
      super(app);
      this.setPlaceholder(placeholder);
      limit && (this.limit = limit);
      // create input
      // this.inputEl = document.createElement('input');
      // this.inputEl.type = 'text';
      // this.inputEl.placeholder = 'New note';
      // this.inputEl.className = 'prompt-input';
      // this.instructionsEl = document.createElement('div');
      // this.instructionsEl.addClass('prompt-instructions');
      // this.instructionsEl.innerText = "prefixes to save the note in specific folders.";
      // this.modalEl.className = 'prompt';
      // this.modalEl.innerHTML = '';
      // this.modalEl.appendChild(this.inputEl);
      // this.modalEl.appendChild(this.instructionsEl);

      // this.inputListener = this.listenInput.bind(this);
  }

  renderSuggestion(match: FuzzyMatch<PrefixFolderTuple>, el: HTMLElement) {

      const suggestion = `${match.item.prefix}: ${match.item.folder}`
      el.setText(suggestion);
  }

  onNoSuggestion() {
      // this.emptyStateText = "AAA";
      this.noSuggestion = true;
      // this.newDirectoryPath = this.inputEl.value;
      this.resultContainerEl.innerHTML = '';
      // this.resultContainerEl.childNodes.forEach((c) =>

      //     c.parentNode.removeChild(c)
      // );
      // this.chooseFolder.innerText = this.inputEl.value;
      // this.resultContainerEl.appendChild(this.chooseFolder);
      this.suggestionEmpty = document.createElement('div');
      this.suggestionEmpty.addClass('suggestion-empty');
      this.suggestionEmpty.innerText = "EMPTY_TEXT";
      this.resultContainerEl.appendChild(this.suggestionEmpty);
  }

  // listenInput(evt: KeyboardEvent) {
  //     if (evt.key === 'Enter') {
  //         // prevent enter after note creation
  //         evt.preventDefault();
  //         this.enterCallback(evt);
  //     }
  // }

  // onOpen(): void {
  //     this.inputEl.focus();
  //     this.inputEl.addEventListener('keydown', this.inputListener);
  // }

  // onClose(): void {
  //     this.inputEl.removeEventListener('keydown', this.inputListener);
  //     this.contentEl.empty();
  //     if (!this.submitted) {
  //         // TOFIX: for some reason throwing Error on iOS causes the app to freeze.
  //         this.reject();
  //     }
  // }

  // private enterCallback(evt: KeyboardEvent) {
  //     if (evt.key === "Enter") {
  //         this.resolveAndClose(evt);
  //     }
  // }

  // private resolveAndClose(evt: Event | KeyboardEvent) {
  //     this.submitted = true;
  //     evt.preventDefault();
  //     this.resolve(this.inputEl.value);
  //     this.close();
  // }
  getItems(): T[] {
      return this.items;
  }

  onClose(): void {
      if (!this.submitted) {
          this.reject();
      }
  }

  // renderSuggestion() {

  // }

  onChooseSuggestion(item: any, evt: any) {
      console.log(item)
  }

  selectSuggestion(
      value: FuzzyMatch<T>,
      evt: MouseEvent | KeyboardEvent
  ): void {
      // this.submitted = true;
      // this.close();
      console.log(value.item, typeof value.item)
      if(typeof value.item === "string") {
          this.inputEl.value = value.item + " ";
      }

      this.onChooseSuggestion(value, evt);
  }

  // getItemValue(item: T): string {
  //     return item.item;
  //     if (this.text_items instanceof Function) {
  //         return this.text_items(item);
  //     }
  //     return (
  //         this.text_items[this.items.indexOf(item)] || "Undefined Text Item"
  //     );
  // }

  getItemText(item: T): string {
      // console.log("item", item)
      if (this.text_items instanceof Function) {
          return this.text_items(item);
      }
      // return item;
      return (
          this.text_items[this.items.indexOf(item)] || "Undefined Text Item"
      );
  }

  onChooseItem(item: T): void {
      console.log(item)
      // this.resolve(item);
  }

  async openAndGetValue(
      resolve: (value: T) => void,
      reject: () => void
  ): Promise<void> {
      this.resolve = resolve;
      this.reject = reject;
      this.open();
  }

}

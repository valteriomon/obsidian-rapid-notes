import {
    App,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    TFolder,
    Vault
} from 'obsidian';
import { FolderSuggest } from 'src/FolderSuggester';
import { PromptModal } from 'src/PromptModal';
import { SuggesterModal } from 'src/SuggesterModal';
import { arraymove } from 'src/Utils';

// Remember to rename these classes and interfaces!

export interface PrefixFolderTuple {
    prefix: string;
    folder: string;
}

export interface FoldersByPath {
    [path: string]: TFolder;
}

export interface FoldersByPrefix {
    [prefix: string]: string;
}

export interface RapidNotesSettings {
    prefixedFolders: Array<PrefixFolderTuple>;
}

const DEFAULT_SETTINGS = {
    prefixedFolders: [{ folder: "", prefix: "" }]
};

export default class RapidNotes extends Plugin {
    settings: RapidNotesSettings;

    async onload() {
        console.log("Loading Rapid Notes plugin");
        await this.loadSettings();

        this.addCommand({
            id: "new-prefixed-note",
            name: "New note",
            callback: async () => {
                try {
                    const prompt = new PromptModal("New note", "", false);
                    const originalNoteName: string = await new Promise((resolve, reject) => prompt.openAndGetValue(resolve, reject));
                    
                    if(originalNoteName) {
                      let saveTo: string = "", noteName;
                      const folders = this.getFoldersByPath();
      
                      const prefixedFolders = this.getFoldersByPrefix(this.settings.prefixedFolders);
                      if (/^\/[^\s]/.test(originalNoteName)) {
                        noteName = originalNoteName.substring(1);
                      } else {
                        let [prefix, noteNameNoPrefix] = originalNoteName.split(/(?<=^[\S]+)\s+/);
      
                        if (!(prefix in prefixedFolders) || !noteNameNoPrefix) {
                          // No prefix or single word name
                          noteName = originalNoteName;
                        } else {
                          noteName = noteNameNoPrefix;
                          saveTo = prefixedFolders[prefix];
                        }
                      }
      
                      if (!saveTo) {
                          const folderPaths = Object.keys(folders);
                          const suggester = new SuggesterModal(folderPaths, folderPaths, "");
                          saveTo = await new Promise((resolve, reject) => suggester.openAndGetValue(resolve, reject));
                          console.log(saveTo);
                      }
      
                      const newNote = await app.fileManager.createNewMarkdownFile(folders[saveTo], noteName.trim());
                      app.workspace.getLeaf(false).openFile(newNote, {
                        state: { mode: "source" }
                      });
      
                    }
                  } catch (error) {
                    
                  }
            }
        });

        this.addSettingTab(new RapidNotesSettingsTab(this.app, this));
    }

    onunload() {
        console.log("Unloading Rapid Notes plugin");
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    getFoldersByPrefix(foldersArray: PrefixFolderTuple[]): FoldersByPrefix {
        return foldersArray.reduce((acc: FoldersByPrefix, tuple: PrefixFolderTuple) => ({...acc, [tuple.prefix]: tuple.folder}), {});
    }
    
    getFoldersByPath(): FoldersByPath {
        return this.getFolders().reduce((acc: FoldersByPath, value: TFolder) => ({ ...acc, [value.path]: value}), {});
    }

    getFolders(): TFolder[] {
        let folders: Set<TFolder> = new Set();
        Vault.recurseChildren(app.vault.getRoot(), (file) => {
            if (file instanceof TFolder) {
                folders.add(file);
            }
        });
        return Array.from(folders);
    }
}

class RapidNotesSettingsTab extends PluginSettingTab {
    plugin: RapidNotes;

    constructor(app: App, plugin: RapidNotes) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'Rapid Notes Settings'});

        new Setting(this.containerEl)
            .setName("Add new prefixes and assign them to folders.")
            .addButton((button) => {
                button
                .setTooltip("Add additional prefix")
                .setButtonText("+")
                .setCta()
                .onClick(() => {
                    this.plugin.settings.prefixedFolders.push({
                        folder: "",
                        prefix: ""
                    });
                    this.plugin.saveSettings();
                    this.display();
                });
            });

        this.plugin.settings.prefixedFolders.forEach((prefixedFolder, index) => {
            const s = new Setting(this.containerEl)
                .addSearch((cb) => {
                    cb
                    .setPlaceholder("Prefix")
                    .setValue(prefixedFolder.prefix).onChange((new_prefix) => {
                        if (
                            new_prefix &&
                            this.plugin.settings.prefixedFolders.some(
                                (e) => e.prefix == new_prefix
                            )) {
                            new Notice("Prefix already used!");
                            return;
                        }
                        this.plugin.settings.prefixedFolders[index].prefix = new_prefix;
                        this.plugin.saveSettings();
                    });
                })
                .addSearch((cb) => {
                    new FolderSuggest(cb.inputEl);
                    cb
                    .setPlaceholder("Folder")
                    .setValue(prefixedFolder.folder)
                    .onChange((new_folder) => {
                        if (
                            new_folder &&
                            this.plugin.settings.prefixedFolders.some(
                                (e) => e.folder == new_folder
                            )) {
                                new Notice("This folder already has a prefix associated with it.");
                                return;
                            }
                            this.plugin.settings.prefixedFolders[index].folder = new_folder;
                            this.plugin.saveSettings();
                    });
                    cb.containerEl.addClass("rapid-notes_search");
                })
                .addExtraButton((cb) => {
                    cb
                    .setIcon("up-chevron-glyph")
                    .setTooltip("Move up")
                    .onClick(() => {
                        arraymove(this.plugin.settings.prefixedFolders, index, index - 1);
                        this.plugin.saveSettings();
                        this.display();
                    });
                })
                .addExtraButton((cb) => {
                    cb.setIcon("down-chevron-glyph").setTooltip("Move down").onClick(() => {
                        arraymove(this.plugin.settings.prefixedFolders, index, index + 1);
                        this.plugin.saveSettings();
                        this.display();
                    });
                })
                .addExtraButton((cb) => {
                    cb.setIcon("cross").setTooltip("Delete").onClick(() => {
                        this.plugin.settings.prefixedFolders.splice(index, 1);
                        this.plugin.saveSettings();
                        this.display();
                    });
                });
                s.infoEl.remove();
        });
    }
}

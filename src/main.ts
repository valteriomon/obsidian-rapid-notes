import {
    App,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    TFile,
    TFolder,
    Vault,
    normalizePath
} from 'obsidian';
import { FolderSuggest } from './utils/FolderSuggester';
import { PromptModal } from './utils/PromptModal';
import { SuggesterModal } from './utils/SuggesterModal';
import { arraymove } from './utils/Utils';

export enum NotePlacement {
    sameTab,
    newTab = "tab",
    newPane = "split",
    newWindow = "window"
}
export interface PrefixFolderTuple {
    prefix: string;
    filenamePrefix: string;
    folder: string;
    addCommand: boolean;
}

export interface FoldersByPath {
    [path: string]: TFolder;
}

export interface FoldersByPrefix {
    [prefix: string]: PrefixFolderTuple;
}

export interface RapidNotesSettings {
    prefixedFolders: Array<PrefixFolderTuple>;
    forceFileCreation: boolean;
    escapeSymbol: string;
}

const DEFAULT_SETTINGS = {
    prefixedFolders: [{ folder: "", prefix: "" }]
};

export default class RapidNotes extends Plugin {
    settings: RapidNotesSettings;

    async onload() {
        console.log(`Loading ${this.manifest.name} plugin`);
        await this.loadSettings();

        this.addCommands(this);

        this.app.vault.on("rename", (file, oldPath) => {
            const oldItemIndex = this.settings.prefixedFolders.findIndex(prefixedFolder => prefixedFolder.folder === oldPath);
            if (oldItemIndex >= 0) {
                new Notice(`Rapid notes: ${oldPath} was being used as a prefixed folder, path was updated.`);
                this.settings.prefixedFolders[oldItemIndex].folder = file.path;
                if(this.settings.prefixedFolders[oldItemIndex].addCommand) {
                    new Notice(`Rapid notes: Custom command needs an Obsidian relaunch to work properly.`);
                }
                this.saveSettings();
            };
        });

        this.app.vault.on("delete", file => {
            const oldItemIndex = this.settings.prefixedFolders.findIndex(prefixedFolder => prefixedFolder.folder === file.path);
            if (oldItemIndex >= 0) {
                new Notice(`Rapid notes: ${file.path} was being used as a prefixed folder. The entry will no longer work, remove or update manually.`);
                if(this.settings.prefixedFolders[oldItemIndex].addCommand) {
                    this.settings.prefixedFolders[oldItemIndex].addCommand = false;
                    new Notice(`Rapid notes: Custom command will be removed after Obsidian relaunches.`);
                }
                this.saveSettings();
            };
        });

        this.addSettingTab(new RapidNotesSettingsTab(this.app, this));
    }

    onunload() {
        console.log(`Unloading ${this.manifest.name} plugin`);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    addCommands(plugin: RapidNotes) {

        plugin.addCommand({
            id: "new-prefixed-note",
            name: "New note in current tab",
            callback: async () => {
                const promptValue = await this.promptNewNote();
                if(promptValue) {
                    const { folderPath, filename } = await this.parseNoteName(promptValue);
                    this.openNote(folderPath, filename, NotePlacement.sameTab);
                }
            }
        });

        plugin.addCommand({
            id: "new-prefixed-note-new-tab",
            name: "New note in new tab",
            callback: async () => {
                const promptValue = await this.promptNewNote();
                if(promptValue) {
                    const { folderPath, filename } = await this.parseNoteName(promptValue);
                    this.openNote(folderPath, filename, NotePlacement.newTab);
                }
            }
        });

        plugin.addCommand({
            id: "new-prefixed-note-new-pane",
            name: "New note in new pane",
            callback: async () => {
                const promptValue = await this.promptNewNote();
                if(promptValue) {
                    const { folderPath, filename } = await this.parseNoteName(promptValue);
                    this.openNote(folderPath, filename, NotePlacement.newPane);
                }
            }
        });

        plugin.addCommand({
            id: "new-prefixed-note-new-window",
            name: "New note in new window",
            callback: async () => {
                const promptValue = await this.promptNewNote();
                if(promptValue) {
                    const { folderPath, filename } = await this.parseNoteName(promptValue);
                    this.openNote(folderPath, filename, NotePlacement.newWindow);
                }
            }
        });

        plugin.settings.prefixedFolders.forEach((prefixedFolder) => {
            if(prefixedFolder.addCommand){
                plugin.addCommand({
                    id: "new-note-in-" + prefixedFolder.folder,
                    name: "Create new note in " + prefixedFolder.folder,
                    callback: async () => {
                        const promptValue = await this.promptNewNote();
                        this.openNote(prefixedFolder.folder, promptValue, NotePlacement.sameTab);
                    }
                });
                plugin.addCommand({
                    id: "new-note-in-" + prefixedFolder.folder + "-new-tab",
                    name: "Create new note in " + prefixedFolder.folder + " and open in new tab",
                    callback: async () => {
                        const promptValue = await this.promptNewNote();
                        this.openNote(prefixedFolder.folder, promptValue, NotePlacement.newTab);
                    }
                });
                plugin.addCommand({
                    id: "new-note-in-" + prefixedFolder.folder + "-new-pane",
                    name: "Create new note in " + prefixedFolder.folder + " and open in new pane",
                    callback: async () => {
                        const promptValue = await this.promptNewNote();
                        this.openNote(prefixedFolder.folder, promptValue, NotePlacement.newPane);
                    }
                });
                plugin.addCommand({
                    id: "new-note-in-" + prefixedFolder.folder + "-new-window",
                    name: "Create new note in " + prefixedFolder.folder + " and open in new window",
                    callback: async () => {
                        const promptValue = await this.promptNewNote();
                        this.openNote(prefixedFolder.folder, promptValue, NotePlacement.newWindow);
                    }
                });
            }
        });
    }

    async promptNewNote() {
        const prompt = new PromptModal("New note", "", false);
        let promptValue: string = await new Promise((resolve) => prompt.openAndGetValue((resolve), ()=>{}));
        return promptValue.trim();
    }

    async parseNoteName(filename: string) {
        const prefixedFolders = this.getFoldersByPrefix(this.settings.prefixedFolders);
        let folderPath = "";
        const escapeSymbol = this.settings.escapeSymbol || "/";
        if (filename.charAt(0) === escapeSymbol) {
            // Prompt value is escaped, no prefix check needed
            filename = filename.substring(1);
        } else {
            const firstSpaceIndex = filename.indexOf(" ");
            if (firstSpaceIndex >= 0) {
                // Prompt value has a space
                const prefix = filename.substring(0, firstSpaceIndex);
                if (prefix in prefixedFolders) {
                    // Prefix match found
                    folderPath = prefixedFolders[prefix].folder;
                    filename = filename.substring(firstSpaceIndex + 1);

                    // Check if a prefix needs to be added to the note, and add it correctly if the value is a path
                    const filenamePrefix = prefixedFolders[prefix].filenamePrefix.trim();
                    if(filenamePrefix) {
                        const lastSlashIndex = filename.lastIndexOf("/");
                        if (lastSlashIndex >= 0) {
                            filename = filename.slice(0, lastSlashIndex + 1) + filenamePrefix + " " + filename.slice(lastSlashIndex + 1);
                        } else {
                            filename = filenamePrefix + " " + filename;
                        }
                    }
                }
            }
        }
        if (!folderPath) {
            let folders:TFolder[] = this.getFolders();
            const activeFile:TFile|null = app.workspace.getActiveFile();
            const preferredFolder:TFolder = app.fileManager.getNewFileParent(activeFile?.path || "");

            folders = folders.filter((folder) => folder.path !== preferredFolder.path);
            folders.unshift(preferredFolder);
            const folderPaths = folders.map((folder) => folder.path);
            const suggester = new SuggesterModal(folderPaths, folderPaths, "Choose folder");
            folderPath = await new Promise((resolve) => suggester.openAndGetValue(resolve, ()=>{}));
        }

        return {
            folderPath: folderPath,
            filename: filename
        }
    }

    async openNote(path: string, filename: string, placement: NotePlacement) {
        const folder:TFolder = this.getFolders().find(folder => folder.path === path) || app.vault.getRoot();
        const fullFilePath = normalizePath(path + "/" + filename + ".md");

        let file = app.vault.getAbstractFileByPath(fullFilePath) as TFile;
        if (file instanceof TFolder) {
            new Notice(`${fullFilePath} found but it's a folder`);
            return;
        } else if(file === null || this.settings.forceFileCreation) {
            // Create note if it doesn't exist
            file = await app.fileManager.createNewMarkdownFile(folder, filename);
        }
        app.workspace.getLeaf(placement || false).openFile(file, {
            state: { mode: "source" }
        });
    }

    getFoldersByPrefix(foldersArray: PrefixFolderTuple[]): FoldersByPrefix {
        return foldersArray.reduce((acc: FoldersByPrefix, tuple: PrefixFolderTuple) => ({...acc, [tuple.prefix]: tuple}), {});
    }

    getFolders(): TFolder[] {
        const folders: Set<TFolder> = new Set();
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
        containerEl.createEl('h2', {text: 'Rapid Notes settings'});

        new Setting(this.containerEl)
        .setName("Force file creation adding a number at the end if the folder/filename is already in use. Default behavior will open the existing file.")
        .addToggle((toggle) => {
            toggle
            .setValue(this.plugin.settings.forceFileCreation)
            .onChange((forceFileCreation) => {
                this.plugin.settings.forceFileCreation = forceFileCreation;
                this.plugin.saveSettings();
                this.display();
            });
        });

        new Setting(this.containerEl)
        .setName("Escape symbol to avoid checking the prefix and moving the note.")
        .addText((cb) => {
            cb
            .setPlaceholder("/")
            .setValue(this.plugin.settings.escapeSymbol)
            .onChange((escapeSymbol) => {
                this.plugin.settings.escapeSymbol = escapeSymbol;
                this.plugin.saveSettings();
                this.display();
            });
        });

        new Setting(this.containerEl)
        .setName("Add new prefixes (single words, case sensitive) or shortcuts and assign them to folders.")
        .setDesc("Toggle available for adding a command to save directly into the folder. Relaunch the Obsidian or disable/enable the plugin for changes to take effect, either adding or removing a command,")
        .addButton((button) => {
            button
            .setTooltip("Add additional prefix")
            .setButtonText("+")
            .setCta()
            .onClick(() => {
                this.plugin.settings.prefixedFolders.push({
                    folder: "",
                    prefix: "",
                    filenamePrefix: "",
                    addCommand: false
                });
                this.plugin.saveSettings();
                this.display();
            });
        });

        this.plugin.settings.prefixedFolders.forEach((prefixedFolder, index) => {
            const s = new Setting(this.containerEl)
            .addText((cb) => {
                cb
                .setPlaceholder("Prefix")
                .setValue(prefixedFolder.prefix)
                .onChange((newPrefix) => {
                    if (newPrefix && this.plugin.settings.prefixedFolders.some((e) => e.prefix == newPrefix)) {
                        new Notice("Prefix already used!");
                        return;
                    }

                    if(newPrefix && /\s/.test(newPrefix)) {
                        new Notice("Prefixes can't contain spaces!");
                        return;
                    }
                    this.plugin.settings.prefixedFolders[index].prefix = newPrefix;
                    this.plugin.saveSettings();
                });
            })
            .addText((cb) => {
                cb
                .setPlaceholder("Optional note prefix")
                .setValue(prefixedFolder.filenamePrefix).onChange((newNotePrefix) => {
                    this.plugin.settings.prefixedFolders[index].filenamePrefix = newNotePrefix.trim();
                    this.plugin.saveSettings();
                });
            })
            .addSearch((cb) => {
                new FolderSuggest(cb.inputEl);
                cb
                .setPlaceholder("Folder")
                .setValue(prefixedFolder.folder)
                .onChange((newFolder) => {
                    if (newFolder && this.plugin.settings.prefixedFolders.some((e) => e.folder == newFolder)) {
                        new Notice("This folder already has a prefix associated with it.");
                        return;
                    }
                    this.plugin.settings.prefixedFolders[index].folder = newFolder;
                    this.plugin.saveSettings();
                });
                cb.containerEl.addClass("rapid-notes_search");
            })
            .addToggle((toggle) => {
                toggle
                .setValue(this.plugin.settings.prefixedFolders[index].addCommand)
                .onChange((addCommand) => {
                    this.plugin.settings.prefixedFolders[index].addCommand = addCommand;
                    this.plugin.saveSettings();
                    this.display();
                });
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

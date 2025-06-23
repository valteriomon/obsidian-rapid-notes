declare module "obsidian" {
    interface App {
        dom: {
            appContainerEl: HTMLElement;
        }        
    }

    interface SearchComponent {
        containerEl: HTMLElement;        
    }

    interface FileManager {
        createNewMarkdownFile: (
            folder: TFolder | undefined,
            filename: string
        ) => Promise<TFile>;
    }

    interface Vault {
        createFolder(path: string): Promise<TFolder>;
        getFolderByPath(path: string): TFolder | null;
    }
}

export {};
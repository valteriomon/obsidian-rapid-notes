# Rapid Notes Plugin

Place notes in specific folders at the moment of creation using the prefixes defined in settings. Optionally add custom prefixes to the filenames and trigger the creation in specific folders with shortcuts or from the editor while typing links.

## New in version 1.2.0

- **New feature:** You can add an actual prefix to the newly created note.
- **New feature:** You can trigger the rapid note functionality from the editor, calling the command with the cursor placed inside a string in double brackets, or on any selected text. Support for aliases and link is replaced according to the app settings (if Wikilinks or Markdown is preferred).
- **New feature:** Instead of a single "Rapid Note" command, now you can open the file in the same tab, new tab, background tab, new pane or new window.
- **New feature:** Add commands (which can be binded to hotkeys) that allow to trigger any entry and create the file directly into a folder (same as the Rapid Note command, it can be opened in same tab, new tab, background tab, new pane or new window).
- **New feature:** If a used folder is renamed/deleted, a warning is shown. In case it's renamed, the entry is updated.
- **New feature:** In folder suggester, show first the preferred saving location according to the Obsidian settings: Vault folder, the specified location, or same folder as current file.
- **New setting:** If a new file trying to be created already exists, you can choose to open the existent file or create a new one with the same name followed by a number.
- **New setting:** Customize the escape symbol ("/" by default)
- **Discovered feature** *(because I didn't know it was a thing in Obsidian)* **:** If the filename contains "/" the full path is created: previously non existent folders and file.
- **Bug fixes** *(and probably some new bugs introduced)* **:** Code improvements suggested by Obsidian Community reviewer, and removed lookbehind in regular expressions which could lead to issues in some iOS versions. Tested in iOS 16.4.1.

## How to use

In the plugin settings add prefix/folder pairs, considering prefixes must be single words and are case sensitive. Each prefix and folder can be used a single time. When you run the `Rapid Notes: New note` command (which can be binded to a new hotkey or replace the default "Create New Note" hotkey) if you input the prefix previously set, it's going used to create a new note using the input value without the prefix as name. If no prefix matches, a folder suggest is open. If your input begins with a slash `/` then the prefix will be ignored and you will always be prompted with a folder suggester.

## Example of basic usage

If you have a folder named `JavaScript` in your vault where you save all notes regarding JavaScript, you could add in the Rapid Notes settings the prefix `js` and assign it to said folder. Upon triggering the command to create a new note, you could enter into the prompt `js Promises` and a new file named `Promises` will be saved into the `JavaScript` folder.

![Example of basic usage](./assets/basic-usage.gif)

## Example of escaped prefix

If you have your `js` prefix set, but you wish to create a new file named `js rulez`, then you can simply input `/js rulez` into the prompt and you will be prompted to select where to create the new file.

![Example of basic usage](./assets/escape-filenames.gif)

## Considerations

- You can combine Rapid Notes with [Templater plugin](https://github.com/SilentVoid13/Templater) to speed up your workflow even further, assigning templates for folders and enabling the setting to trigger Templater on file creation.
- I considered creating a special prefix for adding quick notes into an Inbox folder (or vault root) without being prompted with the folder suggester, but for now I'm just using the default new note functionatlity and setting the inbox folder as the "Default location for new notes".

## Manually installing the plugin

1. Download the `main.js`, `styles.css`, `manifest.json` from the release.
2. Create a folder named `obsidian-rapid-notes` inside your vault's plugins folder (`VaultFolder/.obsidian/plugins/`).
3. Add the downloaded files to the `obsidian-rapid-notes` folder.
4. Enable plugin in settings window.

## Development

1. Clone this repo and place it in a new vault for development inside `.obsidian/plugins/` folder.
2. Install NodeJS, then run `npm i` in the command line under the repo folder.
3. Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
4. Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
5. Reload Obsidian to load the new version of your plugin ("Reload app without saving" in the command palette for refreshing).
6. Enable plugin in settings window.

## Credits

This plugin is a fork of [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) and the modules used for prompts and suggesters are based on [Liam's Periodic Notes Plugin](https://github.com/liamcain/obsidian-periodic-notes) and [SilentVoid13's Templater Plugin](https://github.com/SilentVoid13/Templater). All the credits go to the original authors.
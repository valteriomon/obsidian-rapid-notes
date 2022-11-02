# Rapid Notes Plugin

Place notes in specific folders at the moment of creation using the prefixes defined in settings. Prefixes are single words and case sensitive.

## Settings

Just a list of prefix/folder pairs. Each prefix and folder can be used a single time.

## Command

The plugin has a single command for creating a new note which can be binded to a new hotkey or replace the default "Create New Note" hotkey.

## How to use

If you have a folder named `JavaScript` in your vault where you save all notes regarding JavaScript, you could add in the Rapid Notes settings the prefix `js` and assign it to said folder. Upon triggering the command to create a new note, you could enter into the prompt `js Promises` and a new file named `Promises` will be saved into the `JavaScript` folder.

## Considerations

- You can combine Rapid Notes with [Templater plugin](https://github.com/SilentVoid13/Templater) to speed up your workflow even further, assigning templates for folders and enabling the setting to trigger Templater on file creation.
- I considered creating a special prefix for adding quick notes into an Inbox folder (or vault root) without being prompted with the folder suggester, but for now I'm just using the default new note functionatlity and setting the inbox folder as the "Default location for new notes".
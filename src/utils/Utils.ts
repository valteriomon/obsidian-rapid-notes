// Credits go to SilentVoid13's Templater Plugin: https://github.com/SilentVoid13/Templater

export function arraymove<T>(
    arr: T[],
    fromIndex: number,
    toIndex: number
): void {
    if (toIndex < 0 || toIndex === arr.length) {
        return;
    }
    const element = arr[fromIndex];
    arr[fromIndex] = arr[toIndex];
    arr[toIndex] = element;
}
// Credits go to SilentVoid13's Templater Plugin: https://github.com/SilentVoid13/Templater

export class RapidNotesError extends Error {
    constructor(msg: string, public console_msg?: string) {
        super(msg);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export async function errorWrapper<T>(
    fn: () => Promise<T>,
    msg: string
): Promise<T> {
    try {
        return await fn();
    } catch (e) {
        if (!(e instanceof RapidNotesError)) {
            new RapidNotesError(msg, e.message);
        } else {
            // log_error(e);
        }
        return null as T;
    }
}

export function errorWrapperSync<T>(fn: () => T, msg: string): T {
    try {
        return fn();
    } catch (e) {
        new RapidNotesError(msg, e.message);
        return null as T;
    }
}

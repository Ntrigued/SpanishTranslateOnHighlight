const DEVELOPMENT_MODE = true;

export const clear = () => DEVELOPMENT_MODE && console.clear();
export const debug = (...args) => DEVELOPMENT_MODE && console.debug(...args);
export const info = (...args) => DEVELOPMENT_MODE && console.info(...args);
export const log = (...args) => DEVELOPMENT_MODE && console.log(...args);
export const error = (...args) => DEVELOPMENT_MODE && console.error(...args);
export const warn = (...args) => DEVELOPMENT_MODE && console.warn(...args);

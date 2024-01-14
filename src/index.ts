import * as twgl from "twgl.js"

/**
 * example function
 * @param x cool number
 * @returns cooler number
 */
export function hello(x: number): number {
    console.log(twgl.addExtensionsToContext);
    return x * 2;
}

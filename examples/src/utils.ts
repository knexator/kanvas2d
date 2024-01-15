import { Vec2 } from "kanvas2d";
console.log("vec2: ", Vec2);

export function fromCount<T>(n: number, callback: (index: number) => T): T[] {
    let result = Array(n);
    for (let k = 0; k < n; k++) {
        result[k] = callback(k);
    }
    return result;
}

export class Rectangle {
    constructor(
        public readonly topLeft: Vec2,
        public readonly size: Vec2
    ) { }

    static readonly unit = new Rectangle(Vec2.zero, Vec2.one);
}

export class Color {
    constructor(
        public readonly r: number,
        public readonly g: number,
        public readonly b: number,
        public readonly a: number = 1.0,
    ) { }

    static readonly white = new Color(1,1,1,1);

    toArray(): [number, number, number, number] {
        return [this.r, this.g, this.b, this.a];
    }

    static fromHex(hex_str: string, alpha: number = 1): Color {
        let hex_number = Number(hex_str.replace('#', '0x'));
        return Color.fromInt(hex_number, alpha);
    }

    static fromInt(hex_number: number, alpha: number = 1): Color {
        return new Color(
            (hex_number >> 16) / 255,
            (hex_number >> 8 & 0xff) / 255,
            (hex_number & 0xff) / 255,
            alpha
        );
    }
}

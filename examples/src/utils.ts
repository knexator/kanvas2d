export class Vec2 {
    constructor(
        public readonly x: number = 0.0,
        public readonly y: number = 0.0,
    ) { }

    static readonly zero = new Vec2(0, 0);
    static readonly one = new Vec2(1, 1);
    static readonly half = new Vec2(0.5, 0.5);
    static readonly xpos = new Vec2(1, 0);
    static readonly ypos = new Vec2(0, 1);
    static readonly xneg = new Vec2(-1, 0);
    static readonly yneg = new Vec2(0, -1);

    toArray(): [number, number] {
        return [this.x, this.y];
    }

    add(other: Vec2): Vec2 {
        return new Vec2(
            this.x + other.x,
            this.y + other.y,
        );
    }

    mul(other: Vec2): Vec2 {
        return new Vec2(
            this.x * other.x,
            this.y * other.y,
        );
    }
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

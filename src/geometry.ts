export class Vec2 {
    constructor(
        public readonly x: number,
        public readonly y: number,
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

    static fromIVec2(v: IVec2): Vec2 {
        if (v instanceof Vec2) {
            return v;
        } else if (Array.isArray(v)) {
            return new Vec2(v[0], v[1]);
        } else {
            return new Vec2(v.x, v.y);
        }
    }

    add(other: Vec2): Vec2 {
        return new Vec2(
            this.x + other.x,
            this.y + other.y,
        );
    }

    sub(other: Vec2): Vec2 {
        return new Vec2(
            this.x - other.x,
            this.y - other.y,
        );
    }

    mul(other: Vec2): Vec2 {
        return new Vec2(
            this.x * other.x,
            this.y * other.y,
        );
    }

    scale(s: number): Vec2 {
        return new Vec2(
            this.x * s,
            this.y * s,
        );
    }

    rotate(radians: number): Vec2 {
        let c = Math.cos(radians);
        let s = Math.sin(radians);
        return new Vec2(
            this.x * c - this.y * s,
            this.x * s + this.y * c
        );
    }
}


export class Transform {
    constructor(
        /** Absolute position of the pivot */
        public position: Vec2,
        /** Extent of the Asdfasdf */
        public size: Vec2,
        /** Both components in [0,1] range */
        public pivot: Vec2,
        /** Rotation in radians */
        public rotation: number,
    ) { }

    static identity = new Transform(Vec2.zero, Vec2.one, Vec2.zero, 0);

    static fromIRect(rect: IRect | Transform): Transform {
        if (rect instanceof Transform) {
            return rect;
        } else {
            return new Transform(
                Vec2.fromIVec2(rect.top_left),
                Vec2.fromIVec2(rect.size),
                Vec2.zero,
                0,
            );
        }
    }
    // public get top_left() : Vec2 {
    //     // return 
    // }

    globalFromLocal(uv: IVec2): Vec2 {
        // intuition:
        // if the given position is exactly the pivot, 
        //  then the result is just 'position'
        // if the given position is pivot + (.1,0),
        //  then the result is position + (.1,0) * size
        // if the given position is pivot + (.1,0),
        //  then the result is position + rotation @ (.1,0) * size
        if (this.rotation === 0) {
            return this.position.add(
                Vec2.fromIVec2(uv).sub(this.pivot).mul(this.size));
        } else {
            let delta = Vec2.fromIVec2(uv).sub(this.pivot);
            return this.position.add(delta.mul(this.size).rotate(this.rotation));
        }
    }
}

export type IVec2 = Vec2 | { x: number, y: number } | [number, number];
export type IRect = { top_left: IVec2, size: IVec2 };

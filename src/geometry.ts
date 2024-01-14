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


class Asdfasdf {
    constructor(
        /** Absolute position of the pivot */
        public position: Vec2;
        /** Extent of the Asdfasdf */
        public size: Vec2;
        /** Both components in [0,1] range */
        public pivot: Vec2;
        /** Rotation in radians */
        public rotation: number;
    ) {} 


}

type IVec2 = {x: number, y: number} | [number, number];
type IRectangle = {top_left: IVec2, size: IVec2};

// export interface IRectangle = { 
//     constructor(
//         public readonly topLeft: Vec2,
//         public readonly size: Vec2
//     ) { }

//     static readonly unit = new Rectangle(Vec2.zero, Vec2.one);
// }

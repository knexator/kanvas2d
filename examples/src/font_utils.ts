import { Vec2 } from "kanvas2d";
import { Color, Rectangle } from "./utils";

type CharData = {
    // after drawing this char, how many pixels should the cursor move forward, assuming a font size of 1
    advance: number,
    // how much in pixels to offset the cursor for drawing, assuming a font size of 1
    offset: Vec2,
    // how many pixels the quad takes on screen, assuming a font size of 1
    screen_size: Vec2,
    // uvs for extracting this char from the atlas
    uvs: Rectangle,
}

export type Font = {
    // char to use when the requested char isn't found
    default_char: string,
    char_data: Map<string, CharData>,
    // assuming a font size of 1; key is both chars
    kernings: Map<string, number>,
    // after finishing a line, how many pixels should the cursor move down, assuming a font size of 1
    line_height: number,
    // how many pixels between the absolute top of the line to the base of the characters, assuming a font size of 1
    base: number,
    atlas: WebGLTexture,
    // The signed distance's range
    distance_range: number,
}

/**
 * Example usage:
 * import font_arial_data from "./fonts/Arial.json"
 * let font_arial_atlas = twgl.createTexture(gl, { src: getUrl("./fonts/Arial.png") });
 * let font_arial = createFont(font_arial_data, font_arial_atlas);
 */
export function createFont(mainfont_data: any, atlas_image: WebGLTexture, default_char: string = "?"): Font {
    let original_size = mainfont_data.info.size;
    let charFromId = new Map<number, string>();
    let mainfont_char_data = new Map<string, CharData>(mainfont_data.chars.map((charData: any) => {
        charFromId.set(charData.id, charData.char);
        return [charData.char, <CharData>{
            id: charData.id,
            uvs: new Rectangle(
                new Vec2(
                    charData.x / mainfont_data.common.scaleW,
                    charData.y / mainfont_data.common.scaleH,
                ),
                new Vec2(
                    charData.width / mainfont_data.common.scaleW,
                    charData.height / mainfont_data.common.scaleH,
                ),
            ),
            offset: new Vec2(charData.xoffset / original_size, charData.yoffset / original_size),
            // if font size was 1, how many screen pixels it would look like on screen?
            screen_size: new Vec2(charData.width / original_size, charData.height / original_size),
            // after drawing this character, how much to move the cursor
            advance: charData.xadvance / original_size,
        }]
    }));
    if (!mainfont_char_data.has(default_char)) throw new Error(`invalid default char ${default_char}; font has ${[...mainfont_char_data.keys()].join('')}`);
    let kernings = new Map<string, number>(mainfont_data.kernings.map((kerning: { first: number, second: number, amount: number }) => {
        let char_1 = charFromId.get(kerning.first)!;
        let char_2 = charFromId.get(kerning.second)!;
        return [char_1 + char_2, kerning.amount / original_size];
    }));
    return {
        default_char: default_char,
        char_data: mainfont_char_data,
        kernings: kernings,
        line_height: mainfont_data.common.lineHeight / original_size,
        base: mainfont_data.common.base / original_size,
        atlas: atlas_image,
        distance_range: mainfont_data.distanceField.distanceRange,
    };
}

export function textLine(font: Font, text: string, font_size: number): { quad: Rectangle, uvs: Rectangle }[] {
    let default_char_data = font.char_data.get("?")!;
    let result: {
        quad: Rectangle,
        uvs: Rectangle,
    }[] = [];

    // Top left

    let cur_pos = new Vec2(0, 0);
    let prev_char: string | null = null;

    for (let char of text) {
        if (char === "\\n") {
            throw new Error("unimplemented line breaks");
            // cur_pos.x = 0;
            // cur_pos.y += font.line_height;
            // prev_char = null;
            // continue;
        }
        let char_data = font.char_data.get(char) || default_char_data;
        if (char !== " ") {
            let kerning = 0;
            if (prev_char) {
                kerning = font.kernings.get(prev_char + char) ?? 0;
            }
            result.push({
                quad: new Rectangle(
                    cur_pos.add(char_data.offset.scale(font_size)).addX(kerning * font_size),
                    char_data.screen_size.scale(font_size)
                ),
                uvs: char_data.uvs
            });
        }
        cur_pos = cur_pos.addX(char_data.advance * font_size);
        prev_char = char;
    }

    return result;
}

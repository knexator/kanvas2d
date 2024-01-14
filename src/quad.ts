import { GenericDrawer } from "./core";



function customPixelEffectDrawer(gl: WebGL2RenderingContext, fragment_shader: string, MAX_SPRITES?: number): GenericDrawer<{
    center: [number, number],
    rotation: number,
}, {
    resolution: [number, number]
}> {
    return new GenericDrawer(gl, {
        a_position: { dimension: 2 },
        a_uv: { dimension: 2 },
        a_color: { dimension: 4 },
    }, ``, fragment_shader, {
        N_TRIANGLES_PER_SPRITE: 2,
        N_VERTICES_PER_SPRITE: 4,
        triangles: [[0, 1, 2], [3, 2, 1]],
    }, ({ rotation }) => {
        return [{
            a_position: [0, rotation],
        }]
    }, ({ resolution }) => {
        return {
            u_basis: [0, 1, 2],
        }
    }, MAX_SPRITES);
}

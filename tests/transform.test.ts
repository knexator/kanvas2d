import { describe, expect, test } from '@jest/globals';
import {Transform, Vec2} from "../src/index";


describe('Transform class', () => {
    test('translation', () => {
        expect(Transform.traslation(new Vec2(10, 20)).globalFromLocal(Vec2.zero)).toEqual(new Vec2(10,20));
    });
});


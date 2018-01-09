import { generateRandomId } from "../../src/Common/RandomGenerator";

test('happy case', () => {
    const spyon = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(generateRandomId(3, 'pre')).toBe('pre_vvv');
});

test('no prefix', () => {
    const spyon = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(generateRandomId(3)).toBe('_vvv');
});
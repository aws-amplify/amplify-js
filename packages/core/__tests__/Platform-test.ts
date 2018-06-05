import Platform from '../../src/Common/Platform';

describe('Platform test', () => {
    describe('isReactNative test', () => {
        test('happy case', () => {
            expect(Platform.isReactNative).toBe(false);
        });
    });
});

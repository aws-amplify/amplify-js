(<any>global).localStorage = null;

import '../../src/Common/Polyfills';

describe('Polyfills unit test', () => {
    describe('add-get remove-get case', () => {
        test('adding and getting object', () => {
            (<any>global).localStorage.setItem('key', 'value');

            expect.assertions(2);

            const result1 = (<any>global).localStorage.getItem('key');
            expect(result1).toBe('value');

            (<any>global).localStorage.removeItem('key');
            const result2 = (<any>global).localStorage.getItem('key');
            expect(result2).toBe(null);
        });
    });
});
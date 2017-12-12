import JS from '../../src/Common/JS';

describe('JS test', () => {
    describe('isEmpty test', () => {
        test('happy case', () => {
            const obj = {a: 'a'};
            expect(JS.isEmpty(obj)).toBe(false);
        });
    });

    describe('sortByField test', () => {
        test('happy case with ascending order', () => {
            const arr = [{a: 2}, {a: 3}, {a: 1}];

            JS.sortByField(arr, 'a', null);

            expect(arr).toEqual([{a: 1}, {a: 2}, {a: 3}]);
        });

        test('happy case with descending order', () => {
            const arr = [{a: 2}, {a: 3}, {a: 1}];

            JS.sortByField(arr, 'a', 'desc');

            expect(arr).toEqual([{a: 3}, {a: 2}, {a: 1}]);
        });
    });

    describe('objectLessAttributes test', () => {
        test('happy case with string', () => {
            const obj = {a: 3, b: 2};

            expect(JS.objectLessAttributes(obj, 'a')).toEqual({b: 2});
        });

        test('happy case with array', () => {
            const obj = {a: 3, b: 2, c: 1};

            expect(JS.objectLessAttributes(obj, ['a', 'b'])).toEqual({c: 1});
        });
    });
});
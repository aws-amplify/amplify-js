import JS from '../src/JS';

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

        test('no list do nothing', () => {
            expect(JS.sortByField()).toEqual(false);
        });

        test('undefined means less', () => {
            const arr = [{a: 2}, {}, {a: 1}, {}];

            JS.sortByField(arr, 'a', 'desc');

            expect(arr).toEqual([{a: 2}, {a: 1}, {}, {}]);
        });

        test('equal no change', () => {
            const arr = [{a: 1, b: 1}, {a: 1, b: 2}];

            JS.sortByField(arr, 'a', 'desc');

            expect(arr).toEqual([{a: 1, b: 1}, {a: 1, b: 2}]);
        });
    });

    describe('objectLessAttributes test', () => {
        test('happy case with nothing', () => {
            const obj = {a: 3, b: 2};

            expect(JS.objectLessAttributes(obj)).toEqual({a: 3, b: 2});
        });

        test('happy case with string', () => {
            const obj = {a: 3, b: 2};

            expect(JS.objectLessAttributes(obj, 'a')).toEqual({b: 2});
        });

        test('happy case with array', () => {
            const obj = {a: 3, b: 2, c: 1};

            expect(JS.objectLessAttributes(obj, ['a', 'b'])).toEqual({c: 1});
        });
    });

    describe('filenameToContentType test', () => {
        test('.png file type is image/png', () => {
            expect(JS.filenameToContentType('a.png')).toEqual('image/png');
        });

        test('unknown file type is application/octet-stream', () => {
            expect(JS.filenameToContentType('a.xyz')).toEqual('application/octet-stream');
        });

        test('unknown file type is default', () => {
            expect(JS.filenameToContentType('a.xyz', '*/*')).toEqual('*/*');
        });
    });

    describe('isTextFile test', () => {
        test('application/json is text file', () => {
            expect(JS.isTextFile('application/json')).toEqual(true);
        });

        test('application/xml is text file', () => {
            expect(JS.isTextFile('application/xml')).toEqual(true);
        });

        test('application/sh is text file', () => {
            expect(JS.isTextFile('application/sh')).toEqual(true);
        });

        test('text/* is text file', () => {
            expect(JS.isTextFile('text/*')).toEqual(true);
        });
    });
});

import SessionTracker from '../../src/trackers/SessionTracker';

const tracker = jest.fn().mockImplementation(() => {
    return Promise.resolve();
});



describe('SessionTracker test', () => {
    describe('constructor test', () => {
        test('happy case', () => {
            tracker.mockClear();

            const spyon = jest.spyOn(document, 'addEventListener').mockImplementationOnce(() => {
                return;
            });

            const sessionTracker = new SessionTracker(tracker, {
                enable: true
            });

            expect(tracker).toBeCalledWith({
                name: '_session_start'
            });
            expect(spyon).toBeCalled();

            spyon.mockClear();
        });

        test('not in the supported env', () => {
            tracker.mockClear();
            let tmp = document;
            Object.defineProperty(window.document, 'hidden', {
                writable: true,
                value: undefined
            });

            const sessionTracker = new SessionTracker(tracker, {
                enable: true
            });

            expect(tracker).not.toBeCalled();
             Object.defineProperty(window.document, 'hidden', {
                writable: true,
                value: false
            });
        });
    });
});
const mockDelegate = jest.fn();
const tracker = jest.fn();

jest.mock('dom-utils', () => {
    return {
        delegate: mockDelegate
    }
});

import EventTracker from '../../src/trackers/EventTracker';

describe('EventTracer test', () => {
    describe('environment test', () => {
        test('not in the web env', () => {
            let eventListener = window.addEventListener;
            window.addEventListener = null;
            const eventTracker = new EventTracker(tracker, {
                enable: true
            });

            const spyon = jest.spyOn(eventTracker, 'configure').mockImplementationOnce(() => {
                return;
            });

            expect(spyon).not.toBeCalled();

            spyon.mockClear();
            window.addEventListener = eventListener;
        });

        test('in the web env', () => {
            const spyon = jest.spyOn(EventTracker.prototype, 'configure').mockImplementationOnce(() => {
                return;
            });

            const eventTracker = new EventTracker(tracker, {
                enable: true
            });

         

            expect(spyon).toBeCalled();

            spyon.mockClear();
        });
        
    });

    describe('configure test', () => {
        test('happy case', () => {
            const eventTracker = new EventTracker(tracker, {
                enable: true
            });

            expect(eventTracker.configure({
                enable: true,
                selectorPrefix: 'prefix',
                events: ['click', 'mouseover']
            })).toEqual({
                enable: true,
                selectorPrefix: 'prefix',
                events: ['click', 'mouseover']
            });

            expect(mockDelegate).toBeCalled();

            mockDelegate.mockClear();
        });
    });
});
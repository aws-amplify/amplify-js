const anyGlobal = global as any;

anyGlobal.navigator = anyGlobal.navigator || {};
anyGlobal.navigator.sendBeacon = anyGlobal.navigator.sendBeacon || jest.fn();

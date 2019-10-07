window.alert = msg => {
  // tslint:disable-next-line: no-console
  console.log(msg);
};

const noOp = () => ({});

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

class FakeWorker implements Worker {
  public terminate = Worker.prototype.terminate;
  public addEventListener = Worker.prototype.addEventListener;
  public removeEventListener = Worker.prototype.removeEventListener;
  public dispatchEvent = Worker.prototype.dispatchEvent;
  public onerror = Worker.prototype.onerror;
  public url: string | URL;

  constructor(stringUrl: string | URL) {
    this.url = stringUrl;
  }

  public postMessage(msg: string) {
    this.onmessage(msg);
  }

  public onmessage(_message: any) {
    // Do Nothing
  }
}

window.Worker = FakeWorker;

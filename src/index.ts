/* Based on (nprogress)[https://github.com/rstacruz/nprogress] code */

interface Options {
  minimum: number;
  speed: number;
  trickle: boolean;
  trickleSpeed: number;
}

export interface ProgressListener {
  /** @param progress 0 to 1 */
  (progress: number, context: { started: boolean; finished: boolean }): void;
}

class HeadlessNProgress {
  private settings: Options = {
    minimum: 0.08,
    speed: 200,
    trickle: true,
    trickleSpeed: 200,
  };

  private status: number | null = null;
  private listeners: ProgressListener[] = [];

  public observeChange = (listener: ProgressListener) => {
    this.listeners.push(listener);
  };

  public unobserveChange = (listener: ProgressListener) => {
    this.listeners = this.listeners.filter((l) => l !== listener);
  };

  private emitChange = (
    n: number,
    context: { started: boolean; finished: boolean }
  ) => {
    this.listeners.forEach((listener) => listener(n, context));
  };

  public start() {
    const work = () => {
      setTimeout(() => {
        if (this.isStarted()) return;

        this.inc();
        work();
      }, this.settings.trickleSpeed);
    };

    if (this.settings.trickle) work();

    return this;
  }

  public done(force: boolean) {
    if (!force && this.isStarted()) return this;
    return this.inc(0.3 + 0.5 * Math.random())?.set(1);
  }

  public set(n: number) {
    n = clamp(n, this.settings.minimum, 1);

    if (!this.isStarted()) {
      this.emitChange(n, { started: true, finished: false });
    }

    this.status = n === 1 ? null : n;

    queue((next) => {
      this.emitChange(n, { started: false, finished: false });

      if (n === 1) {
        this.emitChange(n, { started: false, finished: true });
        next();
        return;
      }

      setTimeout(next, this.settings.speed);
    });

    return this;
  }

  public inc(amount?: number) {
    let n = this.status;

    if (n == null) {
      return this.start();
    } else if (n > 1) {
      return this;
    } else {
      if (typeof amount !== "number") {
        if (n >= 0 && n < 0.2) amount = 0.1;
        else if (n >= 0.2 && n < 0.5) amount = 0.04;
        else if (n >= 0.5 && n < 0.8) amount = 0.02;
        else if (n >= 0.8 && n < 0.99) amount = 0.005;
        else amount = 0;
      }

      n = clamp(n + amount, 0, 0.994);
      return this.set(n);
    }
  }

  public configure(options: Partial<Options>) {
    Object.assign(this.settings, options);
  }

  private isStarted() {
    return this.status != null;
  }
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(n, max));

const queue = (() => {
  const pending: ((next: () => void) => void)[] = [];

  const next = () => {
    const fn = pending.shift();
    fn?.(next);
  };

  return (fn: (next: () => void) => void) => {
    pending.push(fn);
    if (pending.length === 1) next();
  };
})();

const instance = new HeadlessNProgress();
export { instance as default };

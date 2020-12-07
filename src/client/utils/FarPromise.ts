export default class FarPromise<T=unknown> {
    public promise: Promise<T>;
    public resolve: (value?: T | PromiseLike<T>) => void;
    public reject: (reason?: any) => void;
    
    constructor(executor?: Function) {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            executor?.()
        });
    }
}
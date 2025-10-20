export class BusinessError extends Error {
    private _code: number | string = 400;

    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, BusinessError.prototype);
    }

    public get code() {
        return this._code;
    }

    public withCode(value: number|string) {
        this._code = value;
        return this;
    }
}

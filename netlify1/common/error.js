export class BusinessError extends Error {
    _code = 400;

    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, BusinessError.prototype);
    }

    get code() {
        return this._code;
    }

    withCode(value) {
        this._code = value;
        return this;
    }
}
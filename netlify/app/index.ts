import {Hono} from "hono";
import api from './api'
import auth from './auth'
import {BusinessError} from '../common/error'
import {R} from '../common'
import {HTTPException} from 'hono/http-exception'
import {createSingleInstance, loadEnv} from '../common'
import {ContentfulStatusCode} from "hono/utils/http-status";
import {isEqual} from 'lodash-es'

export enum HttpStatus {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    EARLYHINTS = 103,
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    AMBIGUOUS = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    I_AM_A_TEAPOT = 418,
    MISDIRECTED = 421,
    UNPROCESSABLE_ENTITY = 422,
    FAILED_DEPENDENCY = 424,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505
}


const App = createSingleInstance(() => {
    loadEnv()
    const app = new Hono();

    app.onError((err, c) => {
        let httpStatus = HttpStatus.UNAUTHORIZED;
        if (err instanceof BusinessError) {
            return c.json(new R({code: err.code as number || R.FAIL, msg: err.message, data: err.stack}));
        }
        if (err instanceof HTTPException) {
            const response = err.getResponse();
            return c.json(new R({
                code: response.status,
                msg: response.statusText,
                data: err.stack
            }), response.status as ContentfulStatusCode);
        }

        function getMessage(err: Error) {
            let message = err.message;
            let name = err.name;
            if (name.includes('TokenExpired')) return 'token已过期';
            if (name.includes('TokenInvalid')) return 'token无效';
            httpStatus = HttpStatus.OK;
            return message;
        }

        const message = getMessage(err);
        if (!isEqual(httpStatus, HttpStatus.OK)) {
            return c.json(new R({code: httpStatus, msg: message}), httpStatus as ContentfulStatusCode);
        }
        return c.json(R.fail(message, err.stack));
    });


    const BASE_URL = {
        API: '/api',
        MOCK: '/mock',
        AUTH: '/auth',
        IMAGE: '/image',
        SYS: '/sys',
        FILE: '/file',
    } as Record<string, any>;

    app.route(BASE_URL.API, api);
    app.route(BASE_URL.AUTH, auth);
    return app
});


export default App;
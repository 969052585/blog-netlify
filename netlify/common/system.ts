import {createSingleInstance} from "./index";

export const System = createSingleInstance(() => ({
    init: false
}))

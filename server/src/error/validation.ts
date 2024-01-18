export class ExpressValidatorError extends Error {

    constructor(public readonly validation_payload: any) {
        super("express-validator")
    }

}

export class ServerValidationError extends Error {

    constructor(public readonly validation_payload: any) {
        super("server-validation")
    }

}

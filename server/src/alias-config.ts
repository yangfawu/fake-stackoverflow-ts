import { addAliases } from "module-alias"
import { register } from "tsconfig-paths"

/** Path alias for TypeScript */
register({
    baseUrl: "./src",
    paths: {
        "@config/*": ["config/*"],
        "@model/*": ["model/*"],
        "@controller/*": ["controller/*"],
        "@service/*": ["service/*"],
        "@middleware/*": ["middleware/*"],
        "@error/*": ["error/*"],
    }
})
import "tsconfig-paths/register"

/** Path alias for JavaScript */
addAliases({
    "@config": __dirname + "/src/config",
    "@model": __dirname + "/src/model",
    "@controller": __dirname + "/src/controller",
    "@service": __dirname + "/src/service",
    "@middleware": __dirname + "/src/middleware",
    "@error": __dirname + "/src/error",
})
import "module-alias/register"

export {}

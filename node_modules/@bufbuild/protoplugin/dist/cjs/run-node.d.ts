import type { Plugin } from "./plugin.js";
/**
 * Run a plugin with Node.js.
 *
 * ```
 * #!/usr/bin/env node
 * const {runNodeJs} = require("@bufbuild/protoplugin");
 * const {myPlugin} = require("./protoc-gen-x-plugin.js");
 * runNodeJs(myPlugin);
 * ```
 */
export declare function runNodeJs(plugin: Plugin): void;

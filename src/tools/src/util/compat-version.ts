/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

/**
 * Helpers of the compiler compatibility mode ("compatibility target SDK version").
 * Keep this file free of `vscode` imports so that it can be used by the extension host and by
 * the webview script (config-set-by-ui.ts) as well.
 */

// Field stored in .vscode/cjpm_build_args.json, shared by the build command and the language service.
export const COMPAT_VERSION_FIELD = 'compatVersion';

// Option forwarded to cjpm build/run/test and, below it, to cjc.
export const COMPAT_VERSION_OPTION = '--compat-version';

// Key of the LSP initializationOptions entry read by the Cangjie language server.
export const COMPAT_VERSION_LSP_OPTION = 'compatVersionOption';

// Only two-segment versions (major.minor) are supported, e.g. "1.3".
const compatVersionPattern = /^\d+\.\d+$/;

export function isCompatVersionFormatValid(version: string): boolean {
  return typeof version === 'string' && compatVersionPattern.test(version.trim());
}

/**
 * Parse the supported compatibility targets reported after an invalid `cjc --compat-version` value.
 * For example: "error: supported compatible version: [1.3, 1.4]".
 */
export function parseSupportedCompatVersionsFromCjcError(errorText: string): string[] | undefined {
  if (typeof errorText !== 'string' || errorText.trim() === '') {
    return undefined;
  }
  const match = errorText.match(/supported compatible versions?:\s*\[([^\]]*)\]/i);
  if (match === null) {
    return undefined;
  }
  const entries = match[1].split(',').map((version) => version.trim()).filter((version) => version !== '');
  if (entries.some((version) => !isCompatVersionFormatValid(version))) {
    return undefined;
  }
  return entries.filter((version, index) => entries.indexOf(version) === index);
}

/**
 * Decide from the output of an invalid `cjc --compat-version` probe whether the toolchain does not
 * support the option at all: an older compiler rejects the option itself before any version check,
 * e.g. "error: invalid option: '--compat-version'.", while a compat-aware compiler reports the
 * supported versions whitelist. Rejecting the option is a normal state of an older SDK, and must
 * be told apart from a broken SDK configuration or an unexpected compiler output.
 */
export function isCompatOptionUnsupportedByCjcError(errorText: string): boolean {
  if (typeof errorText !== 'string') {
    return false;
  }
  return /(?:invalid|unknown|unrecognized)\s+option:\s*['"“‘]?--compat-version/i.test(errorText);
}

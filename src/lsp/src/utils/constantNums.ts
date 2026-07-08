/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

export const cpmBuildArgs = {
  help: false,
  debug: false,
  verbose: false,
  coverage: false,
  serial: false,
  increment: false,
  alias: '',
  cross: '',
  condition: '',
};

export enum State {
  Stopped = 1,
  Starting = 2,
  Running = 3,
}

export const MAX_RESTART_COUNT: number = 3;

export const MAX_CRASH_LOG_NUM: number = 500;

export const delay500: number = 500;

export const delay100: number = 100;

export const fileExtension = -3; // File name extension

export const LSP_REQUIRES = 'requires';
export const LSP_PACKAGE_REQUIRES = 'package_requires';
export const LSP_PACKAGE_OPTION = 'package_option';
export const LSP_PATH_OPTION = 'path_option';
export const LSP_JAVA_REQUIRES = 'java_requires';
export const LSP_JAVA_MODULES = 'java_modules';
export const LSP_MODULE_NAME = 'module_name';
export const LSP_SRC_PATH = 'src_path';
export const LSP_COMMON_SPECIFIC_PATHS = 'common_specific_paths';

export const requireCategory = ['requires', 'package_requires', 'foreign_requires', 'java_requires', 'dev_requires'];
export const REQUIRES = 'requires';
export const SCRIPTS = 'scripts';
export const FOREIGN_REQUIRES = 'foreign_requires';
export const JAVA_REQUIRES = 'java_requires';
export const DEV_REQURES = 'dev_requires';

export const javaModulesName = ['java_modules', 'module_name'];
export const JAVA_MODULES = 'java_modules';
export const MODULE_NAME = 'module_name';

export const moduleNameKeyInModuleJson: string = 'name';

export const modulePathKeyInModuleJson: string = 'path';

export const moduleGitKeyInModuleJson: string = 'git';

export const testCangjieFile: string = 'testCangjie.cj';

export const builtinConditions = new Set(['os', 'backend', 'debug', 'cjc_version']);

export const packageRequieChild = ['path_option', 'package_option'];

export const cjpmDefaultPath: string = '.cjpm';

export const gitCommitIdKey: string = 'commitId';

export const CJPM_TOML = 'cjpm.toml';

export const CJPM_LOCK = 'cjpm.lock';

export const PROJECT_VERSION = 'version';

export const CJPM_CONFIG_TOML = 'cangjie-repo.toml';

export const REPOSITORY = 'repository';

export const REPOSITORY_LOCAL = 'cache';

export const REPOSITORY_PATH = 'path';

export const ORG = 'organization';

export const DOUBLE_COLON = '::';

export const PACKAGE = 'package';
export const NAME = 'name';
export const COMPILE_OPTION = 'command_option';
export const OUTPUT_TYPE = 'output_type';
export const TARGET_DIR = 'target-dir';
export const PACKAGE_CONFIGURATION = 'package-configuration';
export const CROSS_COMPILE_CONFIGURATION = 'cross-compile-configuration';

export const DEPENDENCIES = 'dependencies';
export const DEV_DEPENDENCIES = 'dev-dependencies';
export const SCRIPT_DEPENDENCIES = 'script-dependencies';

export const IS_SCRIPT_DEPENDENCE = 'isScriptDependence';

export const PACKAGE_REQUIRES = 'package-requires';
export const TARGET = 'target';
export const BIN_DEPENDENCIES = 'bin-dependencies';
export const PATH_OPTION = 'path-option';
export const PACKAGE_OPTION = 'package-option';

export const FFI = 'ffi';
export const C = 'c';
export const JAVA = 'java';

export const PROFILE = 'profile';
export const CUSTOMIZED_OPTION = 'customized-option';
export const WORKSPACE = 'workspace';
export const MEMBERS = 'members';

export const GENERAL_PATH = 'entry/src/main/cangjie';
export const MULTI_PLATFORM_PATH = 'lib';
export const SRC_DIR = 'src-dir';
export const BUILD = 'build';
export const COMBINED = 'combined';
export const DYNAMIC = 'dynamic';
export const EXPERIMENTAL = 'experimental';


// cross platform key
export const FEATURE = 'feature';
export const FEATURES = 'features';
export const SOURCE_SET = 'source-set';
export const PRODUCT = 'product';
export const ALWAYS_ENABLED_FEATURES = 'always-enabled-features';
/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

export interface Toml {
  package: Package;
  dependencies: Map<string, Require>;
  dev_dependencies: Map<string, Require>;
  script_dependencies: Map<string, Require>;
  package_requires: PackageRequires;
  ffi: FFIs;
  cross_compile_configuration: JSON;
  profile: Profile;
  feature: Feature[];
  'source-set': SourceSet[];
}

export interface Package {
  cjc_version: string;
  organization: string;
  name: string;
  description: string;
  version: string;
  output_type: string;
  link_option: string;
  src_dir: string;
  target_dir: string;
  command_option: string;
  package_configuration: Map<string, PackageConfiguration>;
}

export interface Feature {
  name: string;
  mapping: string[];
}

export interface SourceSet {
  name: string;
  'src-dir': string;
  features: string[];
  product: boolean;
}

export interface CommonSpecificPath {
  type: string;
  name: string;
  features: string[];
  path: string;
}

interface FFIs {
  c: Map<string, ForeignRequires>;
  java: Map<string, ForeignRequires>;
}

interface Profile {
  build: Build;
  test: Test;
  customized_option: Map<string, string>;
}

interface Build {
  lto: string;
  incremental: boolean;
}

interface Test {
  noColor: boolean;
  isolate_all_timeout: string;
  randomSeed: number;
  bench: boolean;
  compilation_options: CompilationOptions;
}

interface CompilationOptions {
  verbose: boolean;
  no_run: boolean;
  lto: string;
}

export interface ModuleJson {
  cjc_version: string;
  organization: string;
  name: string;
  description: string;
  version: string;
  requires: Map<string, Require>;
  dev_requires: Map<string, Require>;
  package_requires: PackageRequires;
  foreign_requires: Map<string, ForeignRequires>;
  java_requires: JavaRequire;
  output_type: string;
  command_option: string;
  link_option: string;
  cross_compile_configuration: JSON;
  package_configuration: Map<string, PackageConfiguration>;
  condition_option: Map<string, string>;
  build_dir: string;
}

export interface Require {
  organization: string;
  version: string;
  path: string;
  commitId: string;
}

export interface PackageRequires {
  path_option: string[];
  package_option: JSON;
}

interface JavaRequire {
  java_modules: JavaModule;
  cjogen_options: string[];
}

interface JavaModule {
  module_name: string;
  jar_files: string[];
}

interface ForeignRequires {
  path: string;
  exports: Array<string | number>;
}

interface PackageConfiguration {
  output_type: string;
  command_option: string;
  condition_option: Map<string, string>;
  customized_option: Map<string, string>;
}
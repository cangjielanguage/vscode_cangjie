# Cangjie VSCode Plugin

## Overview

The Cangjie language provides a Visual Studio Code (VSCode) plugin. By installing the Cangjie plugin and Cangjie SDK in VSCode, developers can access language services, project management, compilation and building, debugging services, formatting, static analysis, and code coverage statistics.

For more details, please refer to the [User Manual](https://gitcode.com/Cangjie/vscode_cangjie/blob/dev/docs/summary_cjnative.md).

## Requirements

- Visual Studio Code 1.65 or higher

> Windows platform does not support source file names or paths containing Chinese characters.
>
> Source file names and paths should follow Cangjie programming conventions. It is recommended to avoid characters other than [0-9a-zA-Z_]. Special characters will be replaced with `=`.

## Installation

Download and install [Cangjie SDK](https://cangjie-lang.cn/download). It is recommended to use the same version number for both SDK and plugin to ensure the best compatibility.

The current plugin is compatible with the Cangjie LTS version. If you are using an STS version, please go to the STS version download page, download the matching plugin, and install it manually.

### SDK Path Configuration

1. Click the gear icon in the lower left corner and select Settings. Enter `Cangjie` in the search bar, and select `Cangjie Language Support` from the sidebar.
2. Find the `Cangjie Sdk: Option` option and select the backend type as `CJNative` (this is the default option).
3. Find the `Cangjie Sdk Path: CJNative Backend` option and enter the absolute path of the CJNative backend SDK folder.
4. Restart VSCode to take effect.

## Usage

### Creating a Cangjie Project

In VSCode, press F1 or Ctrl + Shift + P (Command + Shift + P on macOS) to open the command palette, then enter `Cangjie: Create Cangjie Project` or `Cangjie: Create Cangjie Project View` to create a Cangjie project.

The Cangjie project directory structure is as follows:

```text
Project_name: Developer input name

├── src: Code directory

│    └── main.cj: Source file

└── cjpm.toml: Default cjpm.toml configuration file
```

### Language Services

The language services tool provides the following features for developers:

- **Syntax Highlighting** - Supports highlighting code operators, classes, comments, functions, keywords, numbers, package names, strings, variables, etc.
- **Auto Completion** - When entering keywords, variables, or the `.` symbol, candidate content is displayed to the right of the cursor. Use the up and down arrow keys to quickly select the desired content (switch to system default input method), and press `Enter` or `Tab` to complete
- **Go to Definition** - Hover over the target, press and hold the Ctrl key and left-click the mouse to trigger go to definition; or right-click the target symbol and select `Go to Definition`; or press the shortcut key `F12` to go to definition
- **Find All References** - Right-click the target symbol and select `Find All References` to preview symbol references. Click on a preview entry to jump to the corresponding reference location
- **Error Diagnostics** - When source code contains code that does not conform to Cangjie syntax or semantic rules, a red wavy underline will appear on the relevant code segment. Hover over it to see the corresponding error message. The diagnostic error will disappear automatically after correction
- **Selection Highlighting** - Position the cursor on a variable or function name, and both the declaration and usage locations of that variable in the current file will be highlighted
- **Hover Information** - Hover the cursor over a variable to see type information
- **Go to Symbol in File** - Press and hold the `Ctrl` key and `T` at the same time to open a search box. Enter the symbol definition name you want to search for, and matching search results will be displayed. Click on a search result entry to jump to the corresponding definition location
- **Rename** - Position the cursor on a custom name you want to modify, right-click and select `Rename Symbol` or press the shortcut key `F2` to open the rename edit box
- **Outline View** - The current file's outline is displayed in the OUTLINE view on the left side. Currently supports two-level structure display. The first level mainly shows declarations defined in toplevel, and the second level mainly shows constructors and members
- **Breadcrumb Navigation** - Position the cursor on a symbol, click on breadcrumb navigation to show the symbol's current location and its position path within the entire project
- **Signature Help** - Signature help is triggered when entering a left parenthesis and comma at a function call. Once triggered, as long as you are still within the function parameter range, the prompt box will follow the cursor (can coexist with completion). Developers can see the current function's parameter information and the highlight effect of the current function's positional parameters
- **Show Type Hierarchy** - Position the cursor on a custom name you want to view, right-click and select `Show Type Hierarchy`. The type hierarchy will be displayed on the left side of the editor. The Object type is the parent class of all classes by default and will not be displayed with this feature
- **Show Call Hierarchy** - Position the cursor on a function name, right-click and select `Show Call Hierarchy`. The function's call hierarchy will be displayed on the left side of the editor

### Compilation and Building

#### Build Methods

The Cangjie build capabilities provided through the VSCode visual interface depend on the cjpm tool. This tool requires that the opened Cangjie project's module must contain a standard cjpm.toml file. If you want to compile and build the project without this file, you can use the cjc command in the terminal.

- In the VSCode command palette, enter the keyword Cangjie to execute compilation-related commands
- Use the compilation build command (cjpm) in the VSCode terminal panel to compile and build the Cangjie project
- Click the run button in the .cj file editing area to run the entire Cangjie project
- Click the hammer button in the .cj file editing area to compile the entire Cangjie project

#### Configuring Build Parameters

- Directly modify the cjpm.toml and cjpm_build_args.json files
- Execute the `Cangjie: Edit Configuration (UI)` command in the VSCode command palette to open the visual editing UI interface
- Click the paintbrush button in the upper right corner of the editing page to jump to the visual editing UI interface

#### Importing Third-Party Libraries

- Directly modify the target configuration item import-related properties in cjpm.toml and cjpm_build_args.json files
- In the CANGJIE LIBRARY section of the explorer view, view, import, or delete third-party libraries

### Debugging Services

The Cangjie programming language provides visual debugging services to facilitate developers in debugging Cangjie programs. The following features are available:

- Launch: Start the debug process
- Attach: Attach to a running process
- Source breakpoints, function breakpoints, data breakpoints, assembly breakpoints
- Source-level single-step debugging, run to cursor, step into, step out, continue, pause, restart, stop debugging
- Cangjie-C interop debugging, Cangjie code continue, step into C code
- Assembly-level single-step, step into, step out
- Expression evaluation
- Variable inspection and modification
- View variables in the debug console
- View output information of the debugged program
- Reverse debugging
- Unittest run and debug

#### Starting Debugging

##### Launch

**Cangjie Project Debugging**

- If `launch.json` has not been created, press F5 or click Run and Debug > Cangjie(cjdb) Debug to start debugging
- If `launch.json` has been created, click Add Configuration in the `launch.json` file > Cangjie Debug (CJNative) : launch > Build And Debug Cangjie Project to add a debug configuration, then select the added configuration to start debugging

**Single File Debugging**

For single file debugging, select the Cangjie source file you want to debug, right-click and select `Cangjie: Build and Debug File`. This operation will generate the compilation configuration file `task.json` and compilation script, and will execute the script according to the `task.json` configuration to compile a debuggable binary file, then start debugging.

##### Attach

1. Click Add Configuration in the `launch.json` file > Cangjie Debug (CJNative) : attach to add a debug configuration, then select the added configuration to start debugging
2. Select the process you want to debug in the pop-up interface to start debugging

#### Unittest Run and Debug

Click the `run | debug` button on the `@Test/@TestCase` declaration line to run or debug that unit test class/unit test case.

### Command Line Tool Integration

#### Formatting

- For Cangjie files, right-click in the VSCode code editing area and select `[Cangjie] Format` or use the shortcut key `Ctrl + Alt + F` to format the current Cangjie file
- For Cangjie projects, select a file in VSCode's explorer or right-click a folder and execute the `[Cangjie] Format` command to format the selected file or folder

#### Static Analysis

- Right-click in the VSCode code editing area and select `[Cangjie] CodeCheck` or use the shortcut key `Ctrl + Alt + C` to execute the static analysis command
- Right-click in VSCode's explorer and select `[Cangjie] CodeCheck` to execute the static analysis command

#### Coverage Statistics

- Right-click in the VSCode code editing area and select `[Cangjie] Coverage` or use the shortcut key `Ctrl + Alt + G` to generate the coverage report for the current Cangjie file
- Select a file or right-click a folder in VSCode's explorer and execute the `[Cangjie] Coverage` command to generate a coverage report for the selected file or folder

## Related Links

Cangjie Official Website: https://cangjie-lang.cn

Download SDK: https://cangjie-lang.cn/download

Plugin Documentation: https://gitcode.com/Cangjie/vscode_cangjie/blob/dev/docs/summary_cjnative.md
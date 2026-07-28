/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

// provides webview components and communication
const vscode = acquireVsCodeApi();

/**
 * listen for the 'selectPathBtn' event of the webview component
 */
document.getElementById('selectPathBtn').addEventListener('click', function () {
  selectPath();
});

document.getElementById('projectName').onfocus = () => {
  document.getElementById('showErrorRepeatsName').style.display = 'none';
}

document.getElementById('projectName').onblur = (event) => {
  const projectName = event.target.value;
  const nameAvailable = projectNameVerification(projectName);
  document.getElementById('showErrorName').style.display = nameAvailable ? 'none' : 'inherit';
}

/**
 * listen for the 'CancelBtn' event of the webview component
 */
document.getElementById('cancelBtn').addEventListener('click', function () {
  finishSetting('cancel');
});

/**
 * listen for the 'ConfirmBtn' event of the webview component
 */
document.getElementById('completeBtn').addEventListener('click', function () {
  finishSetting('complete');
});

/**
 * send 'selectPath' message to 'create Cangjie project' plugin
 */
function selectPath() {
  vscode.postMessage({
	command: 'selectPath'
  });
}

/**
 * send 'confirm' or 'cancel' message to 'create Cangjie project' plugin
 * @param type : the type of message('complete' or 'cancel')
 */
function finishSetting(type) {
  if (type === 'complete') {
	const selectCompileBackend = document.getElementById('compileBackend');
	const selectOutputType = document.getElementById('outputType');
	const selectPath = document.getElementById('projectDir');
	const projectName = document.getElementById('projectName');
	const nameAvailable = projectNameVerification(projectName.value);
	document.getElementById('showErrorPath').style.display = selectPath.value ? 'none' : 'inherit';
	document.getElementById('showErrorName').style.display = nameAvailable ? 'none' : 'inherit';
	if (selectPath.value && nameAvailable) {
	  vscode.postMessage({
		command: 'finishSetting',
		projectDir: selectPath.value,
		projectName: projectName.value.trim(),
		compileBackend: selectCompileBackend.value,
		outputType: selectOutputType.value
	  });
	}
  } else {
	vscode.postMessage({
	  command: 'cancelSetting',
	});
  }
}

/**
 *  listen for messages from 'create cangjie project' plugin
 */
window.addEventListener('message', event => {
  const message = event.data;
  const projectDir = document.getElementById('projectDir');
  switch (message.command) {
	case 'showPath':
	  if (message.text) {
		projectDir.value = message.text;
		document.getElementById('showErrorPath').style.display = 'none';
	  } else {
		projectDir.value = '';
		document.getElementById('showErrorPath').style.display = 'inherit';
	  }
	  break;
	case 'repeatsName':
	  document.getElementById('showErrorRepeatsName').style.display = message.text ? 'inherit' : 'none';
	default:
	  break;
	}
});

function projectNameVerification(name) {
  const REGEXP_NAME = /^([a-zA-Z][a-zA-Z0-9_]*)$/;
  if (name === '' || (name && !name.match(REGEXP_NAME))) {
	return false;
  }
  return true;
}
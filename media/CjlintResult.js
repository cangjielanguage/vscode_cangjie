/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
  let jsondata = event.data;
  if (document.getElementById("table")) {
    document.getElementById("table").remove();
  }
  createTab(jsondata);
});

function createTab(json) {
  let table = document.createElement("table");
  table.id = "table";
  table.className = "table";
  let thead = document.createElement("thead");
  table.appendChild(thead);
  let tr = document.createElement("tr");
  thead.appendChild(tr);
  for (let key in json[0]) {
    let th = document.createElement("th");
    th.className = "th";
    th.innerHTML = key;
    if (key === 'column') {
      th.innerHTML = 'startColumn';
    }
    if (key === 'line') {
      th.innerHTML = 'startLine';
    }
    tr.appendChild(th);
  }
  let tbody = document.createElement("tbody");
  table.appendChild(tbody);
  for (let i = 0; i < json.length; i++) {
    let tr = document.createElement("tr");
    for (let key in json[i]) {
      let td = document.createElement("td");
      td.className = "td";
      if (key === 'file') {
        let a = document.createElement('a');
        let str = json[i][key];
        if (navigator.userAgent.match(/windows/i)) {
          str = str.replace(/\\\\/g, '/');
        }
        a.innerHTML = str.substr(str.lastIndexOf('/')).replace('/', '');
        a.href = "javascript:void(0)";
        a.id = i;
        td.appendChild(a);
        a.addEventListener("click", function (e) {
          let key = e.currentTarget.attributes.id.value;
          vscode.postMessage({
            fileName: json[key]['file'],
            column: json[key]['column'],
            line: json[key]['line']
          });
        });
      } else {
        td.innerHTML = json[i][key];
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  document.getElementById("data")?.appendChild(table);
}
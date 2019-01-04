const vscode = require("vscode");
const structed = require("./structed");

function toSelection(loc) {
  return new vscode.Selection(
    loc.start.line - 1,
    loc.start.column,
    loc.end.line - 1,
    loc.end.column
  );
}

function findNodeAtCursor() {
  let editor = vscode.window.activeTextEditor;
  let selection = editor.selection.active;
  let text = editor.document.getText();
  let ast = structed.parse({ text });
  let cursor = {
    column: selection.character,
    line: selection.line + 1
  };
  let path = structed.expandSelectionAt({
    start: cursor,
    end: cursor,
    ast
  });
  let loc = toSelection(path.node.loc);
  return [path, loc];
}

let currentPath, currentNode;

function selectNodeAt() {
  let editor = vscode.window.activeTextEditor;
  let [path, selection] = findNodeAtCursor();

  currentPath = path;
  currentNode = path.node;

  editor.selection = selection;
}

function expandSelectionAt() {
  let editor = vscode.window.activeTextEditor;

  let path;

  if (currentPath) {
    path = structed.expandSelectionAt({
      path: currentPath
    });
  } else {
    let selection = editor.selection.active;
    let text = editor.document.getText();
    let ast = structed.parse({ text });
    let cursor = {
      column: selection.character,
      line: selection.line + 1
    };

    path = structed.expandSelectionAt({
      start: cursor,
      end: cursor,
      ast
    });
  }

  currentPath = path;
  currentNode = path.node;

  editor.selection = toSelection(path.node.loc);
}

function shrinkSelectionAt() {
  let editor = vscode.window.activeTextEditor;
  if (currentPath) {
    let path = structed.shrinkSelectionAt(currentPath);

    if (path && path.node) {
      currentPath = path;
      currentNode = path.node;

      editor.selection = toSelection(path.node.loc);
    }
  }
}

function nextNodeAt() {
  let editor = vscode.window.activeTextEditor;

  let path;

  if (currentPath) {
    path = structed.nextNodeAt(currentPath);
  } else {
    let [ppath] = findNodeAtCursor();
    path = structed.nextNodeAt(ppath);
  }

  if (path && path.node) {
    currentPath = path;
    currentNode = path.node;

    editor.selection = toSelection(path.node.loc);
  }
}

function prevNodeAt() {
  let editor = vscode.window.activeTextEditor;

  let path;

  if (currentPath) {
    path = structed.prevNodeAt(currentPath);
  } else {
    let [ppath] = findNodeAtCursor();
    path = structed.prevNodeAt(ppath);
  }

  if (path && path.node) {
    currentPath = path;
    currentNode = path.node;

    editor.selection = toSelection(path.node.loc);
  }
}

function toTopLevel() {
  let editor = vscode.window.activeTextEditor;
  if (currentPath) {
    let path = structed.toTopLevel(currentPath);

    currentPath = path;
    currentNode = path.node;

    editor.selection = toSelection(path.node.loc);
  } else {
    let [path] = findNodeAtCursor();
    let ppath = structed.toTopLevel(path);

    currentPath = ppath;
    currentNode = ppath.node;

    editor.selection = toSelection(ppath.node.loc);
  }
}

function cutNodeAt() {
  let editor = vscode.window.activeTextEditor;
  if (currentNode) {
    let selection = toSelection(currentNode.loc);
    editor.edit(builder => {
      builder.replace(selection, "");
    });
  } else {
    let [path, selection] = findNodeAtCursor();

    currentPath = path.parentPath;
    currentNode = path.parent;

    editor
      .edit(builder => {
        builder.replace(selection, "");
      })
      .then(ok => {
        if (ok) {
          editor.selection = toSelection(path.parent.loc);
        }
      });
  }
}

module.exports = {
  selectNodeAt,
  expandSelectionAt,
  shrinkSelectionAt,
  nextNodeAt,
  prevNodeAt,
  toTopLevel,
  cutNodeAt
};

const vscode = require("vscode");
const structed = require("./src/index");

function activate(context) {
  let disposableExpandSelectionAt = vscode.commands.registerCommand(
    "structed.expandSelectionAt",
    structed.expandSelectionAt
  );

  let disposableSelectNodeAt = vscode.commands.registerCommand(
    "structed.selectNodeAt",
    structed.selectNodeAt
  );

  let disposableShrinkSelectionAt = vscode.commands.registerCommand(
    "structed.shrinkSelectionAt",
    structed.shrinkSelectionAt
  );

  let disposableNextNodeAt = vscode.commands.registerCommand(
    "structed.nextNodeAt",
    structed.nextNodeAt
  );

  let disposablePrevNodeAt = vscode.commands.registerCommand(
    "structed.prevNodeAt",
    structed.prevNodeAt
  );

  let disposableToTopLevel = vscode.commands.registerCommand(
    "structed.toTopLevel",
    structed.toTopLevel
  );

  let disposableCutNodeAt = vscode.commands.registerCommand(
    "structed.cutNodeAt",
    structed.cutNodeAt
  );

  context.subscriptions.push(
    disposableExpandSelectionAt,
    disposableSelectNodeAt,
    disposableShrinkSelectionAt,
    disposableNextNodeAt,
    disposablePrevNodeAt,
    disposableToTopLevel,
    disposableCutNodeAt
  );
}
exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
};

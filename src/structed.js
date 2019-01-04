const { parse } = require("babylon");
const traverse = require("babel-traverse").default;
const generate = require("babel-generator").default;

const parseCode = ({ text }) =>
  parse(text, {
    sourceType: "module",
    plugins: [
      "jsx",
      "flow",
      "typescript",
      "doExpressions",
      "objectRestSpread",
      "decorators",
      "classProperties",
      "exportDefaultFrom",
      "exportNamespaceFrom",
      "asyncGenerators",
      "bigInt",
      "pipelineOperator"
    ]
  });

const shouldSkipNode = p => p.isExpressionStatement();

const findNodeAtRange = ({ start, end, ast }) => {
  let matchedNode;
  let lineNode;

  traverse(ast, {
    enter(path) {
      const loc = path.node.loc;

      if (loc.start.line === start.line) {
        if (lineNode === undefined) {
          lineNode = path;
        }
        if (loc.end.line === end.line) {
          if (
            loc.start.column <= start.column &&
            loc.end.column >= end.column
          ) {
            matchedNode = path;
          }
        }
      }
    }
  });
  return matchedNode || lineNode;
};

// Editor commands

const expandSelectionAt = ({ start, end, ast, path }) => {
  if (path) {
    return path.parentPath;
  } else {
    return findNodeAtRange({ start, end, ast });
  }
};

const shrinkSelectionAt = path => {
  let firstChild;

  traverse(
    path.node,
    {
      enter(p) {
        if (firstChild === undefined) {
          firstChild = p;
          p.stop();
        }
      }
    },
    path.scope,
    {}
  );

  return firstChild;
};

// ===========================

const getKey = p => p.listKey || p.key;

const nodesDir = {
  FunctionDeclaration: ["id", "params", "body"],
  ClassDeclaration: ["id", "superClass", "body"],
  ForStatement: ["init", "test", "update", "body"],
  ConditionalExpression: ["test", "consequent", "alternate"]
};

const getNextSiblingChild = path => {
  let nextChild;
  let ndir;

  if (nodesDir.hasOwnProperty(path.parentPath.type)) {
    const dir = nodesDir[path.parentPath.type];
    const cidx = dir.indexOf(getKey(path));
    ndir = dir[cidx + 1];
  }

  traverse(
    path.parent,
    {
      enter(p) {
        if (ndir !== undefined) {
          if (getKey(p) === ndir) {
            nextChild = p;
            return p.stop();
          }
        } else if (!(path.node === p.node || p.isDescendant(path))) {
          nextChild = p;
          return p.stop();
        }
      }
    },
    path.scope,
    {}
  );
  return nextChild;
};

const getPrevSiblingParent = path => {
  let prevChild;
  let ndir;

  if (nodesDir.hasOwnProperty(path.parentPath.type)) {
    const dir = nodesDir[path.parentPath.type];
    let cidx = dir.indexOf(getKey(path));
    cidx = cidx === 0 ? dir.length : cidx;
    ndir = dir[cidx - 1];
  }

  traverse(
    path.parent,
    {
      exit(p) {
        if (ndir !== undefined) {
          if (getKey(p) === ndir) {
            prevChild = p;
            p.stop();
          }
        } else if (!(path.node === p.node || p.isDescendant(path))) {
          prevChild = p;
          p.stop();
        }
      }
    },
    path.scope,
    {}
  );
  return prevChild;
};

const nextNodeAt = path => {
  const npath = path.getNextSibling();

  if (npath.node) {
    return npath;
  }
  return getNextSiblingChild(path);
};

const prevNodeAt = path => {
  const ppath = path.getPrevSibling();

  if (ppath.node) {
    return ppath;
  }

  return getPrevSiblingParent(path);
};

const nextInnerNodeAt = ({ line, column, ast }) => null;
const nextOuterNodeAt = ({ line, column, ast }) => null;

const toTopLevel = path => path.findParent(p => p.parentPath.isProgram());

const getFile = p => p.findParent(p => p.isProgram()).parent;

const slurpJSX = path => {
  let target = path.getNextSibling();

  while (!target.isJSXElement()) {
    target = target.getNextSibling();
  }

  const targetNode = target.node;

  target.remove();

  path.node.children.push(targetNode);

  const { code } = generate(path.node);
  const loc = {
    start: path.node.loc.start,
    end: targetNode.loc.end
  };

  return [code, loc];
};

const barfJSX = path => {
  const node = path.node.children.pop();
  const idx = path.parent.children.indexOf(path.node);

  path.parent.children.splice(idx + 1, 0, node);

  const { code } = generate(path.parent);
  const loc = {
    start: path.node.loc.start,
    end: targetNode.loc.end
  };

  return [code];
};

module.exports = {
  parse: parseCode,
  expandSelectionAt,
  shrinkSelectionAt,
  nextNodeAt,
  prevNodeAt,
  nextInnerNodeAt,
  nextOuterNodeAt,
  toTopLevel,
  slurpJSX,
  barfJSX
};

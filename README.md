# Structed

Structured editing for JavaScript

## Features

- Hierarchical navigation (expand/shrink selection or cursor position)
- Manipulate nodes instead of plain text (copy/cut)

## Default keybindings

| Keybinding | Action                |
| ---------- | --------------------- |
| ctrl+alt+a | Select Node At Cursor |
| ctrl+alt+s | Expand Selection      |
| ctrl+alt+d | Shrink Selection      |
| ctrl+alt+x | Select Next Node      |
| ctrl+alt+z | Select Previous Node  |
| ctrl+alt+p | Select Top Level Node |
| ctrl+alt+k | Cut Selected Node     |

## How it works

Because JavaScript’s source code is represented as plain text we need to parse it into AST first (structured representation of the code). And then analyze AST, with respect to cursor position in the editor, and compute selection range for AST nodes that should be “in focus” by walking the structure and extracting location data.

## Release Notes

### 0.0.1-alpha

Initial implementation

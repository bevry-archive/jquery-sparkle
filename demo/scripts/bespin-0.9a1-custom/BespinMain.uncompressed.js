;bespin.tiki.register("::text_editor", {
    name: "text_editor",
    dependencies: { "completion": "0.0.0", "undomanager": "0.0.0", "settings": "0.0.0", "canon": "0.0.0", "rangeutils": "0.0.0", "traits": "0.0.0", "theme_manager": "0.0.0", "keyboard": "0.0.0", "edit_session": "0.0.0", "syntax_manager": "0.0.0" }
});
bespin.tiki.module("text_editor:commands/editing",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var settings = require('settings').settings;
var env = require('environment').env;
var m_range = require('rangeutils:utils/range');

/*
 * Commands that delete text.
 */

/**
 * Deletes the selection or the previous character, if the selection is an
 * insertion point.
 */
exports.backspace = function(args, request) {
    var view = env.view;
    view.performBackspaceOrDelete(true);
};

/**
 * Deletes the selection or the next character, if the selection is an
 * insertion point.
 */
exports.deleteCommand = function(args, request) {
    var view = env.view;
    view.performBackspaceOrDelete(false);
};

/**
 * Deletes all lines that are partially or fully selected, and position the
 * insertion point at the end of the deleted range.
 */
exports.deleteLines = function(args, request) {
    if (env.model.readOnly) {
        return;
    }

    // In the case of just one line, do nothing.
    if (env.model.lines.length == 1) {
        return;
    }

    var view = env.view;
    view.groupChanges(function() {
        var range = view.getSelectedRange();
        var lines = env.model.lines;
        var lastLine = lines.length - 1;
        var startPos, endPos;

        // Last row gets special treatment.
        if (range.start.row == lastLine) {
            startPos = { col: lines[lastLine - 1].length, row: lastLine - 1 };
        } else {
            startPos = { col: 0, row: range.start.row };
        }

        // Last row gets special treatment.
        if (range.end.row == lastLine) {
            endPos = { col: lines[lastLine].length, row: lastLine};
        } else {
            endPos = { col: 0, row: range.end.row + 1 };
        }

        view.replaceCharacters({
            start: startPos,
            end:   endPos
        }, '');

        view.moveCursorTo(startPos);
    });
};

/*
 * Commands that insert text.
 */

// Inserts a newline, and copies the spaces at the beginning of the current row
// to autoindent.
var newline = function(model, view) {
    var selection = view.getSelectedRange();
    var position = selection.start;
    var row = position.row, col = position.col;

    var lines = model.lines;
    var prefix = lines[row].substring(0, col);

    var spaces = /^\s*/.exec(prefix);
    view.insertText('\n' + spaces);
};

/**
 * Replaces the selection with the given text and updates the selection
 * boundaries appropriately.
 */
exports.insertText = function(args, request) {
    var view = env.view;
    var text = args.text;
    view.insertText(text);
};

/**
 * Inserts a newline at the insertion point.
 */
exports.newline = function(args, request) {
    var model = env.model, view = env.view;
    newline(model, view);
};

/**
 * Join the following line with the current one. Removes trailing whitespaces.
 */
exports.joinLines = function(args, request) {
    var model = env.model;
    if (model.readOnly) {
        return;
    }

    var view = env.view;
    var selection = view.getSelectedRange();
    var lines = model.lines;
    var row = selection.end.row;

    // Last line selected, which can't get joined.
    if (lines.length == row) {
        return;
    }

    view.groupChanges(function() {
        var endCol = lines[row].length;

        view.replaceCharacters({
            start: {
                col: endCol,
                row: row
            },
            end: {
                col: /^\s*/.exec(lines[row + 1])[0].length,
                row: row + 1
        }}, '');
    });
};

/**
 * Creates a new, empty line below the current one, and places the insertion
 * point there.
 */
exports.openLine = function(args, request) {
    if (env.model.readOnly) {
        return;
    }

    var model = env.model, view = env.view;

    var selection = view.getSelectedRange();
    var row = selection.end.row;
    var lines = model.lines;
    view.moveCursorTo({ row: row, col: lines[row].length });

    newline(model, view);
};

/**
 * Inserts a new tab. This is smart about the current inserted whitespaces and
 * the current position of the cursor. If some text is selected, the selected
 * lines will be indented by tabstop spaces.
 */
exports.tab = function(args, request) {
    var view = env.view;

    view.groupChanges(function() {
        var tabstop = settings.get('tabstop');
        var selection = view.getSelectedRange();
        var str = '';

        if (m_range.isZeroLength(selection)){
            var line = env.model.lines[selection.start.row];
            var trailspaces = line.substring(selection.start.col).
                                            match(/^\s*/)[0].length;
            var count = tabstop - (selection.start.col + trailspaces) % tabstop;

            for (var i = 0; i < count; i++) {
                str += ' ';
            }

            view.replaceCharacters({
                 start: selection.start,
                 end:   selection.start
             }, str);

            view.moveCursorTo({
                col: selection.start.col + count + trailspaces,
                row: selection.end.row
            });
        } else {
            for (var i = 0; i < tabstop; i++) {
                str += ' ';
            }

            var startCol;
            var row = selection.start.row - 1;
            while (row++ < selection.end.row) {
                startCol = row == selection.start.row ? selection.start.col : 0;

                view.replaceCharacters({
                    start: { row:  row, col: startCol},
                    end:   { row:  row, col: startCol}
                }, str);
            }

            view.setSelection({
                start: selection.start,
                end: {
                    col: selection.end.col + tabstop,
                    row:  selection.end.row
                }
            });
        }
    }.bind(this));
};

/**
 * Removes a tab of whitespaces. If there is no selection, whitespaces in front
 * of the cursor will be removed. The number of removed whitespaces depends on
 * the setting tabstop and the current cursor position. If there is a selection,
 * then the selected lines are unindented by tabstop spaces.
 */
exports.untab = function(args, request) {
    var view = env.view;

    view.groupChanges(function() {
        var tabstop = settings.get('tabstop');
        var selection = view.getSelectedRange();
        var lines = env.model.lines;
        var count = 0;

        if (m_range.isZeroLength(selection)){
            count = Math.min(
                lines[selection.start.row].substring(0, selection.start.col).
                                                    match(/\s*$/)[0].length,
                (selection.start.col - tabstop) % tabstop || tabstop);

            view.replaceCharacters({
                start: {
                    col: selection.start.col - count,
                    row: selection.start.row
                },
                end: selection.start
            }, '');

            view.moveCursorTo({
                row:  selection.start.row,
                col: selection.end.col - count
            });
        } else {
            var startCol;
            var row = selection.start.row - 1;
            while (row++ < selection.end.row) {
                startCol = row == selection.start.row ? selection.start.col : 0;

                count = Math.min(
                    lines[row].substring(startCol).match(/^\s*/)[0].length,
                    tabstop);

                view.replaceCharacters({
                     start: { row: row, col: startCol},
                     end:   { row: row, col: startCol + count}
                 }, '');
            }

             view.setSelection({
                 start: { row:  selection.start.row, col: selection.start.col},
                 end:   { row:  selection.end.row, col: selection.end.col - count}
             });
       }
    }.bind(this));
};

});

bespin.tiki.module("text_editor:commands/editor",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var settings = require('settings').settings;
var env = require('environment').env;

exports.findNextCommand = function(args, request) {
    var view = env.view, search = view.editor.searchController;
    var sel = view.getSelectedRange();
    var match = search.findNext(sel.end, true);
    if (match) {
        view.setSelection(match, true);
        view.focus();
    }
};

exports.findPrevCommand = function(args, request) {
    var view = env.view, search = view.editor.searchController;
    var sel = view.getSelectedRange();
    var match = search.findPrevious(sel.start, true);
    if (match) {
        view.setSelection(match, true);
        view.focus();
    }
};

/**
 * Utility to allow us to alter the current selection
 * TODO: If the selection is empty, broaden the scope to the whole file?
 */
var withSelection = function(action) {
    var view = env.view;
    var selection = view.getSelectedCharacters();

    var replacement = action(selection);

    var range = view.getSelectedRange();
    var model = env.model;
    model.replaceCharacters(range, replacement);
};

/**
 * 'replace' command
 */
exports.replaceCommand = function(args, request) {
    withSelection(function(selected) {
        return selected.replace(args.search + '/g', args.replace);
    });
};

/**
 * 'entab' command
 */
exports.entabCommand = function(args, request) {
    tabstop = settings.get('tabstop');
    withSelection(function(selected) {
        return selected.replace(' {' + tabstop + '}', '\t');
    });
};

/**
 * 'detab' command
 */
exports.detabCommand = function(args, request) {
    tabstop = settings.get('tabstop');
    withSelection(function(selected) {
        return selected.replace('\t', new Array(tabstop + 1).join(' '));
    });
};

/**
 * 'trim' command
 */
exports.trimCommand = function(args, request) {
    withSelection(function(selected) {
        var lines = selected.split('\n');
        lines = lines.map(function(line) {
            if (args.side === 'left' || args.side === 'both') {
                line = line.replace(/^\s+/, '');
            }
            if (args.side === 'right' || args.side === 'both') {
                line = line.replace(/\s+$/, '');
            }
            return line;
        });
        return lines.join('\n');
    });
};

/**
 * 'uc' command
 */
exports.ucCommand = function(args, request) {
    withSelection(function(selected) {
        return selected.toUpperCase();
    });
};

/**
 * 'lc' command
 */
exports.lcCommand = function(args, request) {
    withSelection(function(selected) {
        return selected.toLowerCase();
    });
};

});

bespin.tiki.module("text_editor:commands/movement",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var Range = require('rangeutils:utils/range');
var env = require('environment').env;

// TODO: These should not be using private APIs of the view.

//
// Simple movement.
//
// These simply delegate to the text view, because they take the text view's
// private virtual selection into account.
//

exports.moveDown = function(args, request) {
    var view = env.view;
    view.moveDown();
};

exports.moveLeft = function(args, request) {
    var view = env.view;
    view.moveLeft();
};

exports.moveRight = function(args, request) {
    var view = env.view;
    view.moveRight();
};

exports.moveUp = function(args, request) {
    var view = env.view;
    view.moveUp();
};

//
// Simple selection.
//

exports.selectDown = function(args, request) {
    var view = env.view;
    view.selectDown();
};

exports.selectLeft = function(args, request) {
    var view = env.view;
    view.selectLeft();
};

exports.selectRight = function(args, request) {
    var view = env.view;
    view.selectRight();
};

exports.selectUp = function(args, request) {
    var view = env.view;
    view.selectUp();
};

//
// Move or select to the end of the line or document.
//

var moveOrSelectEnd = function(shift, inLine) {
    var view = env.view, model = env.model;
    var lines = model.lines;
    var selectedRange = view.getSelectedRange(true);
    var row = inLine ? selectedRange.end.row : lines.length - 1;
    view.moveCursorTo({ row: row, col: lines[row].length }, shift);
};

exports.moveLineEnd = function(args, request) {
    moveOrSelectEnd(false, true);
};

exports.selectLineEnd = function(args, request) {
    moveOrSelectEnd(true, true);
};

exports.moveDocEnd = function(args, request) {
    moveOrSelectEnd(false, false);
};

exports.selectDocEnd = function(args, request) {
    moveOrSelectEnd(true, false);
};

//
// Move or select to the beginning of the line or document.
//

var moveOrSelectStart = function(shift, inLine) {
    var view = env.view;
    var range = view.getSelectedRange(true);
    var row = inLine ? range.end.row : 0;
    var position = { row: row, col: 0 };
    view.moveCursorTo(position, shift);
};

exports.moveLineStart = function (args, request) {
    moveOrSelectStart(false, true);
};

exports.selectLineStart = function(args, request) {
    moveOrSelectStart(true, true);
};

exports.moveDocStart = function(args, request) {
    moveOrSelectStart(false, false);
};

exports.selectDocStart = function(args, request) {
    moveOrSelectStart(true, false);
};

//
// Move or select to the next or previous word.
//

var seekNextStop = function(view, text, col, dir, rowChanged) {
    var isDelim;
    var countDelim = 0;
    var wasOverNonDelim = false;

    if (dir < 0) {
        col--;
        if (rowChanged) {
            countDelim = 1;
        }
    }

    while (col < text.length && col > -1) {
        isDelim = view.isDelimiter(text[col]);
        if (isDelim) {
            countDelim++;
        } else {
            wasOverNonDelim = true;
        }
        if ((isDelim || countDelim > 1) && wasOverNonDelim) {
            break;
        }
        col += dir;
    }

    if (dir < 0) {
        col++;
    }

    return col;
};

var moveOrSelectNextWord = function(shiftDown) {
    var view = env.view, model = env.model;
    var lines = model.lines;

    var selectedRange = view.getSelectedRange(true);
    var end = selectedRange.end;
    var row = end.row, col = end.col;

    var currentLine = lines[row];
    var changedRow = false;

    if (col >= currentLine.length) {
        row++;
        changedRow = true;
        if (row < lines.length) {
            col = 0;
            currentLine = lines[row];
        } else {
            currentLine = '';
        }
    }

    col = seekNextStop(view, currentLine, col, 1, changedRow);

    view.moveCursorTo({ row: row, col: col }, shiftDown);
};

var moveOrSelectPreviousWord = function(shiftDown) {
    var view = env.view, model = env.model;

    var lines = model.lines;
    var selectedRange = view.getSelectedRange(true);
    var end = selectedRange.end;
    var row = end.row, col = end.col;

    var currentLine = lines[row];
    var changedRow = false;

    if (col > currentLine.length) {
        col = currentLine.length;
    } else if (col == 0) {
        row--;
        changedRow = true;
        if (row > -1) {
            currentLine = lines[row];
            col = currentLine.length;
        } else {
            currentLine = '';
        }
    }

    col = seekNextStop(view, currentLine, col, -1, changedRow);

    view.moveCursorTo({ row: row, col: col }, shiftDown);
};

exports.moveNextWord = function(args, request) {
    moveOrSelectNextWord(false);
};

exports.selectNextWord = function(args, request) {
    moveOrSelectNextWord(true);
};

exports.movePreviousWord = function(args, request) {
    moveOrSelectPreviousWord(false);
};

exports.selectPreviousWord = function(args, request) {
    moveOrSelectPreviousWord(true);
};

//
// Miscellaneous.
//

/**
 * Selects all characters in the buffer.
 */
exports.selectAll = function(args, request) {
    var view = env.view;
    view.selectAll();
};

});

bespin.tiki.module("text_editor:commands/scrolling",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
 
var env = require('environment').env;

// Scrolling commands.

/**
 * Scrolls to the start of the document.
 */
exports.scrollDocStart = function(args, request) {
    env.view.scrollToPosition({ col: 0, row: 0 });
};

/**
 * Scrolls to the end of the document.
 */
exports.scrollDocEnd = function(args, request) {
    env.view.scrollToPosition(env.model.range.end);
};

/**
 * Scrolls down by one screenful of text.
 */
exports.scrollPageDown = function(args, request) {
    env.view.scrollPageDown();
};

/**
 * Scrolls up by one screenful of text.
 */
exports.scrollPageUp = function(args, request) {
    env.view.scrollPageUp();
};


});

bespin.tiki.module("text_editor:controllers/layoutmanager",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');
var Event = require("events").Event;
var Range = require('rangeutils:utils/range');
var SyntaxManager = require('syntax_manager').SyntaxManager;
var TextStorage = require('models/textstorage').TextStorage;
var catalog = require('bespin:plugins').catalog;
var settings = require('settings').settings;
var m_scratchcanvas = require('bespin:util/scratchcanvas');

var fontDimension = {};

var computeFontDimension = function() {
    var fontSize = settings.get('fontsize');
    var fontFace = settings.get('fontface');
    var font = fontSize + 'px ' + fontFace;

    var canvas = m_scratchcanvas.get();

    // Measure a large string to work around the fact that width and height
    // are truncated to the nearest integer in the canvas API.
    var str = '';
    for (var i = 0; i < 100; i++) {
        str += 'M';
    }

    var width = canvas.measureStringWidth(font, str) / 100;

    fontDimension.characterWidth = width;

    fontDimension.lineHeight = Math.floor(fontSize * 1.6);
    fontDimension.lineAscent = Math.floor(fontSize * 1.3);
};

computeFontDimension();

catalog.registerExtension('settingChange', {
    match: "font[size|face]",
    pointer: computeFontDimension
});

exports.LayoutManager = function(opts) {
    this.changedTextAtRow = new Event();
    this.invalidatedRects = new Event();

    // Put the global variable on the instance.
    this.fontDimension = fontDimension;

    // There is no setter for textStorage so we have to change it to
    // _textStorage to make things work with util.mixin().
    if (opts.textStorage) {
        opts._textStorage = opts.textStorage;
        delete opts.textStorage;
    } else {
        this._textStorage = new TextStorage();
    }

    util.mixin(this, opts);

    this._textStorage.changed.add(this.textStorageChanged.bind(this));

    this.textLines = [
        {
            characters: '',
            colors:     [
                {
                    start:  0,
                    end:    0,
                    color:  'plain'
                }
            ]
        }
    ];

    var syntaxManager = new SyntaxManager(this);
    this.syntaxManager = syntaxManager;
    syntaxManager.attrsChanged.add(this._attrsChanged.bind(this));

    this._size = { width: 0, height: 0 };
    this.sizeChanged = new Event();

    this._height = 0;

    // Now that the syntax manager is set up, we can recompute the layout.
    // (See comments in _textStorageChanged().)
    this._recomputeEntireLayout();
};

exports.LayoutManager.prototype = {
    _maximumWidth: 0,
    _textStorage: null,

    _size: null,
    sizeChanged: null,

    /**
     * Theme colors. Value is set by editorView class. Don't change this
     * property directly. Use the editorView function to adjust it.
     */
    _theme: { },

    /**
     * @property
     *
     * The margins on each edge in pixels, expressed as an object with 'left',
     * 'bottom', 'top', and 'right' properties.
     *
     * Do not modify the properties of this object directly; clone, adjust, and
     * reset the margin property of the layout manager instead.
     */
    margin: { left: 5, bottom: 6, top: 0, right: 12 },

    /**
     * @property
     *
     * The plugin catalog to use. Typically this will be plugins.catalog, but
     * for testing this may be replaced with a mock object.
     */
    pluginCatalog: catalog,

    /** The syntax manager in use. */
    syntaxManager: null,

    /**
     * @property{Array<object>}
     *
     * The marked-up lines of text. Each line has the properties 'characters',
     * 'colors', and 'lineHeight'.
     */
    textLines: null,

    // Called whenever the text attributes (which usually consist of syntax
    // highlighting) change.
    _attrsChanged: function(startRow, endRow) {
        this.updateTextRows(startRow, endRow);

        var invalidRects = this.rectsForRange({
            start:  { row: startRow, col: 0 },
            end:    { row: endRow, col: 0 }
        });

        this.invalidatedRects(this, invalidRects);
    },

    _computeInvalidRects: function(oldRange, newRange) {
        var startRect = this.characterRectForPosition(oldRange.start);

        var lineRect = {
            x:      startRect.x,
            y:      startRect.y,
            width:  Number.MAX_VALUE,
            height: startRect.height
        };

        return oldRange.end.row === newRange.end.row ?
            [ lineRect ] :
            [
                lineRect,
                {
                    x:      0,
                    y:      startRect.y + fontDimension.lineHeight,
                    width:  Number.MAX_VALUE,
                    height: Number.MAX_VALUE
                }
            ];
    },

    // Returns the last valid position in the buffer.
    _lastCharacterPosition: function() {
        return {
            row: this.textLines.length - 1,
            col: this._maximumWidth
        };
    },

    _recalculateMaximumWidth: function() {
        // Lots of room for optimization here if this turns out to be slow. But
        // for now...
        var textLines = this.textLines;
        var max = 0;
        textLines.forEach(function(line) {
            var width = line.characters.length;
            if (max < width) {
                max = width;
            }
        });
        this._maximumWidth = max;

        this.size = { width: max, height: this.textLines.length };
    },

    _recomputeEntireLayout: function() {
        var entireRange = this._textStorage.range;
        this._recomputeLayoutForRanges(entireRange, entireRange);
    },

    _recomputeLayoutForRanges: function(oldRange, newRange) {
        var oldStartRow = oldRange.start.row, oldEndRow = oldRange.end.row;
        var newEndRow = newRange.end.row;
        var newRowCount = newEndRow - oldStartRow + 1;

        var lines = this._textStorage.lines;
        var theme = this._theme;
        var plainColor = theme.plain;

        var newTextLines = [];
        for (var i = 0; i < newRowCount; i++) {
            var line = lines[oldStartRow + i];
            newTextLines[i] = {
                characters: line,
                colors: [ { start: 0, end: null, color: plainColor } ]
            };
        }

        this.textLines = util.replace(this.textLines, oldStartRow,
                                oldEndRow - oldStartRow + 1, newTextLines);
        this._recalculateMaximumWidth();

        // Resize if necessary.
        var newHeight = this.textLines.length;
        var syntaxManager = this.syntaxManager;
        if (this._height !== newHeight) {
            this._height = newHeight;
        }

        // Invalidate the start row (starting the syntax highlighting).
        syntaxManager.invalidateRow(oldStartRow);

        // Take the cached attributes from the syntax manager.
        this.updateTextRows(oldStartRow, newEndRow + 1);

        this.changedTextAtRow(this, oldStartRow);

        var invalidRects = this._computeInvalidRects(oldRange, newRange);
        this.invalidatedRects(this, invalidRects);
    },

    /**
     * Determines the boundaries of the entire text area.
     *
     * TODO: Unit test.
     */
    boundingRect: function() {
        return this.rectsForRange({
            start:  { row: 0, col: 0 },
            end:    {
                row: this.textLines.length - 1,
                col: this._maximumWidth
            }
        })[0];
    },

    /**
     * Determines the location of the character underneath the given point.
     *
     * @return Returns an object with three properties:
     *   * row: The row of the character nearest the point.
     *   * col: The col of the character nearest the point.
     *   * partialFraction: The fraction of the horizontal distance between
     *       this character and the next character. The extreme left of the
     *       character is 0.0, while the extreme right of the character is 1.0.
     *       If you are calling this function to determine where to place the
     *       cursor, then you should place the cursor after the returned
     *       character if this value is greater than 0.5.
     *
     * If there is no character under the point, then the character nearest the
     * given point is returned, according to the selection rules.
     */
    characterAtPoint: function(point) {
        var margin = this.margin;
        var x = point.x - margin.left, y = point.y - margin.top;

        var characterWidth = fontDimension.characterWidth;
        var textStorage = this._textStorage;
        var clampedPosition = textStorage.clampPosition({
            row: Math.floor(y / fontDimension.lineHeight),
            col: Math.floor(x / characterWidth)
        });

        var lineLength = textStorage.lines[clampedPosition.row].length;
        clampedPosition.partialFraction = x < 0 ||
            clampedPosition.col === lineLength ? 0.0 :
            x % characterWidth / characterWidth;

        return clampedPosition;
    },

    /**
     * Given a rectangle expressed in pixels, returns the range of characters
     * that lie at least partially within the rectangle as an object.
     *
     * TODO: Write unit tests for this method.
     */
    characterRangeForBoundingRect: function(rect) {
        // TODO: variable line heights, needed for word wrap and perhaps
        // extensions as well
        var lineHeight = fontDimension.lineHeight;
        var characterWidth = fontDimension.characterWidth;
        var margin = this.margin;
        var x = rect.x - margin.left, y = rect.y - margin.top;
        return {
            start:  {
                row: Math.max(Math.floor(y / lineHeight), 0),
                col: Math.max(Math.floor(x / characterWidth), 0)
            },
            end:    {
                row: Math.floor((y + rect.height - 1) / lineHeight),
                col: Math.floor((x + rect.width - 1) / characterWidth) + 1
            }
        };
    },

    /**
     * Returns the boundaries of the character at the given position.
     */
    characterRectForPosition: function(position) {
        return this.rectsForRange({
            start:  position,
            end:    { row: position.row, col: position.col + 1 }
        })[0];
    },

    /**
     * Returns the pixel boundaries of the given line.
     *
     * TODO: Unit test.
     */
    lineRectForRow: function(row) {
        return this.rectsForRange({
            start:  { row: row, col: 0                   },
            end:    { row: row, col: this._maximumWidth  }
        })[0];
    },

    rectForPosition: function(position) {
        var margin = this.margin;
        var characterWidth = fontDimension.characterWidth;
        var lineHeight = fontDimension.lineHeight;
        return {
            x:      margin.left + characterWidth * position.col,
            y:      margin.top + lineHeight * position.row,
            width:  characterWidth,
            height: lineHeight
        };
    },

    /**
     * Returns the 1, 2, or 3 rectangles that make up the given range.
     */
    rectsForRange: function(range) {
        var characterWidth = fontDimension.characterWidth;
        var lineHeight = fontDimension.lineHeight;
        var maximumWidth = this._maximumWidth;
        var margin = this.margin;

        var start = range.start, end = range.end;
        var startRow = start.row, startColumn = start.col;
        var endRow = end.row, endColumn = end.col;

        if (startRow === endRow) {
            // The simple rectangle case.
            return [
                {
                    x:      margin.left + characterWidth * startColumn,
                    y:      margin.top + lineHeight * startRow,
                    width:  characterWidth * (endColumn - startColumn),
                    height: lineHeight
                }
            ];
        }

        var rects = [];

        // Top line
        var middleStartRow;
        if (startColumn === 0) {
            middleStartRow = startRow;
        } else {
            middleStartRow = startRow + 1;
            rects.push({
                x:      margin.left + characterWidth * startColumn,
                y:      margin.top + lineHeight * startRow,
                width:  99999, // < Number.MAX_VALUE is not working here.
                height: lineHeight
            });
        }

        // Bottom line
        var middleEndRow;
        if (endColumn === 0) {
            middleEndRow = endRow - 1;
        } else if (endColumn === maximumWidth) {
            middleEndRow = endRow;
        } else {
            middleEndRow = endRow - 1;
            rects.push({
                x:      margin.left,
                y:      margin.top + lineHeight * endRow,
                width:  characterWidth * endColumn,
                height: lineHeight
            });
        }

        // Middle area
        rects.push({
            x:      margin.left,
            y:      margin.top + lineHeight * middleStartRow,
            width:  99999, // < Number.MAX_VALUE is not working here.
            height: lineHeight * (middleEndRow - middleStartRow + 1)
        });

        return rects;
    },

    textStorageChanged: function(oldRange, newRange) {
        this._recomputeLayoutForRanges(oldRange, newRange);
    },

    /**
     * Updates the text lines in the given range to correspond to the current
     * state of the syntax highlighter. Does not actually run the syntax
     * highlighters.
     */
    updateTextRows: function(startRow, endRow) {
        var textLines = this.textLines;
        var attrs = this.syntaxManager.getAttrsForRows(startRow, endRow);
        var theme = this._theme;

        for (var i = 0; i < attrs.length; i++) {
            textLines[startRow + i].colors = attrs[i];
        }
    }
};

Object.defineProperties(exports.LayoutManager.prototype, {
    size: {
        set: function(size) {
            if (size.width !== this._size.width || size.height !== this._size.height) {
                this.sizeChanged(size);
                this._size = size;
            }
        },

        get: function() {
            return this._size;
        }
    },

    textStorage: {
        get: function() {
            return this._textStorage;
        }
    }
})

});

bespin.tiki.module("text_editor:controllers/search",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');
var Range = require('rangeutils:utils/range');
var console = require('bespin:console').console;

/**
 * @class
 *
 * Manages the Find functionality.
 */
exports.EditorSearchController = function(editor) {
    this.editor = editor;
};

exports.EditorSearchController.prototype = {

    /**
     * The editor holding the buffer object to search in.
     */
    editor: null,

    /**
     * This is based on the idea from:
     *      http://simonwillison.net/2006/Jan/20/escape/.
     */
    _escapeString: /(\/|\.|\*|\+|\?|\||\(|\)|\[|\]|\{|\}|\\)/g,

    _findMatchesInString: function(str) {
        var result = [];
        var searchRegExp = this.searchRegExp;
        var searchResult;
        var endIndex;

        searchRegExp.lastIndex = 0;

        while (true) {
            searchResult = searchRegExp.exec(str);
            if (searchResult === null) {
                break;
            }

            result.push(searchResult);

            var index = searchResult.index;
            searchRegExp.lastIndex = index + searchResult[0].length;
        }

        return result;
    },

    _makeRange: function(searchResult, row) {
        return {
            start: { row: row, col: searchResult.index },
            end: {
                row: row,
                col: searchResult.index + searchResult[0].length
            }
        };
    },

    /**
     * @property{boolean}
     *
     * True if the search query is a regular expression, false if it's a
     * literal string.
     */
    isRegExp: null,

    /**
     * @property{RegExp}
     *
     * The current search query as a regular expression.
     */
    searchRegExp: null,

    /**
     * @property{String}
     *
     * The current search text.
     */
    searchText: null,

    /**
     * Sets the search query.
     *
     * @param text     The search query to set.
     * @param isRegExp True if the text is a regex, false if it's a literal
     *                 string.
     */
    setSearchText: function(text, isRegExp) {
        var regExp;
        // If the search string is not a RegExp make sure to escape the
        if (!isRegExp) {
            regExp = new RegExp(text.replace(this._escapeString, '\\$1'), 'gi');
        } else {
            regExp = new RegExp(text);
        }
        this.searchRegExp = regExp;
        this.isRegExp = isRegExp;
        this.searchText = text;
    },

    /**
     * Finds the next occurrence of the search query.
     *
     * @param startPos       The position at which to restart the search.
     * @param allowFromStart True if the search is allowed to wrap.
     */
    findNext: function(startPos, allowFromStart) {
        var searchRegExp = this.searchRegExp;
        if (util.none(searchRegExp)) {
            return null;
        }

        startPos = startPos || this.editor.textView.getSelectedRange().end;

        var lines = this.editor.layoutManager.textStorage.lines;
        var searchResult;

        searchRegExp.lastIndex = startPos.col;

        var row;
        for (row = startPos.row; row < lines.length; row++) {
            searchResult = searchRegExp.exec(lines[row]);
            if (!util.none(searchResult)) {
                return this._makeRange(searchResult, row);
            }
        }

        if (!allowFromStart) {
            return null;
        }

        // Wrap around.
        for (row = 0; row <= startPos.row; row++) {
            searchResult = searchRegExp.exec(lines[row]);
            if (!util.none(searchResult)) {
                return this._makeRange(searchResult, row);
            }
        }

        return null;
    },

    /**
     * Finds the previous occurrence of the search query.
     *
     * @param startPos       The position at which to restart the search.
     * @param allowFromStart True if the search is allowed to wrap.
     */
    findPrevious: function(startPos, allowFromEnd) {
        var searchRegExp = this.searchRegExp;
        if (util.none(searchRegExp)) {
            return null;
        }

        startPos = startPos || this.editor.textView.getSelectedRange().start;

        var lines = this.editor.buffer.layoutManager.textStorage.lines;
        var searchResults;

        // Treat the first line specially.
        var firstLine = lines[startPos.row].substring(0, startPos.col);
        searchResults = this._findMatchesInString(firstLine);

        if (searchResults.length !== 0) {
            return this._makeRange(searchResults[searchResults.length - 1],
                                                                startPos.row);
        }

        // Loop over all other lines.
        var row;
        for (row = startPos.row - 1; row !== -1; row--) {
            searchResults = this._findMatchesInString(lines[row]);
            if (searchResults.length !== 0) {
                return this._makeRange(searchResults[searchResults.length - 1],
                                                                        row);
            }
        }

        if (!allowFromEnd) {
            return null;
        }

        // Wrap around.
        for (row = lines.length - 1; row >= startPos.row; row--) {
            searchResults = this._findMatchesInString(lines[row]);
            if (searchResults.length !== 0) {
                return this._makeRange(searchResults[searchResults.length - 1],
                                                                        row);
            }
        }

        return null;
    }
};


});

bespin.tiki.module("text_editor:controllers/undo",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var console = require('bespin:console').console;
var env = require('environment').env;

/**
 * @class
 *
 * The editor undo controller is a delegate of the text view that groups
 * changes into patches and saves them with the undo manager.
 *
 * This object does not assume that it has exclusive write access to the text
 * storage object, and as such it tries to maintain sensible behavior in the
 * presence of direct modification to the text storage by other objects. This
 * is important for collaboration.
 */
exports.EditorUndoController = function(editor) {
    this.editor = editor;
    var textView = this.textView = editor.textView;

    textView.beganChangeGroup.add(function(sender, selection) {
        this._beginTransaction();
        this._record.selectionBefore = selection;
    }.bind(this));

    textView.endedChangeGroup.add(function(sender, selection) {
        this._record.selectionAfter = selection;
        this._endTransaction();
    }.bind(this));

    textView.replacedCharacters.add(function(sender, oldRange, characters) {
        if (!this._inTransaction) {
            throw new Error('UndoController.textViewReplacedCharacters()' +
                ' called outside a transaction');
        }

        this._record.patches.push({
            oldCharacters:  this._deletedCharacters,
            oldRange:       oldRange,
            newCharacters:  characters,
            newRange:       this.editor.layoutManager.textStorage.
                            resultingRangeForReplacement(oldRange,
                            characters.split('\n'))
        });

        this._deletedCharacters = null;
    }.bind(this));

    textView.willReplaceRange.add(function(sender, oldRange) {
        if (!this._inTransaction) {
            throw new Error('UndoController.textViewWillReplaceRange() called' +
                ' outside a transaction');
        }

        this._deletedCharacters = this.editor.layoutManager.textStorage.
                            getCharacters(oldRange);
    }.bind(this));
};

exports.EditorUndoController.prototype = {
    _inTransaction: false,
    _record: null,

    /**
     * @property{TextView}
     *
     * The view object to forward changes to. This property must be set upon
     * instantiating the undo controller.
     */
    textView: null,

    _beginTransaction: function() {
        if (this._inTransaction) {
            console.trace();
            throw new Error('UndoController._beginTransaction() called with a ' +
                'transaction already in place');
        }

        this._inTransaction = true;
        this._record = { patches: [] };
    },

    _endTransaction: function() {
        if (!this._inTransaction) {
            throw new Error('UndoController._endTransaction() called without a ' +
                'transaction in place');
        }

        this.editor.buffer.undoManager.registerUndo(this, this._record);
        this._record = null;

        this._inTransaction = false;
    },

    _tryApplyingPatches: function(patches) {
        var textStorage = this.editor.layoutManager.textStorage;
        patches.forEach(function(patch) {
            textStorage.replaceCharacters(patch.oldRange, patch.newCharacters);
        });
        return true;
    },

    _undoOrRedo: function(patches, selection) {
        if (this._inTransaction) {
            // Can't think of any reason why this should be supported, and it's
            // often an indication that someone forgot an endTransaction()
            // call somewhere...
            throw new Error('UndoController._undoOrRedo() called while in a transaction');
        }

        if (!this._tryApplyingPatches(patches)) {
            return false;
        }

        this.textView.setSelection(selection, true);
        return true;
    },

    redo: function(record) {
        var patches = record.patches.concat();
        patches.reverse();
        return this._undoOrRedo(patches, record.selectionAfter);
    },

    undo: function(record) {
        return this._undoOrRedo(record.patches.map(function(patch) {
                return {
                    oldCharacters:  patch.newCharacters,
                    oldRange:       patch.newRange,
                    newCharacters:  patch.oldCharacters,
                    newRange:       patch.oldRange
                };
            }), record.selectionBefore);
    }
};

exports.undoManagerCommand = function(args, request) {
    var editor = env.editor;
    editor.buffer.undoManager[request.commandExt.name]()
};

});

bespin.tiki.module("text_editor:models/buffer",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var env = require('environment').env;

var util = require('bespin:util/util');

var Promise = require('bespin:promise').Promise;
var TextStorage = require('models/textstorage').TextStorage;
var LayoutManager = require('controllers/layoutmanager').LayoutManager;
var UndoManager = require('undomanager').UndoManager;

/**
 * A Buffer connects a model and file together. It also holds the layoutManager
 * that is bound to the model. The syntaxManager can get accessed via the
 * layoutManager as well.
 *
 * Per opened file there is one buffer which means that one buffer is
 * corresponding to one file on the disk. If you open different file, you have
 * to create a new buffer for that file.
 *
 * To create a buffer that is (not yet) bound to a file, just create the Buffer
 * without a file passed.
 */
exports.Buffer = function(file, initialContent) {
    this._file = file;
    this._model = new TextStorage(initialContent);
    this._layoutManager = new LayoutManager({
        textStorage: this._model
    });

    this.undoManager = new UndoManager();

    // If a file is passed, then load it. This is the same as calling reload.
    if (file) {
        this.reload().then(function() {
            this._updateSyntaxManagerInitialContext();
        }.bind(this));
    } else {
        this.loadPromise = new Promise();
        this.loadPromise.resolve();
    }

    // Restore the state of the buffer (selection + scrollOffset).
    // TODO: Refactor this code into the ViewState.
    var history = (env.session ? env.session.history : null);
    var item, selection, scrollOffset;

    // If
    //  1.  Check if a history exists and the buffer has a file (-> path)
    //  2.  Ask the history object for the history for the current file.
    //      If no history is found, null is returned.
    if (history && file &&                                  // 1.
            (item = history.getHistoryForPath(file.path))   // 2.
    ) {
        // There is no state saved in the buffer and the history object
        // has a state saved.
        selection = item.selection;
        scrollOffset = item.scroll;
    }

    // Use the saved values from the history or the default values.
    this._selectedRange = selection || {
        start: { row: 0, col: 0 },
        end: { row: 0, col: 0 }
    };

    this._scrollOffset = scrollOffset || { x: 0, y: 0 };
};

exports.Buffer.prototype = {
    /**
     * The undoManager where the undo/redo stack is stored and handled.
     */
    undoManager: null,

    loadPromise: null,

    _scrollOffset: null,
    _selectedRange: null,
    _selectedRangeEndVirtual: null,

    /**
     * The syntax manager associated with this file.
     */
    _layoutManager: null,

    /**
     * The file object associated with this buffer. The file instance can only
     * be assigned when constructing the buffer or calling saveAs.
     */
    _file: null,

   /**
    * The text model that is holding the content of the file.
    */
    _model: null,

    /**
     * Save the contents of this buffer. Returns a promise that resolves
     * once the file is saved.
     */
    save: function() {
        return this._file.saveContents(this._model.value);
    },

    /**
     * Saves the contents of this buffer to a new file, and updates the file
     * field of this buffer to point to the result.
     *
     * @param dir{Directory} The directory to save in.
     * @param filename{string} The name of the file in the directory.
     * @return A promise to return the newly-saved file.
     */
    saveAs: function(newFile) {
        var promise = new Promise();

        newFile.saveContents(this._model.value).then(function() {
            this._file = newFile;
            this._updateSyntaxManagerInitialContext();
            promise.resolve();
        }.bind(this), function(error) {
            promise.reject(error);
        });

        return promise;
    },

    /**
     * Reload the existing file contents from the server.
     */
    reload: function() {
        var file = this._file;
        var self = this;

        var pr;
        pr =  file.loadContents().then(function(contents) {
            self._model.value = contents;
        });
        this.loadPromise = pr;
        return pr;
    },

    _updateSyntaxManagerInitialContext: function() {
        var ext = this._file.extension();
        var syntaxManager = this._layoutManager.syntaxManager;
        syntaxManager.setSyntaxFromFileExt(ext === null ? '' : ext);
    },

    /**
     * Returns true if the file is untitled (i.e. it is new and has not yet
     * been saved with @saveAs) or false otherwise.
     */
    untitled: function() {
        return util.none(this._file);
    }
};

Object.defineProperties(exports.Buffer.prototype, {
    layoutManager: {
        get: function() {
            return this._layoutManager;
        }
    },

    syntaxManager: {
        get: function() {
            this._layoutManager.syntaxManager;
        }
    },

    file: {
        get: function() {
            return this._file;
        }
    },

    model: {
        get: function() {
            return this._model;
        }
    }
});

});

bespin.tiki.module("text_editor:models/textstorage",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var Event = require('events').Event;
var util = require('bespin:util/util');

var TextStorage;

/**
 * Creates a new text storage object holding the given string (if supplied).
 *
 * @constructor
 * @exports TextStorage as text_editor:models.textstorage.TextStorage
 */
TextStorage = function(initialValue) {
    if (initialValue !== null && initialValue !== undefined) {
        this._lines = initialValue.split("\n");
    } else {
        this._lines = [ '' ];
    }

    /**
     * Called whenever the text changes with the old and new ranges supplied.
     */
    this.changed = new Event();

    return this;
};

TextStorage.prototype = {
    /** @lends TextStorage */

    _lines: null,

    /**
     * Whether this model is read-only. Attempts to modify a read-only model
     * result in exceptions.
     *
     * @type {boolean}
     */
    readOnly: false,

    /**
     * Returns the position of the nearest character to the given position,
     * according to the selection rules.
     *
     * @param {position} pos The position to clamp.
     */
    clampPosition: function(pos) {
        var lines = this._lines;

        var row = pos.row;
        if (row < 0) {
            return { row: 0, col: 0 };
        } else if (row >= lines.length) {
            return this.range.end;
        }

        var col = Math.max(0, Math.min(pos.col, lines[row].length));
        return { row: row, col: col };
    },

    /**
     * Returns the actual range closest to the given range, according to the
     * selection rules.
     */
    clampRange: function(range) {
        var start = this.clampPosition(range.start);
        var end = this.clampPosition(range.end);
        return { start: start, end: end };
    },

    /** Deletes all characters in the range. */
    deleteCharacters: function(range) {
        this.replaceCharacters(range, '');
    },

    /**
     * Returns the result of displacing the given position by count characters
     * forward (if count > 0) or backward (if count < 0).
     */
    displacePosition: function(pos, count) {
        var forward = count > 0;
        var lines = this._lines;
        var lineCount = lines.length;

        for (var i = Math.abs(count); i !== 0; i--) {
            if (forward) {
                var rowLength = lines[pos.row].length;
                if (pos.row === lineCount - 1 && pos.col === rowLength) {
                    return pos;
                }
                pos = pos.col === rowLength ?
                    { row: pos.row + 1, col: 0            } :
                    { row: pos.row,     col: pos.col + 1  };
            } else {
                if (pos.row === 0 && pos.col == 0) {
                    return pos;
                }

                if (pos.col === 0) {
                    lines = this._lines;
                    pos = {
                        row:    pos.row - 1,
                        col: lines[pos.row - 1].length
                    };
                } else {
                    pos = { row: pos.row, col: pos.col - 1 };
                }
            }
        }
        return pos;
    },

    /**
     * Returns the characters in the given range as a string.
     */
    getCharacters: function(range) {
        var lines = this._lines;
        var start = range.start, end = range.end;
        var startRow = start.row, endRow = end.row;
        var startCol = start.col, endCol = end.col;

        if (startRow === endRow) {
            return lines[startRow].substring(startCol, endCol);
        }

        var firstLine = lines[startRow].substring(startCol);
        var middleLines = lines.slice(startRow + 1, endRow);
        var endLine = lines[endRow].substring(0, endCol);
        return [ firstLine ].concat(middleLines, endLine).join('\n');
    },

    /** Returns the lines of the text storage as a read-only array. */
    getLines: function() {
        return this._lines;
    },

    /** Returns the span of the entire text content. */
    getRange: function() {
        var lines = this._lines;
        var endRow = lines.length - 1;
        var endCol = lines[endRow].length;
        var start = { row: 0, col: 0 }, end = { row: endRow, col: endCol };
        return { start: start, end: end };
    },

    /** Returns the text in the text storage as a string. */
    getValue: function() {
        return this._lines.join('\n');
    },

    /** Inserts characters at the supplied position. */
    insertCharacters: function(pos, chars) {
        this.replaceCharacters({ start: pos, end: pos }, chars);
    },

    /** Replaces the characters within the supplied range. */
    replaceCharacters: function(oldRange, characters) {
        if (this.readOnly) {
            throw new Error("Attempt to modify a read-only text storage " +
                "object");
        }

        var addedLines = characters.split('\n');
        var addedLineCount = addedLines.length;

        var newRange = this.resultingRangeForReplacement(oldRange, addedLines);

        var oldStart = oldRange.start, oldEnd = oldRange.end;
        var oldStartRow = oldStart.row, oldEndRow = oldEnd.row;
        var oldStartColumn = oldStart.col;

        var lines = this._lines;
        addedLines[0] = lines[oldStartRow].substring(0, oldStartColumn) +
            addedLines[0];
        addedLines[addedLineCount - 1] +=
            lines[oldEndRow].substring(oldEnd.col);

        this._lines = util.replace(lines, oldStartRow, oldEndRow - oldStartRow + 1, addedLines);

        this.changed(oldRange, newRange, characters);
    },

    /**
     * Returns the character range that would be modified if the range were
     * replaced with the given lines.
     */
    resultingRangeForReplacement: function(range, lines) {
        var lineCount = lines.length;
        var lastLineLength = lines[lineCount - 1].length;
        var start = range.start;
        var endRow = start.row + lineCount - 1;
        var endCol = (lineCount === 1 ? start.col : 0) + lastLineLength;
        return { start: start, end: { row: endRow, col: endCol } };
    },

    setLines: function(newLines) {
        this.setValue(newLines.join('\n'));
    },

    setValue: function(newValue) {
        this.replaceCharacters(this.range, newValue);
    }
};

exports.TextStorage = TextStorage;

Object.defineProperties(exports.TextStorage.prototype, {
    lines: {
        get: function() {
            return this.getLines();
        },
        set: function(newLines) {
            return this.setLines(newLines);
        }
    },
    
    range: {
        get: function() {
            return this.getRange();
        }
    },
    
    value: {
        get: function() {
            return this.getValue();
        },
        set: function(newValue) {
            this.setValue(newValue);
        }
    }
});

});

bespin.tiki.module("text_editor:utils/rect",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @private
 *
 * Returns the distance between the given value and the given inclusive upper
 * and lower bounds, or 0 if the value lies between them.
 *
 * Exported so that the function can be unit tested.
 */
exports._distanceFromBounds = function(value, low, high) {
    if (value < low) {
        return value - low;
    }
    if (value >= high) {
        return value - high;
    }
    return 0;
};

/**
 * Merges the rectangles in a given set and returns the resulting set of non-
 * overlapping rectanlges.
 */
exports.merge = function(set) {
    var modified;
    do {
        modified = false;
        var newSet = [];

        for (var i = 0; i < set.length; i++) {
            var rectA = set[i];
            newSet.push(rectA);
            for (var j = i+1; j < set.length; j++) {
                var rectB = set[j];
                if (exports.rectsSideBySide(rectA, rectB) ||
                                        exports.rectsIntersect(rectA, rectB)) {
                    set.splice(j, 1);

                    // There's room for optimization here...
                    newSet[newSet.length - 1] = exports.unionRects(rectA, rectB);

                    modified = true;
                    break;
                }
            }
        }

        set = newSet;
    } while (modified);

    return set;
};

/**
 * Returns the vector representing the shortest offset between the given
 * rectangle and the given point.
 */
exports.offsetFromRect = function(rect, point) {
    return {
        x: exports._distanceFromBounds(point.x, rect.x, exports.maxX(rect)),
        y: exports._distanceFromBounds(point.y, rect.y, exports.maxY(rect))
    };
};

/**
 * Returns true if the rectanges intersect or false otherwise. Adjacent
 * rectangles don't count; they must actually overlap some region.
 */
exports.rectsIntersect = function(a, b) {
    var intersection = exports.intersectRects(a, b);
    return intersection.width !== 0 && intersection.height !== 0;
};

/**
 * Checks if two rects lay side by side. Returns true if this is true.
 * For example:
 *      +------------+---------------+
 *      |    A       |       B       |
 *      +------------+---------------+
 * will be true, but if B is only one pixel shifted up,
 * then it would return false.
 */
exports.rectsSideBySide = function(a, b) {
    if (a.x == b.x && a.width == b.width) {
        if (a.y < b.y) {
            return (a.y + a.height) == b.y;
        } else {
            return (b.y + b.height) == a.y;
        }
    } else if (a.y == b.y && a.height == b.height) {
        if (a.x < b.x) {
            return (a.x + a.width) == b.x;
        } else {
            return (b.x + b.width) == a.x;
        }
    }
    return false;
};

// extracted from SproutCore
exports.intersectRects = function(r1, r2) {
  // find all four edges
  var ret = {
    x: Math.max(exports.minX(r1), exports.minX(r2)),
    y: Math.max(exports.minY(r1), exports.minY(r2)),
    width: Math.min(exports.maxX(r1), exports.maxX(r2)),
    height: Math.min(exports.maxY(r1), exports.maxY(r2))
  } ;

  // convert edges to w/h
  ret.width = Math.max(0, ret.width - ret.x) ;
  ret.height = Math.max(0, ret.height - ret.y) ;
  return ret ;
};

/** Return the left edge of the frame */
exports.minX = function(frame) {
  return frame.x || 0;
};

/** Return the right edge of the frame. */
exports.maxX = function(frame) {
  return (frame.x || 0) + (frame.width || 0);
};

/** Return the top edge of the frame */
exports.minY = function(frame) {
  return frame.y || 0 ;
};

/** Return the bottom edge of the frame */
exports.maxY = function(frame) {
  return (frame.y || 0) + (frame.height || 0) ;
};

/** Check if the given point is inside the rect. */
exports.pointInRect = function(point, f) {
    return  (point.x >= exports.minX(f)) &&
            (point.y >= exports.minY(f)) &&
            (point.x <= exports.maxX(f)) &&
            (point.y <= exports.maxY(f)) ;
};

/** Returns the union between two rectangles

  @param r1 {Rect} The first rect
  @param r2 {Rect} The second rect
  @returns {Rect} The union rect.
*/
exports.unionRects = function(r1, r2) {
  // find all four edges
  var ret = {
    x: Math.min(exports.minX(r1), exports.minX(r2)),
    y: Math.min(exports.minY(r1), exports.minY(r2)),
    width: Math.max(exports.maxX(r1), exports.maxX(r2)),
    height: Math.max(exports.maxY(r1), exports.maxY(r2))
  } ;

  // convert edges to w/h
  ret.width = Math.max(0, ret.width - ret.x) ;
  ret.height = Math.max(0, ret.height - ret.y) ;
  return ret ;
};

/** Return true if the two frames match.  You can also pass only points or sizes.

  @param r1 {Rect} the first rect
  @param r2 {Rect} the second rect
  @param delta {Float} an optional delta that allows for rects that do not match exactly. Defaults to 0.1
  @returns {Boolean} true if rects match
 */
exports.rectsEqual = function(r1, r2, delta) {
    if (!r1 || !r2) return (r1 == r2) ;
    if (!delta && delta !== 0) delta = 0.1;
    if ((r1.y != r2.y) && (Math.abs(r1.y - r2.y) > delta)) return false ;
    if ((r1.x != r2.x) && (Math.abs(r1.x - r2.x) > delta)) return false ;
    if ((r1.width != r2.width) && (Math.abs(r1.width - r2.width) > delta)) return false ;
    if ((r1.height != r2.height) && (Math.abs(r1.height - r2.height) > delta)) return false ;
    return true ;
};

});

bespin.tiki.module("text_editor:views/canvas",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');
var Rect = require('utils/rect');
var Event = require('events').Event;

/**
 * @class
 *
 * This class provides support for manual scrolling and positioning for canvas-
 * based elements. Getting these elements to play nicely with SproutCore is
 * tricky and error-prone, so all canvas-based views should consider deriving
 * from this class. Derived views should implement drawRect() in order to
 * perform the appropriate canvas drawing logic.
 *
 * The actual size of the canvas is always the size of the container the canvas
 * view is placed in.
 *
 * The canvas that is created is available in the domNode attribute and should
 * be added to the document by the caller.
 */
exports.CanvasView = function(container, preventDownsize, clearOnFullInvalid) {
    if (!container) {
        return;
    }

    this._preventDownsize = preventDownsize || false;
    this._clearOnFullInvalid = clearOnFullInvalid || false;
    this._clippingFrame = this._frame = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    this._invalidRects = [];

    var canvas = document.createElement('canvas');
    canvas.setAttribute('style', 'position: absolute');
    canvas.innerHTML = 'canvas tag not supported by your browser';
    container.appendChild(canvas);
    this.domNode = canvas;

    this.clippingChanged = new Event();
    this.clippingChanged.add(this.clippingFrameChanged.bind(this));
};

exports.CanvasView.prototype = {
    domNode: null,

    clippingChanged: null,

    _canvasContext: null,
    _canvasId: null,
    _invalidRects: null,
    _lastRedrawTime: null,
    _redrawTimer: null,
    _clippingFrame: null,
    _preventDownsize: false,
    _clearOnFullInvalid: false,

    _frame: null,

    _getContext: function() {
        if (this._canvasContext === null) {
            this._canvasContext = this.domNode.getContext('2d');
        }
        return this._canvasContext;
    },

    computeWithClippingFrame: function(x, y) {
        var clippingFrame = this.clippingFrame;
        return {
            x: x + clippingFrame.x,
            y: y + clippingFrame.y
        };
    },

    /**
     * @property{Number}
     *
     * The minimum delay between canvas redraws in milliseconds, equal to 1000
     * divided by the desired number of frames per second.
     */
    minimumRedrawDelay: 1000.0 / 30.0,

    /**
     * Subclasses can override this method to provide custom behavior whenever
     * the clipping frame changes. The default implementation simply
     * invalidates the entire visible area.
     */
    clippingFrameChanged: function() {
        this.invalidate();
    },

    drawRect: function(rect, context) { },

    /**
     * Render the canvas. Rendering is delayed by a few ms to empty the call
     * stack first before rendering. If the canvas was rendered in less then
     * this.minimumRedrawDelay ms, then the next rendering will take in
     * this.minimumRedrawDelay - now + lastRendering ms.
     */
    render: function() {
         // Don't continue if there is a rendering or redraw timer already.
        if (this._renderTimer || this._redrawTimer) {
            return;
        }

        // Queue the redraw at the end of the current event queue to make sure
        // everyting is done when redrawing.
        this._renderTimer = setTimeout(this._tryRedraw.bind(this), 0);
    },

    /**
     * Invalidates the entire visible region of the canvas.
     */
    invalidate: function(rect) {
        this._invalidRects = 'all';
        this.render();
    },

    /**
     * Invalidates the given rect of the canvas, and schedules that portion of
     * the canvas to be redrawn at the end of the run loop.
     */
    invalidateRect: function(rect) {
        var invalidRects = this._invalidRects;
        if (invalidRects !== 'all') {
            invalidRects.push(rect);
            this.render();
        }
    },

    _tryRedraw: function(context) {
        this._renderTimer = null;

        var now = new Date().getTime();
        var lastRedrawTime = this._lastRedrawTime;
        var minimumRedrawDelay = this.minimumRedrawDelay;

        if (lastRedrawTime === null ||
                now - lastRedrawTime >= minimumRedrawDelay) {
            this._redraw();
            return;
        }

        var redrawTimer = this._redrawTimer;
        if (redrawTimer !== null) {
            return; // already scheduled
        }

        // TODO This is not as good as SC.Timer... Will it work?
        this._redrawTimer = window.setTimeout(this._redraw.bind(this),
            minimumRedrawDelay);
    },

     /**
     * Calls drawRect() on all the invalid rects to redraw the canvas contents.
     * Generally, you should not need to call this function unless you override
     * the default implementations of didCreateLayer() or render().
     */
    _redraw: function() {
        var clippingFrame = this.clippingFrame;
        clippingFrame = {
            x:      Math.round(clippingFrame.x),
            y:      Math.round(clippingFrame.y),
            width:  clippingFrame.width,
            height: clippingFrame.height
        };

        var context = this._getContext();
        context.save();
        context.translate(-clippingFrame.x, -clippingFrame.y);

        var invalidRects = this._invalidRects;
        if (invalidRects === 'all') {
            if (this._clearOnFullInvalid) {
                context.clearRect(0, 0, this.domNode.width, this.domNode.height);
            }
            this.drawRect(clippingFrame, context);
        } else {
            Rect.merge(invalidRects).forEach(function(rect) {
                rect = Rect.intersectRects(rect, clippingFrame);
                if (rect.width !== 0 && rect.height !== 0) {
                    context.save();

                    var x = rect.x, y = rect.y;
                    var width = rect.width, height = rect.height;
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x + width, y);
                    context.lineTo(x + width, y + height);
                    context.lineTo(x, y + height);
                    context.closePath();
                    context.clip();

                    this.drawRect(rect, context);

                    context.restore();
                }

            }, this);
        }

        context.restore();

        this._invalidRects = [];
        this._redrawTimer = null;
        this._lastRedrawTime = new Date().getTime();
    }
};

Object.defineProperties(exports.CanvasView.prototype, {
    clippingFrame: {
        get: function() {
            return this._clippingFrame;
        },

        set: function(clippingFrame) {
            clippingFrame = util.mixin(util.clone(this._clippingFrame), clippingFrame);

            if (this._clippingFrame === null ||
                    !Rect.rectsEqual(clippingFrame, this._clippingFrame)) {
                this._clippingFrame = clippingFrame;
                this.clippingChanged();
            }
        }
    },

    frame: {
        get: function() {
            return this._frame;
        },
        
        set: function(frame) {
            var domNode = this.domNode;
            var domStyle = domNode.style;
            var preventDownsize = this._preventDownsize;
            var domWidth = domNode.width;
            var domHeight = domNode.height;
            var domStyle = domNode.style;
            domStyle.left = frame.x + 'px';
            domStyle.top = frame.y + 'px';

            var widthChanged, heightChanged;
            if (frame.width !== domWidth) {
                if (frame.width < domWidth) {
                    if (!preventDownsize) {
                        widthChanged = true;
                    }
                } else {
                    widthChanged = true;
                }
            }
            if (frame.height !== domHeight) {
                if (frame.height < domHeight) {
                    if (!preventDownsize) {
                        heightChanged = true;
                    }
                } else {
                    heightChanged = true;
                }
            }

            if (widthChanged) {
                this.domNode.width = frame.width;
            }
            if (heightChanged) {
                this.domNode.height = frame.height;
            }

            this._frame = frame;

            // The clipping frame might have changed if the size changed.
            this.clippingFrame = {
                width: frame.width,
                height: frame.height
            };
        }
    }
});

});

bespin.tiki.module("text_editor:views/editor",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var rangeutils = require('rangeutils:utils/range');
var scroller = require('views/scroller');
var util = require('bespin:util/util');

var Buffer = require('models/buffer').Buffer;
var CompletionController = require('completion:controller').
    CompletionController;
var EditorSearchController = require('controllers/search').
    EditorSearchController;
var EditorUndoController = require('controllers/undo').EditorUndoController;
var Event = require('events').Event;
var GutterView = require('views/gutter').GutterView;
var LayoutManager = require('controllers/layoutmanager').LayoutManager;
var ScrollerView = scroller.ScrollerCanvasView;
var TextView = require('views/text').TextView;

var _ = require('underscore')._;
var catalog = require('bespin:plugins').catalog;
var keyboardManager = require('keyboard:keyboard').keyboardManager;
var settings = require('settings').settings;

// Caches the theme data for the entire editor (editor, highlighter, and
// gutter).
var editorThemeData = {};

function computeThemeData(themeManager) {
    var plugin = catalog.plugins['text_editor'];
    var provides = plugin.provides;
    var i = provides.length;
    var themeData = {};

    // If a themeManager was passed, try to access the themeData for the
    // `text_editor` plugin.
    if (themeManager) {
        var themestyles = themeManager.themestyles;

        if (themestyles.currentThemeVariables &&
                themestyles.currentThemeVariables['text_editor']) {
            themeData = themestyles.currentThemeVariables['text_editor'];
        }
    }

    while (i--) {
        if (provides[i].ep === 'themevariable') {
            var value = util.mixin(util.clone(provides[i].defaultValue),
                                        themeData[provides[i].name]);

            switch (provides[i].name) {
                case 'gutter':
                case 'editor':
                case 'scroller':
                case 'highlighter':
                    editorThemeData[provides[i].name] = value;
            }
        }
    }
}

// Compute the themeData to make sure there is one when the editor comes up.
computeThemeData();

catalog.registerExtension('themeChange', {
    pointer: computeThemeData
});

/**
 * @class
 *
 * A view responsible for laying out a scrollable text view and its associated
 * gutter view, as well as maintaining a layout manager.
 */
exports.EditorView = function(initialContent) {
    this.elementAppended = new Event();

    this.element = this.container = document.createElement("div");

    var container = this.container;
    container.style.overflow = 'visible';
    container.style.position = 'relative';

    this.scrollOffsetChanged = new Event();
    this.willChangeBuffer = new Event();

    this.selectionChanged = new Event();
    this.textChanged = new Event();

    var gutterView = this.gutterView = new GutterView(container, this);
    var textView = this.textView = new TextView(container, this);
    var verticalScroller = new ScrollerView(this, scroller.LAYOUT_VERTICAL);
    var horizontalScroller = new ScrollerView(this,
        scroller.LAYOUT_HORIZONTAL);
    this.verticalScroller = verticalScroller;
    this.horizontalScroller = horizontalScroller;

    this.completionController = new CompletionController(this);
    this.editorUndoController = new EditorUndoController(this);
    this.searchController = new EditorSearchController(this);

    this._textViewSize = this._oldSize = { width: 0, height: 0 };

    this._themeData = editorThemeData;

    // Create a buffer for the editor and use initialContent as the initial
    // content for the textStorage object.
    this.buffer = new Buffer(null, initialContent);

    // Create all the necessary stuff once the container has been added.
    this.elementAppended.add(function() {
        // Set the font property.
        var fontSize = settings.get('fontsize');
        var fontFace = settings.get('fontface');
        this._font = fontSize + 'px ' + fontFace;

        // Repaint when the theme changes.
        catalog.registerExtension('themeChange', {
            pointer: this._themeVariableChange.bind(this)
        });

        // When the font changes, set our local font property, and repaint.
        catalog.registerExtension('settingChange', {
            match: "font[size|face]",
            pointer: this._fontSettingChanged.bind(this)
        });

        // Likewise when the dimensions change.
        catalog.registerExtension('dimensionsChanged', {
            pointer: this.dimensionsChanged.bind(this)
        });

        // Allow the layout to be recomputed.
        this._dontRecomputeLayout = false;
        this._recomputeLayout();

        var wheelEvent = util.isMozilla ? 'DOMMouseScroll' : 'mousewheel';
        container.addEventListener(wheelEvent, this._onMouseWheel.bind(this),
            false);

        verticalScroller.valueChanged.add(function(value) {
            this.scrollOffset = { y: value };
        }.bind(this));

        horizontalScroller.valueChanged.add(function(value) {
            this.scrollOffset = { x: value };
        }.bind(this));

        this.scrollOffsetChanged.add(function(offset) {
            this._updateScrollOffsetChanged(offset);
        }.bind(this));
    }.bind(this));
};


exports.EditorView.prototype = {
    elementAppended: null,

    textChanged: null,
    selectionChanged: null,

    scrollOffsetChanged: null,
    willChangeBuffer: null,

    _textViewSize: null,

    _textLinesCount: 0,
    _gutterViewWidth: 0,
    _oldSize: null,

    _buffer: null,

    _dontRecomputeLayout: true,

    _themeData: null,

    _layoutManagerSizeChanged: function(size) {
        var fontDimension = this.layoutManager.fontDimension;
        this._textViewSize = {
            width: size.width * fontDimension.characterWidth,
            height: size.height * fontDimension.lineHeight
        };

        if (this._textLinesCount !== size.height) {
            var gutterWidth = this.gutterView.computeWidth();
            if (gutterWidth !== this._gutterViewWidth) {
                this._recomputeLayout(true /* force layout update */);
            } else {
                this.gutterView.invalidate();
            }
            this._textLinesLength = size.height;
        }

        // Clamp the current scrollOffset position.
        this._updateScrollers();
        this.scrollOffset = {};
    },

    _updateScrollers: function() {
        // Don't change anything on the scrollers until the layout is setup.
        if (this._dontRecomputeLayout) {
            return;
        }

        var frame = this.textViewPaddingFrame;
        var width = this._textViewSize.width;
        var height = this._textViewSize.height;
        var scrollOffset = this.scrollOffset;
        var verticalScroller = this.verticalScroller;
        var horizontalScroller = this.horizontalScroller;

        if (height < frame.height) {
            verticalScroller.isVisible = false;
        } else {
            verticalScroller.isVisible = true;
            verticalScroller.proportion = frame.height / height;
            verticalScroller.maximum = height - frame.height;
            verticalScroller.value = scrollOffset.y;
        }

        if (width < frame.width) {
            horizontalScroller.isVisible = false;
        } else {
            horizontalScroller.isVisible = true;
            horizontalScroller.proportion = frame.width / width;
            horizontalScroller.maximum = width - frame.width;
            horizontalScroller.value = scrollOffset.x;
        }
    },

    _onMouseWheel: function(evt) {
        var delta = 0;
        if (evt.wheelDelta) {
            delta = -evt.wheelDelta;
        } else if (evt.detail) {
            delta = evt.detail * 40;
        }

        var isVertical = true;
        if (evt.axis) { // Firefox 3.1 world
            if (evt.axis == evt.HORIZONTAL_AXIS) isVertical = false;
        } else if (evt.wheelDeltaY || evt.wheelDeltaX) {
            if (evt.wheelDeltaX == evt.wheelDelta) isVertical = false;
        } else if (evt.shiftKey) isVertical = false;

        if (isVertical) {
            this.scrollBy(0, delta);
        } else {
            this.scrollBy(delta * 5, 0);
        }

        util.stopEvent(evt);
    },

    scrollTo: function(pos) {
        this.scrollOffset = pos;
    },

    scrollBy: function(deltaX, deltaY) {
        this.scrollOffset = {
            x: this.scrollOffset.x + deltaX,
            y: this.scrollOffset.y + deltaY
        };
    },

    _recomputeLayout: function(forceLayout) {
        // This is necessary as _recomputeLayout is called sometimes when the
        // size of the container is not yet ready (because of FlexBox).
        if (this._dontRecomputeLayout) {
            return;
        }

        var width = this.container.offsetWidth;
        var height = this.container.offsetHeight;

        // Don't recompute unless the size actually changed.
        if (!forceLayout && width == this._oldSize.width
                                    && height == this._oldSize.height) {
            return;
        }

        this._oldSize = {
            width: width,
            height: height
        };

        var gutterWidth = this.gutterView.computeWidth();
        this._gutterViewWidth = gutterWidth;

        this.gutterView.frame = {
            x: 0,
            y: 0,
            width: gutterWidth,
            height: height
        };

        this.textView.frame = {
            x: gutterWidth,
            y: 0,
            width: width - gutterWidth,
            height: height
        };

        // TODO: Get these values from the scroller theme.
        var scrollerPadding = this._themeData.scroller.padding;
        var scrollerSize = this._themeData.scroller.thickness;

        this.horizontalScroller.frame = {
            x: gutterWidth + scrollerPadding,
            y: height - (scrollerSize + scrollerPadding),
            width: width - (gutterWidth + 2 * scrollerPadding + scrollerSize),
            height: scrollerSize
        };

        this.verticalScroller.frame = {
            x: width - (scrollerPadding + scrollerSize),
            y: scrollerPadding,
            width: scrollerSize,
            height: height - (2 * scrollerPadding + scrollerSize)
        };

        // Calls the setter scrollOffset which then clamps the current
        // scrollOffset as needed.
        this.scrollOffset = {};

        this._updateScrollers();
        this.gutterView.invalidate();
        this.textView.invalidate();
        this.verticalScroller.invalidate();
        this.horizontalScroller.invalidate();
    },

    dimensionsChanged: function() {
        this._recomputeLayout();
    },

    /**
     * @property{string}
     *
     * The font to use for the text view and the gutter view. Typically, this
     * value is set via the font settings.
     */
    _font: null,

    _fontSettingChanged: function() {
        var fontSize = settings.get('fontsize');
        var fontFace = settings.get('fontface');
        this._font = fontSize + 'px ' + fontFace;

        // Recompute the layouts.
        this.layoutManager._recalculateMaximumWidth();
        this._layoutManagerSizeChanged(this.layoutManager.size);
        this.textView.invalidate();
    },

    _themeVariableChange: function() {
        // Recompute the entire layout as the gutter might now have a different
        // size. Just calling invalidate() on the gutter wouldn't be enough.
        this._recomputeLayout(true);
    },

    _updateScrollOffsetChanged: function(offset) {
        this.verticalScroller.value = offset.y;
        this.horizontalScroller.value = offset.x;

        this.textView.clippingFrame = { x: offset.x, y: offset.y };

        this.gutterView.clippingFrame = { y: offset.y };

        this._updateScrollers();
        this.gutterView.invalidate();
        this.textView.invalidate();
    },

    /**
     * The text view uses this function to forward key events to the keyboard
     * manager. The editor view is used as a middleman so that it can append
     * predicates as necessary.
     */
    processKeyEvent: function(evt, sender, preds) {
        preds = _(preds).clone();
        preds.completing = this.completionController.isCompleting();
        return keyboardManager.processKeyEvent(evt, sender, preds);
    },

    /**
     * Converts a point in the coordinate system of the document being edited
     * (i.e. of the text view) to the coordinate system of the editor (i.e. of
     * the DOM component containing Bespin).
     */
    convertTextViewPoint: function(pt) {
        var scrollOffset = this.scrollOffset;
        return {
            x: pt.x - scrollOffset.x + this._gutterViewWidth,
            y: pt.y - scrollOffset.y
        };
    },

    // ------------------------------------------------------------------------
    // Helper API:

    /**
     * Replaces the text within a range, as an undoable action.
     *
     * @param {Range} range The range to replace.
     * @param {string} newText The text to insert.
     * @param {boolean} keepSelection True if the selection should be
     *     be preserved, otherwise the cursor is set after newText.
     * @return Returns true if the replacement completed successfully,
     *     otherwise returns false.
     */
    replace: function(range, newText, keepSelection) {
        if (!rangeutils.isRange(range)) {
            throw new Error('replace(): expected range but found "' + range +
                "'");
        }
        if (!util.isString(newText)) {
            throw new Error('replace(): expected text string but found "' +
                text + '"');
        }

        var normalized = rangeutils.normalizeRange(range);

        var view = this.textView;
        var oldSelection = view.getSelectedRange(false);
        return view.groupChanges(function() {
            view.replaceCharacters(normalized, newText);
            if (keepSelection) {
                view.setSelection(oldSelection);
            } else {
                var lines = newText.split('\n');

                var destPosition;
                if (lines.length > 1) {
                    destPosition = {
                        row: range.start.row + lines.length - 1,
                        col: lines[lines.length - 1].length
                    };
                } else {
                    destPosition = rangeutils.addPositions(range.start,
                        { row: 0, col: newText.length });
                }
                view.moveCursorTo(destPosition);
            }
        });
    },

    getText: function(range) {
        if (!rangeutils.isRange(range)) {
            throw new Error('getText(): expected range but found "' + range +
                '"');
        }

        var textStorage = this.layoutManager.textStorage;
        return textStorage.getCharacters(rangeutils.normalizeRange(range));
    },

    /** Scrolls and moves the insertion point to the given line number. */
    setLineNumber: function(lineNumber) {
        if (!util.isNumber(lineNumber)) {
            throw new Error('setLineNumber(): lineNumber must be a number');
        }

        var newPosition = { row: lineNumber - 1, col: 0 };
        this.textView.moveCursorTo(newPosition);
    },

    /** Sets the position of the cursor. */
    setCursor: function(newPosition) {
        if (!rangeutils.isPosition(newPosition)) {
            throw new Error('setCursor(): expected position but found "' +
                newPosition + '"');
        }

        this.textView.moveCursorTo(newPosition);
    },

    /**
     * Group changes so that they are only one undo/redo step.
     * Returns true if the changes were successful.
     */
    changeGroup: function(func) {
        return this.textView.groupChanges(function() {
            func(this);
        }.bind(this));
    },

    /**
     * Adds the supplied tags to the completion manager.
     */
    addTags: function(newTags) {
        this.completionController.tags.add(newTags);
    }
};

Object.defineProperties(exports.EditorView.prototype, {
    themeData: {
        get: function() {
            return this._themeData;
        },

        set: function() {
            throw new Error('themeData can\'t be changed directly.' +
                                ' Use themeManager.');
        }
    },

    font: {
        get: function() {
            return this._font;
        },

        set: function() {
            throw new Error('font can\'t be changed directly.' +
                    ' Use settings fontsize and fontface.');
        }
    },

    buffer: {
        /**
         * Sets a new buffer.
         * The buffer's file has to be loaded when passing to this setter.
         */
        set: function(newBuffer) {
            if (newBuffer === this._buffer) {
                return;
            }

            if (!newBuffer.loadPromise.isResolved()) {
                throw new Error('buffer.set(): the new buffer must first be ' +
                    'loaded!');
            }

            // Was there a former buffer? If yes, then remove some events.
            if (this._buffer !== null) {
                this.layoutManager.sizeChanged.remove(this);
                this.layoutManager.textStorage.changed.remove(this);
                this.textView.selectionChanged.remove(this);
            }

            this.willChangeBuffer(newBuffer);
            catalog.publish(this, 'editorChange', 'buffer', newBuffer);

            this.layoutManager = newBuffer.layoutManager;
            this._buffer = newBuffer;

            var lm = this.layoutManager;
            var tv = this.textView;

            // Watch out for changes to the layoutManager's internal size.
            lm.sizeChanged.add(this,
                this._layoutManagerSizeChanged.bind(this));

            // Map internal events so that developers can listen much easier.
            lm.textStorage.changed.add(this, this.textChanged.bind(this));
            tv.selectionChanged.add(this, this.selectionChanged.bind(this));

            this.textView.setSelection(newBuffer._selectedRange, false);
            this.scrollOffsetChanged(newBuffer._scrollOffset);

            // The layoutManager changed and its size as well. Call the
            // layoutManager.sizeChanged event manually.
            this.layoutManager.sizeChanged(this.layoutManager.size);

            this._recomputeLayout();
        },

        get: function() {
            return this._buffer;
        }
    },

    frame: {
        get: function() {
            return {
                width: this.container.offsetWidth,
                height: this.container.offsetHeight
            };
        }
    },

    textViewPaddingFrame: {
        get: function() {
            var frame = util.clone(this.textView.frame);
            var padding = this.textView.padding;

            frame.width -= padding.left + padding.right;
            frame.height -= padding.top + padding.bottom;
            return frame;
        }
    },

    scrollOffset: {
        set: function(pos) {
            if (pos.x === undefined) pos.x = this.scrollOffset.x;
            if (pos.y === undefined) pos.y = this.scrollOffset.y;

            var frame = this.textViewPaddingFrame;

            if (pos.y < 0) {
                pos.y = 0;
            } else if (this._textViewSize.height < frame.height) {
                pos.y = 0;
            } else if (pos.y + frame.height > this._textViewSize.height) {
                pos.y = this._textViewSize.height - frame.height;
            }

            if (pos.x < 0) {
                pos.x = 0;
            } else if (this._textViewSize.width < frame.width) {
                pos.x = 0;
            } else if (pos.x + frame.width > this._textViewSize.width) {
                pos.x = this._textViewSize.width - frame.width;
            }

            if (pos.x === this.scrollOffset.x && pos.y === this.scrollOffset.y) {
                return;
            }

            this.buffer._scrollOffset = pos;

            this.scrollOffsetChanged(pos);
            catalog.publish(this, 'editorChange', 'scrollOffset', pos);
        },

        get: function() {
            return this.buffer._scrollOffset;
        }
    },

    // -------------------------------------------------------------------------
    // Helper API:

    readOnly: {
        get: function() {
            return this._buffer.model.readOnly;
        },

        set: function(newValue) {
            this._buffer.model.readOnly = newValue;
        }
    },

    focus: {
        get: function() {
            return this.textView.hasFocus;
        },

        set: function(setFocus) {
            if (!util.isBoolean(setFocus)) {
                throw new Error('set focus: expected boolean but found "' +
                                    setFocus + '"');
            }
            this.textView.hasFocus = setFocus;
        }
    },

    selection: {
        /** Returns the currently-selected range. */
        get: function() {
            return util.clone(this.textView.getSelectedRange(false));
        },

        /** Alters the selection. */
        set: function(newSelection) {
            if (!rangeutils.isRange(newSelection)) {
                throw new Error('set selection: position/selection' +
                                    ' must be supplied');
            }

            this.textView.setSelection(newSelection);
        }
    },

    selectedText: {
        /** Returns the text within the given range. */
        get: function() {
            return this.getText(this.selection);
        },

        /** Replaces the current text selection with the given text. */
        set: function(newText) {
            if (!util.isString(newText)) {
                throw new Error('set selectedText: expected string but' +
                    ' found "' + newText + '"');
            }

            return this.replace(this.selection, newText);
        }
    },

    value: {
        /** Returns the current text. */
        get: function() {
            return this.layoutManager.textStorage.value;
        },

        set: function(newValue) {
            if (!util.isString(newValue)) {
                throw new Error('set value: expected string but found "' +
                                        newValue + '"');
            }

            // Use the replace function and not this.model.value = newValue
            // directly as this wouldn't create a new undoable action.
            return this.replace(this.layoutManager.textStorage.range,
                                        newValue, false);
        }
    },

    syntax: {
        /**
         * Returns the initial syntax highlighting context (i.e. the language).
         */
        get: function(newSyntax) {
            return this.layoutManager.syntaxManager.getSyntax();
        },

        /**
         * Sets the initial syntax highlighting context (i.e. the language).
         */
        set: function(newSyntax) {
            if (!util.isString(newSyntax)) {
                throw new Error('set syntax: expected string but found "' +
                                        newValue + '"');
            }

            return this.layoutManager.syntaxManager.setSyntax(newSyntax);
        }
    }
});

});

bespin.tiki.module("text_editor:views/gutter",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');

var CanvasView = require('views/canvas').CanvasView;

/*
 * A view that renders the gutter for the editor.
 *
 * The domNode attribute contains the domNode for this view that should be
 * added to the document appropriately.
 */
exports.GutterView = function(container, editor) {
    CanvasView.call(this, container, true /* preventDownsize */ );

    this.editor = editor;
};

exports.GutterView.prototype = new CanvasView();

util.mixin(exports.GutterView.prototype, {
    drawRect: function(rect, context) {
        var theme = this.editor.themeData.gutter;

        context.fillStyle = theme.backgroundColor;
        context.fillRect(rect.x, rect.y, rect.width, rect.height);

        context.save();

        var paddingLeft = theme.paddingLeft;
        context.translate(paddingLeft, 0);

        var layoutManager = this.editor.layoutManager;
        var range = layoutManager.characterRangeForBoundingRect(rect);
        var endRow = Math.min(range.end.row,
            layoutManager.textLines.length - 1);
        var lineAscent = layoutManager.fontDimension.lineAscent;

        context.fillStyle = theme.color;
        context.font = this.editor.font;

        for (var row = range.start.row; row <= endRow; row++) {
            // TODO: breakpoints
            context.fillText('' + (row + 1), -0.5,
                layoutManager.lineRectForRow(row).y + lineAscent - 0.5);
        }

        context.restore();
    },

    computeWidth: function() {
        var theme = this.editor.themeData.gutter;
        var paddingWidth = theme.paddingLeft + theme.paddingRight;

        var lineNumberFont = this.editor.font;

        var layoutManager = this.editor.layoutManager;
        var lineCount = layoutManager.textLines.length;
        var lineCountStr = '' + lineCount;

        var characterWidth = layoutManager.fontDimension.characterWidth;
        var strWidth = characterWidth * lineCountStr.length;

        return strWidth + paddingWidth;
    }
});

});

bespin.tiki.module("text_editor:views/scroller",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');
var Event = require('events').Event;
var console = require('bespin:console').console;

var Rect = require('utils/rect');

var CanvasView = require('views/canvas').CanvasView;

var LINE_HEIGHT                 = 15;
var MINIMUM_HANDLE_SIZE         = 20;
var NIB_ARROW_PADDING_BEFORE    = 3;
var NIB_ARROW_PADDING_AFTER     = 5;
var NIB_LENGTH                  = 15;
var NIB_PADDING                 = 8;    // 15/2

var LAYOUT_HORIZONTAL = exports.LAYOUT_HORIZONTAL = 0;
var LAYOUT_VERTICAL = exports.LAYOUT_VERTICAL = 1;

exports.ScrollerCanvasView = function(editor, layoutDirection) {
    CanvasView.call(this, editor.container, false /* preventDownsize */,
        true /* clearOnFullInvalid */);
    this.editor = editor;
    this.layoutDirection = layoutDirection;

    var on = function(eventName, func, target) {
        target = target || this.domNode;
        target.addEventListener(eventName, function(evt) {
            func.call(this, evt);
            util.stopEvent(evt);
        }.bind(this), false);
    }.bind(this);

    on('mouseover', this.mouseEntered);
    on('mouseout', this.mouseExited);
    on('mousedown', this.mouseDown);
    // Bind the following events to the window as we want to catch them
    // even when the mouse is outside of the scroller.
    on('mouseup', this.mouseUp, window);
    on('mousemove', this.mouseMove, window);

    this.valueChanged = new Event();
};

exports.ScrollerCanvasView.prototype = new CanvasView();

util.mixin(exports.ScrollerCanvasView.prototype, {
    lineHeight: 20,

    proportion: 0,

    /**
     * @property
     * Specifies the direction of the scroll bar: one of LAYOUT_HORIZONTAL
     * or LAYOUT_VERTICAL.
     *
     * Changes to this value after the view has been created have no effect.
     */
    layoutDirection: LAYOUT_VERTICAL,

    _isVisible: false,

    _maximum: 0,

    _value: 0,

    valueChanged: null,

    /**
     * @property
     * The dimensions of transparent space inside the frame, given as an object
     * with 'left', 'bottom', 'top', and 'right' properties.
     *
     * Note that the scrollerThickness property includes the padding on the
     * sides of the bar.
     */
    padding: { left: 0, bottom: 0, top: 0, right: 0 },

    _mouseDownScreenPoint: null,
    _mouseDownValue: null,
    _isMouseOver: false,
    _scrollTimer: null,
    _mouseEventPosition: null,
    _mouseOverHandle: false,

    _drawNib: function(ctx, alpha) {
        var theme = this.editor.themeData.scroller;
        var fillStyle, arrowStyle, strokeStyle;

        fillStyle   = theme.nibStyle;
        arrowStyle  = theme.nibArrowStyle;
        strokeStyle = theme.nibStrokeStyle;

        var midpoint = Math.floor(NIB_LENGTH / 2);

        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.arc(0, 0, Math.floor(NIB_LENGTH / 2), 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();

        ctx.fillStyle = arrowStyle;
        ctx.beginPath();
        ctx.moveTo(0, -midpoint + NIB_ARROW_PADDING_BEFORE);
        ctx.lineTo(-midpoint + NIB_ARROW_PADDING_BEFORE,
            midpoint - NIB_ARROW_PADDING_AFTER);
        ctx.lineTo(midpoint - NIB_ARROW_PADDING_BEFORE,
            midpoint - NIB_ARROW_PADDING_AFTER);
        ctx.closePath();
        ctx.fill();
    },

    _drawNibs: function(ctx, alpha) {
        var thickness = this._getClientThickness();
        var parentView = this.parentView;
        var value = this._value;
        var maximum = this._maximum;
        var highlighted = this._isHighlighted();

        // Starting nib
        if (highlighted || value !== 0) {
            ctx.save();
            ctx.translate(NIB_PADDING, thickness / 2);
            ctx.rotate(Math.PI * 1.5);
            ctx.moveTo(0, 0);
            this._drawNib(ctx, alpha);
            ctx.restore();
        }

        // Ending nib
        if (highlighted || value !== maximum) {
            ctx.save();
            ctx.translate(this._getClientLength() - NIB_PADDING,
                thickness / 2);
            ctx.rotate(Math.PI * 0.5);
            ctx.moveTo(0, 0);
            this._drawNib(ctx, alpha);
            ctx.restore();
        }
    },

    // Returns the frame of the scroll bar, not counting any padding.
    _getClientFrame: function() {
        var frame = this.frame;
        var padding = this.padding;
        return {
            x:      padding.left,
            y:      padding.top,
            width:  frame.width - (padding.left + padding.right),
            height: frame.height - (padding.top + padding.bottom)
        };
    },

    // Returns the length of the scroll bar, not counting any padding. Equal to
    // the width or height of the client frame, depending on the layout
    // direction.
    _getClientLength: function() {
        var clientFrame = this._getClientFrame();
        switch (this.layoutDirection) {
        case LAYOUT_HORIZONTAL:
            return clientFrame.width;
        case LAYOUT_VERTICAL:
            return clientFrame.height;
        default:
            console.error("unknown layout direction");
            return null;
        }
    },

    // Returns the thickness of the scroll bar, not counting any padding.
    _getClientThickness: function() {
        var padding = this.padding;
        var scrollerThickness = this.editor.themeData.scroller.thickness;

        switch (this.layoutDirection) {
        case LAYOUT_VERTICAL:
            return scrollerThickness - (padding.left + padding.right);
        case LAYOUT_HORIZONTAL:
            return scrollerThickness - (padding.top + padding.bottom);
        default:
            console.error("unknown layout direction");
            return null;
        }
    },

    // The length of the scroll bar, counting the padding. Equal to frame.width
    // or frame.height, depending on the layout direction of the bar.
    // Read-only.
    _getFrameLength: function() {
        switch (this.layoutDirection) {
        case LAYOUT_HORIZONTAL:
            return this.frame.width;
        case LAYOUT_VERTICAL:
            return this.frame.height;
        default:
            console.error("unknown layout direction");
            return null;
        }
    },

    // The dimensions of the gutter (the middle area between the buttons, which
    // contains the handle or knob).
    _getGutterFrame: function() {
        var clientFrame = this._getClientFrame();
        var thickness = this._getClientThickness();
        switch (this.layoutDirection) {
        case LAYOUT_VERTICAL:
            return {
                x:      clientFrame.x,
                y:      clientFrame.y + NIB_LENGTH,
                width:  thickness,
                height: Math.max(0, clientFrame.height - 2*NIB_LENGTH)
            };
        case LAYOUT_HORIZONTAL:
            return {
                x:      clientFrame.x + NIB_LENGTH,
                y:      clientFrame.y,
                width:  Math.max(0, clientFrame.width - 2*NIB_LENGTH),
                height: thickness
            };
        default:
            console.error("unknown layout direction");
            return null;
        }
    },

    // The length of the gutter, equal to gutterFrame.width or
    // gutterFrame.height depending on the scroll bar's layout direction.
    _getGutterLength: function() {
        var gutterFrame = this._getGutterFrame();
        var gutterLength;
        switch (this.layoutDirection) {
        case LAYOUT_HORIZONTAL:
            gutterLength = gutterFrame.width;
            break;
        case LAYOUT_VERTICAL:
            gutterLength = gutterFrame.height;
            break;
        default:
            console.error("unknown layout direction");
            break;
        }
        return gutterLength;
    },

    // Returns the dimensions of the handle or knob.
    _getHandleFrame: function() {
        var gutterFrame = this._getGutterFrame();
        var handleOffset = this._getHandleOffset();
        var handleLength = this._getHandleLength();
        switch (this.layoutDirection) {
        case LAYOUT_VERTICAL:
            return {
                x:      gutterFrame.x,
                y:      gutterFrame.y + handleOffset,
                width:  gutterFrame.width,
                height: handleLength
            };
        case LAYOUT_HORIZONTAL:
            return {
                x:      gutterFrame.x + handleOffset,
                y:      gutterFrame.y,
                width:  handleLength,
                height: gutterFrame.height
            };
        }
    },

    // Returns the length of the handle or knob.
    _getHandleLength: function() {
        var gutterLength = this._getGutterLength();
        return Math.max(gutterLength * this.proportion, MINIMUM_HANDLE_SIZE);
    },

    // Returns the starting offset of the handle or knob.
    _getHandleOffset: function() {
        var maximum = this._maximum;
        if (maximum === 0) {
            return 0;
        }

        var gutterLength = this._getGutterLength();
        var handleLength = this._getHandleLength();
        var emptyGutterLength = gutterLength - handleLength;

        return emptyGutterLength * this._value / maximum;
    },

    // Determines whether the scroll bar is highlighted.
    _isHighlighted: function() {
        return this._isMouseOver === true ||
            this._mouseDownScreenPoint !== null;
    },

    _segmentForMouseEvent: function(evt) {
        var point = { x: evt.layerX, y: evt.layerY };
        var clientFrame = this._getClientFrame();
        var padding = this.padding;

        if (!Rect.pointInRect(point, clientFrame)) {
            return null;
        }

        var layoutDirection = this.layoutDirection;
        switch (layoutDirection) {
        case LAYOUT_HORIZONTAL:
            if ((point.x - padding.left) < NIB_LENGTH) {
                return 'nib-start';
            } else if (point.x >= clientFrame.width - NIB_LENGTH) {
                return 'nib-end';
            }
            break;
        case LAYOUT_VERTICAL:
            if ((point.y - padding.top) < NIB_LENGTH) {
                return 'nib-start';
            } else if (point.y >= clientFrame.height - NIB_LENGTH) {
                return 'nib-end';
            }
            break;
        default:
            console.error("unknown layout direction");
            break;
        }

        var handleFrame = this._getHandleFrame();
        if (Rect.pointInRect(point, handleFrame)) {
            return 'handle';
        }

        switch (layoutDirection) {
        case LAYOUT_HORIZONTAL:
            if (point.x < handleFrame.x) {
                return 'gutter-before';
            } else if (point.x >= handleFrame.x + handleFrame.width) {
                return 'gutter-after';
            }
            break;
        case LAYOUT_VERTICAL:
            if (point.y < handleFrame.y) {
                return 'gutter-before';
            } else if (point.y >= handleFrame.y + handleFrame.height) {
                return 'gutter-after';
            }
            break;
        default:
            console.error("unknown layout direction");
            break;
        }

        console.error("_segmentForMouseEvent: point ", point,
            " outside view with handle frame ", handleFrame,
            " and client frame ", clientFrame);
        return null;
    },

    /**
     * Adjusts the canvas view's frame to match the parent container's frame.
     */
    adjustFrame: function() {
        var parentFrame = this.frame;
        this.set('layout', {
            left:   0,
            top:    0,
            width:  parentFrame.width,
            height: parentFrame.height
        });
    },

    drawRect: function(rect, ctx) {
        // Only draw when visible.
        if (!this._isVisible) {
            return;
        }

        var highlighted = this._isHighlighted();
        var theme = this.editor.themeData.scroller;
        var alpha = (highlighted) ? theme.fullAlpha : theme.particalAlpha;

        var frame = this.frame;
        ctx.clearRect(0, 0, frame.width, frame.height);

        // Begin master drawing context
        ctx.save();

        // Translate so that we're only drawing in the padding.
        var padding = this.padding;
        ctx.translate(padding.left, padding.top);

        var handleFrame = this._getHandleFrame();
        var gutterLength = this._getGutterLength();
        var thickness = this._getClientThickness();
        var halfThickness = thickness / 2;

        var layoutDirection = this.layoutDirection;
        var handleOffset = this._getHandleOffset() + NIB_LENGTH;
        var handleLength = this._getHandleLength();

        if (layoutDirection === LAYOUT_VERTICAL) {
            // The rest of the drawing code assumes the scroll bar is
            // horizontal. Create that fiction by installing a 90 degree
            // rotation.
            ctx.translate(thickness + 1, 0);
            ctx.rotate(Math.PI * 0.5);
        }

        if (gutterLength <= handleLength) {
            return; // Don't display the scroll bar.
        }

        ctx.globalAlpha = alpha;

        if (highlighted) {
            // Draw the scroll track rectangle.
            var clientLength = this._getClientLength();
            ctx.fillStyle = theme.trackFillStyle;
            ctx.fillRect(NIB_PADDING + 0.5, 0.5,
                clientLength - 2*NIB_PADDING, thickness - 1);
            ctx.strokeStyle = theme.trackStrokeStyle;
            ctx.strokeRect(NIB_PADDING + 0.5, 0.5,
                clientLength - 2*NIB_PADDING, thickness - 1);
        }

        var buildHandlePath = function() {
            ctx.beginPath();
            ctx.arc(handleOffset + halfThickness + 0.5,                 // x
                halfThickness,                                          // y
                halfThickness - 0.5, Math.PI / 2, 3 * Math.PI / 2, false);
            ctx.arc(handleOffset + handleLength - halfThickness - 0.5,  // x
                halfThickness,                                          // y
                halfThickness - 0.5, 3 * Math.PI / 2, Math.PI / 2, false);
            ctx.lineTo(handleOffset + halfThickness + 0.5, thickness - 0.5);
            ctx.closePath();
        };
        buildHandlePath();

        // Paint the interior of the handle path.
        var gradient = ctx.createLinearGradient(handleOffset, 0, handleOffset,
            thickness);
        gradient.addColorStop(0, theme.barFillGradientTopStart);
        gradient.addColorStop(0.4, theme.barFillGradientTopStop);
        gradient.addColorStop(0.41, theme.barFillStyle);
        gradient.addColorStop(0.8, theme.barFillGradientBottomStart);
        gradient.addColorStop(1, theme.barFillGradientBottomStop);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Begin handle shine edge context
        ctx.save();
        ctx.clip();

        // Draw the little shines in the handle.
        ctx.fillStyle = theme.barFillStyle;
        ctx.beginPath();
        ctx.moveTo(handleOffset + halfThickness * 0.4, halfThickness * 0.6);
        ctx.lineTo(handleOffset + halfThickness * 0.9, thickness * 0.4);
        ctx.lineTo(handleOffset, thickness * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(handleOffset + handleLength - (halfThickness * 0.4),
            0 + (halfThickness * 0.6));
        ctx.lineTo(handleOffset + handleLength - (halfThickness * 0.9),
            0 + (thickness * 0.4));
        ctx.lineTo(handleOffset + handleLength, 0 + (thickness * 0.4));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        // End handle border context

        // Begin handle outline context
        ctx.save();
        buildHandlePath();
        ctx.strokeStyle = theme.trackStrokeStyle;
        ctx.stroke();
        ctx.restore();
        // End handle outline context

        this._drawNibs(ctx, alpha);

        ctx.restore();
        // End master drawing context
    },

    _repeatAction: function(method, interval) {
        var repeat = method();
        if (repeat !== false) {
            var func = function() {
                this._repeatAction(method, 100);
            }.bind(this);
            this._scrollTimer = setTimeout(func, interval);
        }
    },

    _scrollByDelta: function(delta) {
        this.value = this._value + delta;
    },

    _scrollUpOneLine: function() {
        this._scrollByDelta(-this.lineHeight);
        return true;
    },

    _scrollDownOneLine: function() {
        this._scrollByDelta(this.lineHeight);
        return true;
    },

    /**
     * Scrolls the page depending on the last mouse position. Scrolling is only
     * performed if the mouse is on the segment gutter-before or -after.
     */
    _scrollPage: function() {
        switch (this._segmentForMouseEvent(this._mouseEventPosition)) {
            case 'gutter-before':
                this._scrollByDelta(this._getGutterLength() * -1);
            break;
            case 'gutter-after':
                this._scrollByDelta(this._getGutterLength());
            break;
            case null:
                // The mouse is outside of the scroller. Just wait, until it
                // comes back in.
            break;
            default:
                // Do not continue repeating this function.
                return false;
            break;
        }

        return true;
    },

    mouseDown: function(evt) {
        this._mouseEventPosition = evt;
        this._mouseOverHandle = false;

        var parentView = this.parentView;
        var value = this._value;
        var gutterLength = this._getGutterLength();

        switch (this._segmentForMouseEvent(evt)) {
        case 'nib-start':
            this._repeatAction(this._scrollUpOneLine.bind(this), 500);
            break;
        case 'nib-end':
            this._repeatAction(this._scrollDownOneLine.bind(this), 500);
            break;
        case 'gutter-before':
            this._repeatAction(this._scrollPage.bind(this), 500);
            break;
        case 'gutter-after':
            this._repeatAction(this._scrollPage.bind(this), 500);
            break;
        case 'handle':
            break;
        default:
            console.error("_segmentForMouseEvent returned an unknown value");
            break;
        }

        // The _mouseDownScreenPoint value might be needed although the segment
        // was not the handle at the moment.
        switch (this.layoutDirection) {
        case LAYOUT_HORIZONTAL:
            this._mouseDownScreenPoint = evt.pageX;
            break;
        case LAYOUT_VERTICAL:
            this._mouseDownScreenPoint = evt.pageY;
            break;
        default:
            console.error("unknown layout direction");
            break;
        }
    },

    mouseMove: function(evt) {
        if (this._mouseDownScreenPoint === null) {
            return;
        }

        // Handle the segments. If the current segment is the handle or
        // nothing, then drag the handle around (as null = mouse outside of
        // scrollbar)
        var segment = this._segmentForMouseEvent(evt);
        if (segment == 'handle' || this._mouseOverHandle === true) {
            this._mouseOverHandle = true;
            if (this._scrollTimer !== null) {
                clearTimeout(this._scrollTimer);
                this._scrollTimer = null;
            }

            var eventDistance;
            switch (this.layoutDirection) {
                case LAYOUT_HORIZONTAL:
                    eventDistance = evt.pageX;
                    break;
                case LAYOUT_VERTICAL:
                    eventDistance = evt.pageY;
                    break;
                default:
                    console.error("unknown layout direction");
                    break;
            }

            var eventDelta = eventDistance - this._mouseDownScreenPoint;

            var maximum = this._maximum;
            var oldValue = this._value;
            var gutterLength = this._getGutterLength();
            var handleLength = this._getHandleLength();
            var emptyGutterLength = gutterLength - handleLength;
            var valueDelta = maximum * eventDelta / emptyGutterLength;
            this.value = oldValue + valueDelta;

            this._mouseDownScreenPoint = eventDistance;
        }

        this._mouseEventPosition = evt;
    },

    mouseEntered: function(evt) {
        this._isMouseOver = true;
        this.invalidate();
    },

    mouseExited: function(evt) {
        this._isMouseOver = false;
        this.invalidate();
    },

    mouseUp: function(evt) {
        this._mouseDownScreenPoint = null;
        this._mouseDownValue = null;
        if (this._scrollTimer) {
            clearTimeout(this._scrollTimer);
            this._scrollTimer = null;
        }
        this.invalidate();
    }

    // mouseWheel: function(evt) {
    //     var parentView = this.get('parentView');
    //
    //     var delta;
    //     switch (parentView.get('layoutDirection')) {
    //     case LAYOUT_HORIZONTAL:
    //         delta = evt.wheelDeltaX;
    //         break;
    //     case LAYOUT_VERTICAL:
    //         delta = evt.wheelDeltaY;
    //         break;
    //     default:
    //         console.error("unknown layout direction");
    //         return;
    //     }
    //
    //     parentView.set('value', parentView.get('value') + 2*delta);
    // }
});

Object.defineProperties(exports.ScrollerCanvasView.prototype, {
    isVisible: {
        set: function(isVisible) {
            if (this._isVisible === isVisible) {
                return;
            }

            this._isVisible = isVisible;
            this.domNode.style.display = isVisible ? 'block' : 'none';
            if (isVisible) {
                this.invalidate();
            }
        }
    },

    maximum: {
        set: function(maximum) {
            if (this._value > this._maximum) {
                this._value = this._maximum;
            }

            if (maximum === this._maximum) {
                return;
            }

            this._maximum = maximum;
            this.invalidate();
        }
    },

    value: {
        set: function(value) {
            if (value < 0) {
                value = 0;
            } else if (value > this._maximum) {
                value = this._maximum;
            }

            if (value === this._value) {
                return;
            }

            this._value = value;
            this.valueChanged(value);
            this.invalidate();
        }
    }
});

});

bespin.tiki.module("text_editor:views/text",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var util = require('bespin:util/util');

var Event = require('events').Event;
var CanvasView = require('views/canvas').CanvasView;
var LayoutManager = require('controllers/layoutmanager').LayoutManager;
var Range = require('rangeutils:utils/range');
var Rect = require('utils/rect');
var TextInput = require('views/textinput').TextInput;
var console = require('bespin:console').console;
var settings = require('settings').settings;

// Set this to true to outline all text ranges with a box. This may be useful
// when optimizing syntax highlighting engines.
var DEBUG_TEXT_RANGES = false;


exports.TextView = function(container, editor) {
    CanvasView.call(this, container, true /* preventDownsize */ );
    this.editor = editor;

    // Takes the layoutManager of the editor and uses it.
    var textInput = this.textInput = new TextInput(container, this);

    this.padding = {
        top: 0,
        bottom: 30,
        left: 0,
        right: 30
    };

    this.clippingChanged.add(this.clippingFrameChanged.bind(this));

    var dom = this.domNode;
    dom.style.cursor = "text";
    dom.addEventListener('mousedown', this.mouseDown.bind(this), false);
    dom.addEventListener('mousemove', this.mouseMove.bind(this), false);
    window.addEventListener('mouseup', this.mouseUp.bind(this), false);

    editor.willChangeBuffer.add(this.editorWillChangeBuffer.bind(this));

    // Changeevents.
    this.selectionChanged = new Event();
    this.beganChangeGroup = new Event();
    this.endedChangeGroup = new Event();
    this.willReplaceRange = new Event();
    this.replacedCharacters = new Event();
};

exports.TextView.prototype = new CanvasView();

util.mixin(exports.TextView.prototype, {
    _dragPoint: null,
    _dragTimer: null,
    _enclosingScrollView: null,
    _inChangeGroup: false,
    _insertionPointBlinkTimer: null,
    _insertionPointVisible: true,


    // FIXME: These should be public, not private.
    _keyBuffer: '',
    _keyMetaBuffer: '',
    _keyState: 'start',

    _hasFocus: false,
    _mouseIsDown: false,

    selectionChanged: null,
    beganChangeGroup: null,
    endedChangeGroup: null,
    willReplaceRange: null,
    replacedCharacters: null,

    editorWillChangeBuffer: function(newBuffer) {
        if (this.editor.layoutManager) {
            // Remove events from the old layoutManager.
            var layoutManager = this.editor.layoutManager;
            layoutManager.invalidatedRects.remove(this);
            layoutManager.changedTextAtRow.remove(this);
        }

        // Add the events to the new layoutManager.
        layoutManager = newBuffer.layoutManager;
        layoutManager.invalidatedRects.add(this,
                                this.layoutManagerInvalidatedRects.bind(this));
        layoutManager.changedTextAtRow.add(this,
                                this.layoutManagerChangedTextAtRow.bind(this));
    },

    /**
     * Called by the textInput whenever the textInput gained the focus.
     */
    didFocus: function() {
        // Call _setFocus and not this.hasFocus as we have to pass the
        // 'isFromTextInput' flag.
        this._setFocus(true, true /* fromTextInput */);
    },

    /**
     * Called by the textInput whenever the textinput lost the focus.
     */
    didBlur: function() {
        // Call _setFocus and not this.hasFocus as we have to pass the
        // 'isFromTextInput' flag.
        this._setFocus(false, true /* fromTextInput */);
    },

    _drag: function() {
        var point = this._dragPoint;
        var offset = Rect.offsetFromRect(this.clippingFrame, point);

        this.moveCursorTo(this._selectionPositionForPoint({
                x:  point.x - offset.x,
                y:  point.y - offset.y
            }), true);
    },

    // Draws a single insertion point.
    _drawInsertionPoint: function(rect, context) {
        if (!this._insertionPointVisible) {
            return;
        }

        var range = this.editor.buffer._selectedRange;
        var characterRect = this.editor.layoutManager.
            characterRectForPosition(range.start);
        var x = Math.floor(characterRect.x), y = characterRect.y;
        var width = Math.ceil(characterRect.width);
        var height = characterRect.height;

        context.save();

        var theme = this.editor.themeData.editor;
        if (this._hasFocus) {
            context.strokeStyle = theme.cursorColor;
            context.beginPath();
            context.moveTo(x + 0.5, y);
            context.lineTo(x + 0.5, y + height);
            context.closePath();
            context.stroke();
        } else {
            context.fillStyle = theme.unfocusedCursorBackgroundColor;
            context.fillRect(x + 0.5, y, width - 0.5, height);
            context.strokeStyle = theme.unfocusedCursorColor;
            context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
        }

        context.restore();
    },

    _drawLines: function(rect, context) {
        var layoutManager = this.editor.layoutManager;
        var textLines = layoutManager.textLines;
        var lineAscent = layoutManager.fontDimension.lineAscent;
        var themeHighlighter = this.editor.themeData.highlighter

        context.save();
        context.font = this.editor.font;

        var range = layoutManager.characterRangeForBoundingRect(rect);
        var rangeStart = range.start, rangeEnd = range.end;
        var startRow = rangeStart.row, endRow = rangeEnd.row;
        for (var row = startRow; row <= endRow; row++) {
            var textLine = textLines[row];
            if (util.none(textLine)) {
                continue;
            }

            // Clamp the start column and end column to fit within the line
            // text.
            var characters = textLine.characters;
            var length = characters.length;
            var endCol = Math.min(rangeEnd.col, length);
            var startCol = rangeStart.col;
            if (startCol >= length) {
                continue;
            }

            // Get the color ranges, or synthesize one if it doesn't exist. We
            // have to be tolerant of bad data, because we may be drawing ahead
            // of the syntax highlighter.
            var colorRanges = textLine.colors;
            if (colorRanges == null) {
                colorRanges = [];
            }

            // Figure out which color range to start in.
            var colorIndex = 0;
            while (colorIndex < colorRanges.length &&
                    startCol < colorRanges[colorIndex].start) {
                colorIndex++;
            }

            var col = (colorIndex < colorRanges.length)
                      ? colorRanges[colorIndex].start
                      : startCol;

            // And finally draw the line.
            while (col < endCol) {
                var colorRange = colorRanges[colorIndex];
                var end = colorRange != null ? colorRange.end : endCol;
                var tag = colorRange != null ? colorRange.tag : 'plain';

                var color = themeHighlighter.hasOwnProperty(tag)
                            ? themeHighlighter[tag]
                            : 'red';
                context.fillStyle = color;

                var pos = { row: row, col: col };
                var rect = layoutManager.characterRectForPosition(pos);

                var snippet = characters.substring(col, end);
                context.fillText(snippet, rect.x, rect.y + lineAscent);

                if (DEBUG_TEXT_RANGES) {
                    context.strokeStyle = color;
                    context.strokeRect(rect.x + 0.5, rect.y + 0.5,
                        rect.width * snippet.length - 1, rect.height - 1);
                }

                col = end;
                colorIndex++;
            }
        }

        context.restore();
    },

    // Draws the background highlight for selections.
    _drawSelectionHighlight: function(rect, context) {
        var theme = this.editor.themeData.editor;
        var fillStyle = this._hasFocus ?
            theme.selectedTextBackgroundColor :
            theme.unfocusedCursorBackgroundColor;
        var layoutManager = this.editor.layoutManager;

        context.save();

        var range = Range.normalizeRange(this.editor.buffer._selectedRange);
        context.fillStyle = fillStyle;
        layoutManager.rectsForRange(range).forEach(function(rect) {
            context.fillRect(rect.x, rect.y, rect.width, rect.height);
        });

        context.restore();
    },

    // Draws either the selection or the insertion point.
    _drawSelection: function(rect, context) {
        if (this._rangeIsInsertionPoint(this.editor.buffer._selectedRange)) {
            this._drawInsertionPoint(rect, context);
        } else {
            this._drawSelectionHighlight(rect, context);
        }
    },

    _getVirtualSelection: function(startPropertyAsWell) {
        var selectedRange = this.editor.buffer._selectedRange;
        var selectedRangeEndVirtual = this.editor.buffer._selectedRangeEndVirtual;

        return {
            start:  startPropertyAsWell && selectedRangeEndVirtual ?
                    selectedRangeEndVirtual : selectedRange.start,
            end:    selectedRangeEndVirtual || selectedRange.end
        };
    },

    _invalidateSelection: function() {
        var adjustRect = function(rect) {
            return {
                x:      rect.x - 1,
                y:      rect.y,
                width:  rect.width + 2,
                height: rect.height
            };
        };

        var layoutManager = this.editor.layoutManager;
        var range = Range.normalizeRange(this.editor.buffer._selectedRange);
        if (!this._rangeIsInsertionPoint(range)) {
            var rects = layoutManager.rectsForRange(range);
            rects.forEach(function(rect) {
                this.invalidateRect(adjustRect(rect));
            }, this);

            return;
        }

        var rect = layoutManager.characterRectForPosition(range.start);
        this.invalidateRect(adjustRect(rect));
    },

    _isReadOnly: function() {
        return this.editor.layoutManager.textStorage.readOnly;
    },

    _keymappingChanged: function() {
        this._keyBuffer = '';
        this._keyState = 'start';
    },

    _performVerticalKeyboardSelection: function(offset) {
        var textStorage = this.editor.layoutManager.textStorage;
        var selectedRangeEndVirtual = this.editor.buffer._selectedRangeEndVirtual;
        var oldPosition = selectedRangeEndVirtual !== null ?
            selectedRangeEndVirtual : this.editor.buffer._selectedRange.end;
        var newPosition = Range.addPositions(oldPosition,
            { row: offset, col: 0 });

        this.moveCursorTo(newPosition, true, true);
    },

    _rangeIsInsertionPoint: function(range) {
        return Range.isZeroLength(range);
    },

    _rearmInsertionPointBlinkTimer: function() {
        if (!this._insertionPointVisible) {
            // Make sure it ends up visible.
            this.blinkInsertionPoint();
        }

        if (this._insertionPointBlinkTimer !== null) {
            clearInterval(this._insertionPointBlinkTimer);
        }

        this._insertionPointBlinkTimer = setInterval(
                                            this.blinkInsertionPoint.bind(this),
                                            750);
    },

    // Moves the selection, if necessary, to keep all the positions pointing to
    // actual characters.
    _repositionSelection: function() {
        var textLines = this.editor.layoutManager.textLines;
        var textLineLength = textLines.length;

        var range = this.editor.buffer._selectedRange;
        var newStartRow = Math.min(range.start.row, textLineLength - 1);
        var newEndRow = Math.min(range.end.row, textLineLength - 1);
        var startLine = textLines[newStartRow];
        var endLine = textLines[newEndRow];
        this.setSelection({
            start: {
                row: newStartRow,
                col: Math.min(range.start.col, startLine.characters.length)
            },
            end: {
                row: newEndRow,
                col: Math.min(range.end.col, endLine.characters.length)
            }
        });
    },

    _scrollPage: function(scrollUp) {
        var clippingFrame = this.clippingFrame;
        var lineAscent = this.editor.layoutManager.fontDimension.lineAscent;
        this.editor.scrollBy(0,
                    (clippingFrame.height + lineAscent) * (scrollUp ? -1 : 1));
    },

    _scrollWhileDragging: function() {
        var point = this._dragPoint;
        var newPoint = this.computeWithClippingFrame(point.layerX, point.layerY);
        util.mixin(this._dragPoint, newPoint);
        this._drag();
    },

    // Returns the character closest to the given point, obeying the selection
    // rules (including the partialFraction field).
    _selectionPositionForPoint: function(point) {
        var position = this.editor.layoutManager.characterAtPoint(point);
        return position.partialFraction < 0.5 ? position :
            Range.addPositions(position, { row: 0, col: 1 });
    },

    _syntaxManagerUpdatedSyntaxForRows: function(startRow, endRow) {
        if (startRow === endRow) {
            return;
        }

        var layoutManager = this.editor.layoutManager;
        layoutManager.updateTextRows(startRow, endRow);

        layoutManager.rectsForRange({
                start:  { row: startRow, col: 0 },
                end:    { row: endRow,   col: 0 }
            }).forEach(this.invalidateRect, this);
    },

    /**
     * Toggles the visible state of the insertion point.
     */
    blinkInsertionPoint: function() {
        this._insertionPointVisible = !this._insertionPointVisible;
        this._invalidateSelection();
    },

    /**
     * Returns the selected characters.
     */
    copy: function() {
        return this.getSelectedCharacters();
    },

    /**
     * Removes the selected characters from the text buffer and returns them.
     */
    cut: function() {
        var cutData = this.getSelectedCharacters();

        if (cutData != '') {
            this.performBackspaceOrDelete(false);
        }

        return cutData;
    },

    /**
     * This is where the editor is painted from head to toe. Pitiful tricks are
     * used to draw as little as possible.
     */
    drawRect: function(rect, context) {
        context.fillStyle = this.editor.themeData.editor.backgroundColor;
        context.fillRect(rect.x, rect.y, rect.width, rect.height);

        this._drawSelection(rect, context);
        this._drawLines(rect, context);
    },

    /**
     * Directs keyboard input to this text view.
     */
    focus: function() {
        this.textInput.focus();
    },

    /** Returns the location of the insertion point in pixels. */
    getInsertionPointPosition: function() {
        var editor = this.editor;
        var range = editor.buffer._selectedRange;
        var rect = editor.layoutManager.characterRectForPosition(range.start);
        return { x: rect.x, y: rect.y };
    },

    /**
     * Returns the characters that are currently selected as a string, or the
     * empty string if none are selected.
     */
    getSelectedCharacters: function() {
        return this._rangeIsInsertionPoint(this.editor.buffer._selectedRange) ? '' :
            this.editor.layoutManager.textStorage.getCharacters(Range.
            normalizeRange(this.editor.buffer._selectedRange));
    },

    /*
     * Returns the currently selected range.
     *
     * @param raw If true, the direction of the selection is preserved: the
     *            'start' field will be the selection origin, and the 'end'
     *            field will always be the selection tail.
     */
    getSelectedRange: function(raw) {
        if (!raw) {
            return Range.normalizeRange(this.editor.buffer._selectedRange);
        } else {
            return this.editor.buffer._selectedRange;
        }
    },

    /**
     * Groups all the changes in the callback into a single undoable action.
     * Nested change groups are supported; one undoable action is created for
     * the entire group of changes.
     */
    groupChanges: function(performChanges) {
        if (this._isReadOnly()) {
            return false;
        }

        if (this._inChangeGroup) {
            performChanges();
            return true;
        }

        this._inChangeGroup = true;
        this.beganChangeGroup(this, this.editor.buffer._selectedRange);

        try {
            performChanges();
        } catch (e) {
            console.error("Error in groupChanges(): " + e);
            this._inChangeGroup = false;
            this.endedChangeGroup(this, this.editor.buffer._selectedRange);
            return false;
        } finally {
            this._inChangeGroup = false;
            this.endedChangeGroup(this, this.editor.buffer._selectedRange);
            return true;
        }
    },

    /**
     * Replaces the selection with the given text and updates the selection
     * boundaries appropriately.
     *
     * @return True if the text view was successfully updated; false if the
     *     change couldn't be made because the text view is read-only.
     */
    insertText: function(text) {
        if (this._isReadOnly()) {
            return false;
        }

        this.groupChanges(function() {
            var textStorage = this.editor.layoutManager.textStorage;
            var range = Range.normalizeRange(this.editor.buffer._selectedRange);

            this.replaceCharacters(range, text);

            // Update the selection to point immediately after the inserted
            // text.
            var lines = text.split('\n');

            var destPosition;
            if (lines.length > 1) {
                destPosition = {
                    row:    range.start.row + lines.length - 1,
                    col: lines[lines.length - 1].length
                };
            } else {
                destPosition = Range.addPositions(range.start,
                    { row: 0, col: text.length });
            }

            this.moveCursorTo(destPosition);
        }.bind(this));

        return true;
    },

    /**
     * Returns true if the given character is a word separator.
     */
    isDelimiter: function(character) {
        return '"\',;.!~@#$%^&*?[]<>():/\\-+ \t'.indexOf(character) !== -1;
    },

    keyDown: function(evt) {
        if (evt.charCode === 0 || evt._charCode === 0) {    // hack for Fx
            var preds = { isTextView: true };
            return this.editor.processKeyEvent(evt, this, preds);
        } else if (evt.keyCode === 9) {
            // Stops the tab. Otherwise the editor can lose focus.
            evt.preventDefault();
        } else {
            // This is a real keyPress event. This should not be handled,
            // otherwise the textInput mixin can't detect the key events.
            return false;
        }
    },

    /**
     * Runs the syntax highlighter from the given row to the end of the visible
     * range, and repositions the selection.
     */
    layoutManagerChangedTextAtRow: function(sender, row) {
        this._repositionSelection();
    },

    /**
     * Marks the given rectangles as invalid.
     */
    layoutManagerInvalidatedRects: function(sender, rects) {
        rects.forEach(this.invalidateRect, this);
    },

    mouseDown: function(evt) {
        util.stopEvent(evt);

        this.hasFocus = true;
        this._mouseIsDown = true;

        var point = this.computeWithClippingFrame(evt.layerX, evt.layerY);
        util.mixin(point, { layerX: evt.layerX, layerY: evt.layerY});

        switch (evt.detail) {
        case 1:
            var pos = this._selectionPositionForPoint(point);
            this.moveCursorTo(pos, evt.shiftKey);
            break;

        // Select the word under the cursor.
        case 2:
            var pos = this._selectionPositionForPoint(point);
            var line = this.editor.layoutManager.textStorage.lines[pos.row];

            // If there is nothing to select in this line, then skip.
            if (line.length === 0) {
                return true;
            }

            pos.col -= (pos.col == line.length ? 1 : 0);
            var skipOnDelimiter = !this.isDelimiter(line[pos.col]);

            var thisTextView = this;
            var searchForDelimiter = function(pos, dir) {
                for (pos; pos > -1 && pos < line.length; pos += dir) {
                    if (thisTextView.isDelimiter(line[pos]) ===
                            skipOnDelimiter) {
                        break;
                    }
                }
                return pos + (dir == 1 ? 0 : 1);
            };

            var colFrom = searchForDelimiter(pos.col, -1);
            var colTo   = searchForDelimiter(pos.col, 1);

            this.moveCursorTo({ row: pos.row, col: colFrom });
            this.moveCursorTo({ row: pos.row, col: colTo }, true);

            break;

        case 3:
            var lines = this.editor.layoutManager.textStorage.lines;
            var pos = this._selectionPositionForPoint(point);
            this.setSelection({
                start: {
                    row: pos.row,
                    col: 0
                },
                end: {
                    row: pos.row,
                    col: lines[pos.row].length
                }
            });
            break;
        }

        this._dragPoint = point;
        this._dragTimer = setInterval(this._scrollWhileDragging.bind(this), 100);
    },

    mouseMove: function(evt) {
        if (this._mouseIsDown) {
            this._dragPoint = this.computeWithClippingFrame(evt.layerX, evt.layerY);
            util.mixin(this._dragPoint, { layerX: evt.layerX, layerY: evt.layerY});
            this._drag();
        }
    },

    mouseUp: function(evt) {
        this._mouseIsDown = false;
        if (this._dragTimer !== null) {
            clearInterval(this._dragTimer);
            this._dragTimer = null;
        }
    },

    /**
     * Moves the cursor.
     *
     * @param position{Position} The position to move the cursor to.
     *
     * @param select{bool} Whether to preserve the selection origin. If this
     *        parameter is false, the selection is removed, and the insertion
     *        point moves to @position. Typically, this parameter is set when
     *        the mouse is being dragged or the shift key is held down.
     *
     * @param virtual{bool} Whether to save the current end position as the
     *        virtual insertion point. Typically, this parameter is set when
     *        moving vertically.
     */
    moveCursorTo: function(position, select, virtual) {
        var textStorage = this.editor.layoutManager.textStorage;
        var positionToUse = textStorage.clampPosition(position);

        this.setSelection({
            start:  select ? this.editor.buffer._selectedRange.start : positionToUse,
            end:    positionToUse
        });

        if (virtual) {
            var lineCount = textStorage.lines.length;
            var row = position.row, col = position.col;
            if (row > 0 && row < lineCount) {
                this.editor.buffer._selectedRangeEndVirtual = position;
            } else {
                this.editor.buffer._selectedRangeEndVirtual = {
                    row: row < 1 ? 0 : lineCount - 1,
                    col: col
                };
            }
        } else {
            this.editor.buffer._selectedRangeEndVirtual = null;
        }

        this.scrollToPosition(this.editor.buffer._selectedRange.end);
    },

    moveDown: function() {
        var selection = this._getVirtualSelection();
        var range = Range.normalizeRange(selection);
        var position;
        if (this._rangeIsInsertionPoint(this.editor.buffer._selectedRange)) {
            position = range.end;
        } else {
            // Yes, this is actually what Cocoa does... weird, huh?
            position = { row: range.end.row, col: range.start.col };
        }
        position = Range.addPositions(position, { row: 1, col: 0 });

        this.moveCursorTo(position, false, true);
    },

    moveLeft: function() {
        var range = Range.normalizeRange(this.editor.buffer._selectedRange);
        if (this._rangeIsInsertionPoint(range)) {
            this.moveCursorTo(this.editor.layoutManager.textStorage.
                displacePosition(range.start, -1));
        } else {
            this.moveCursorTo(range.start);
        }
    },

    moveRight: function() {
        var range = Range.normalizeRange(this.editor.buffer._selectedRange);
        if (this._rangeIsInsertionPoint(range)) {
            this.moveCursorTo(this.editor.layoutManager.textStorage.
                displacePosition(range.end, 1));
        } else {
            this.moveCursorTo(range.end);
        }
    },

    moveUp: function() {
        var range = Range.normalizeRange(this._getVirtualSelection(true));
        position = Range.addPositions({
            row: range.start.row,
            col: this._getVirtualSelection().end.col
        }, { row: -1, col: 0 });

        this.moveCursorTo(position, false, true);
    },

    parentViewFrameChanged: function() {
        arguments.callee.base.apply(this, arguments);
        this._resize();
    },

    /**
     * As an undoable action, replaces the characters within the old range with
     * the supplied characters.
     *
     * TODO: Factor this out into the undo controller. The fact that commands
     * have to go through the view in order to make undoable changes is
     * counterintuitive.
     *
     * @param oldRange{Range}    The range of characters to modify.
     * @param characters{string} The string to replace the characters with.
     *
     * @return True if the changes were successfully made; false if the changes
     *     couldn't be made because the editor is read-only.
     */
    replaceCharacters: function(oldRange, characters) {
        if (this._isReadOnly()) {
            return false;
        }

        this.groupChanges(function() {
            oldRange = Range.normalizeRange(oldRange);
            this.willReplaceRange(this, oldRange);

            var textStorage = this.editor.layoutManager.textStorage;
            textStorage.replaceCharacters(oldRange, characters);
            this.replacedCharacters(this, oldRange, characters);
        }.bind(this));

        return true;
    },

    /**
     * Performs a delete-backward or delete-forward operation.
     *
     * @param isBackspace{boolean} If true, the deletion proceeds backward (as if
     *     the backspace key were pressed); otherwise, deletion proceeds forward.
     *
     * @return True if the operation was successfully performed; false if the
     *     operation failed because the editor is read-only.
     */
    performBackspaceOrDelete: function(isBackspace) {
        if (this._isReadOnly()) {
            return false;
        }

        var model = this.editor.layoutManager.textStorage;

        var lines = model.lines;
        var line = '', count = 0;
        var tabstop = settings.get('tabstop');
        var range = this.getSelectedRange();

        if (Range.isZeroLength(range)) {
            if (isBackspace) {
                var start = range.start;
                line = lines[start.row];
                var preWhitespaces = line.substring(0, start.col).
                                                    match(/\s*$/)[0].length;

                // If there are less then n-tabstop whitespaces in front, OR
                // the current cursor position is not n times tabstop, THEN
                // delete only 1 character.
                if (preWhitespaces < tabstop
                        || (start.col - tabstop) % tabstop != 0) {
                    count = 1;
                } else {
                    // Otherwise delete tabstop whitespaces.
                    count = tabstop;
                }

                range = {
                    start:  model.displacePosition(start, count * -1),
                    end:    range.end
                };
            } else {
                var end = range.end;
                line = lines[end.row];
                var trailingWhitespaces = line.substring(end.col).
                                                    match(/^\s*/)[0].length;

                // If there are less then n-tabstop whitespaces after the cursor
                // position, then delete only 1 character. Otherwise delete
                // tabstop whitespaces.
                if (trailingWhitespaces < tabstop) {
                    count = 1;
                } else {
                    count = tabstop;
                }

                range = {
                    start:  range.start,
                    end:    model.displacePosition(range.end, count)
                };
            }
        }

        this.groupChanges(function() {
            this.replaceCharacters(range, '');

            // Position the insertion point at the start of all the ranges that
            // were just deleted.
            this.moveCursorTo(range.start);
        }.bind(this));

        return true;
    },

    /** Removes all buffered keys. */
    resetKeyBuffers: function() {
        this._keyBuffer = '';
        this._keyMetaBuffer = '';
    },

    /**
     * If the text view is inside a scrollable view, scrolls down by one page.
     */
    scrollPageDown: function() {
        this._scrollPage(false);
    },

    /**
     * If the text view is inside a scrollable view, scrolls up by one page.
     */
    scrollPageUp: function() {
        this._scrollPage(true);
    },

    /**
     * If this view is in a scrollable container, scrolls to the given
     * character position.
     */
    scrollToPosition: function(position) {
        var rect = this.editor.layoutManager.characterRectForPosition(position);
        var rectX = rect.x, rectY = rect.y;
        var rectWidth = rect.width, rectHeight = rect.height;

        var frame = this.clippingFrame;
        var frameX = frame.x, frameY = frame.y;

        var padding = this.padding;
        var width = frame.width - padding.right;
        var height = frame.height - padding.bottom;

        var x;
        if (rectX >= frameX + 30 /* This is a hack to allow dragging to the left */
                    && rectX + rectWidth < frameX + width) {
            x = frameX;
        } else {
            x = rectX - width / 2 + rectWidth / 2;
        }

        var y;
        if (rectY >= frameY && rectY + rectHeight < frameY + height) {
            y = frameY;
        } else {
            y = rectY - height / 2 + rectHeight / 2;
        }

        this.editor.scrollTo({ x: x, y: y });
    },

    /**
     * Selects all characters in the buffer.
     */
    selectAll: function() {
        var lines = this.editor.layoutManager.textStorage.lines;
        var lastRow = lines.length - 1;
        this.setSelection({
            start:  { row: 0, col: 0 },
            end:    { row: lastRow, col: lines[lastRow].length }
        });
    },

    selectDown: function() {
        this._performVerticalKeyboardSelection(1);
    },

    selectLeft: function() {
        this.moveCursorTo((this.editor.layoutManager.textStorage.
            displacePosition(this.editor.buffer._selectedRange.end, -1)), true);
    },

    selectRight: function() {
        this.moveCursorTo((this.editor.layoutManager.textStorage.
            displacePosition(this.editor.buffer._selectedRange.end, 1)), true);
    },

    selectUp: function() {
        this._performVerticalKeyboardSelection(-1);
    },

    /**
     * Directly replaces the current selection with a new one.
     */
    setSelection: function(newRange, ensureVisible) {
        var textStorage = this.editor.layoutManager.textStorage;

        newRange = textStorage.clampRange(newRange);
        if (Range.equal(newRange, this.editor.buffer._selectedRange)) {
            return;
        }

        // Invalidate the old selection.
        this._invalidateSelection();

        // Set the new selection and invalidate it.
        this.editor.buffer._selectedRange = newRange =
                                                textStorage.clampRange(newRange);
        this._invalidateSelection();

        if (this._hasFocus) {
            this._rearmInsertionPointBlinkTimer();
        }

        if (ensureVisible) {
            this.scrollToPosition(newRange.end);
        }

        this.selectionChanged(newRange);
        catalog.publish(this.editor, 'editorChange', 'selection', newRange);
    },

    textInserted: function(text) {
        // We don't handle the new line char at this point.
        if (text === '\n') {
            return;
        }

        var preds = { isTextView: true, isCommandKey: false };
        if (!this.editor.processKeyEvent(text, this, preds)) {
            this.insertText(text);
            this.resetKeyBuffers();
        }
    },

    /**
     * Changes the internal hasFocus flag if the current hasFocus value is not
     * equal to the parameter 'value'. If 'fromTextInput' is true, then
     * the textInput.focus() and textInput.blur() is not called. This is
     * necessary as otherwise the textInput detects the blur event, calls
     * hasFocus = false and the _setFocus function calls textInput.blur() again.
     * If the textInput was blured, because the entire page lost the focus, then
     * the foucs is not reset to the textInput when the page gains the focus again.
     */
    _setFocus: function(value, fromTextInput) {
        if (value == this._hasFocus) {
            return;
        }

        this._hasFocus = value;

        if (this._hasFocus) {
            this._rearmInsertionPointBlinkTimer();
            this._invalidateSelection();
            if (!fromTextInput) {
                 this.textInput.focus();
            }
        } else {
            if (this._insertionPointBlinkTimer) {
                clearInterval(this._insertionPointBlinkTimer);
                this._insertionPointBlinkTimer = null;
            }
            this._insertionPointVisible = true;
            this._invalidateSelection();
            if (!fromTextInput) {
                 this.textInput.blur();
            }
        }
    }
});

Object.defineProperties(exports.TextView.prototype, {
    hasFocus: {
        get: function() {
            return this._hasFocus;
        },

        set: function(value) {
            this._setFocus(value, false /* fromTextInput*/);
        }
    }
});

});

bespin.tiki.module("text_editor:views/textinput",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');
var Event = require('events').Event;

var KeyUtil = require('keyboard:keyutil');

/**
 * @namespace
 *
 * This class provides a hidden text input to provide events similar to those
 * defined in the DOM Level 3 specification. It allows views to support
 * internationalized text input via non-US keyboards, dead keys, and/or IMEs.
 * It also provides support for copy and paste. Currently, an invisible
 * textarea is used, but in the future this module should use
 * DOM 3 TextInput events directly where available.
 *
 * To use this class, instantiate it and provide the optional functions
 *   - copy: function() { return 'text for clipboard' }
 *   - cut: function() { 'Cut some text'; return 'text for clipboard'}
 *   - textInserted: function(newInsertedText) { 'handle new inserted text'; }
 * Note: Pasted text is provided through the textInserted(pastedText) function.
 *
 * You can also provide an DOM node to take focus from by providing the optional
 * "takeFocusFrom" parameter.
 *
 * The DOM node created for text input is in the "domNode" attribute
 * and that caller should add the DOM node to the document in the appropriate
 * place.
 */
exports.TextInput = function(container, delegate) {
    var domNode = this.domNode = document.createElement('textarea');
    domNode.setAttribute('style', 'position: absolute; z-index: -99999; ' +
          'width: 0px; height: 0px; margin: 0px; outline: none; border: 0;');
         // 'z-index: 100; top: 20px; left: 20px; width: 50px; ' +
         // 'height: 50px');

    container.appendChild(domNode);

    this.delegate = delegate;

    this._attachEvents();
};

exports.TextInput.prototype = {
    _composing: false,

    domNode: null,

    delegate: null,

    // This function doesn't work on WebKit! The textContent comes out empty...
    _textFieldChanged: function() {
        if (this._composing || this._ignore) {
            return;
        }

        var textField = this.domNode;
        var text = textField.value;
        // On FF textFieldChanged is called sometimes although nothing changed.
        // -> don't call textInserted() in such a case.
        if (text == '') {
            return;
        }
        textField.value = '';

        this._textInserted(text);
    },

    _copy: function() {
        var copyData = false;
        var delegate = this.delegate;
        if (delegate && delegate.copy) {
            copyData = delegate.copy();
        }
        return copyData;
    },

    _cut: function() {
        var cutData = false;
        var delegate = this.delegate;
        if (delegate && delegate.cut) {
            cutData = delegate.cut();
        }
        return cutData;
    },

    _textInserted: function(text) {
        var delegate = this.delegate;
        if (delegate && delegate.textInserted) {
            delegate.textInserted(text);
        }
    },

    _setValueAndSelect: function(text) {
        var textField = this.domNode;
        textField.value = text;
        textField.select();
    },

    /**
     * Gives focus to the field editor so that input events will be
     * delivered to the view. If you override willBecomeKeyResponderFrom(),
     * you should call this function in your implementation.
     */
    focus: function() {
        this.domNode.focus();
    },

    /**
     * Removes focus from the invisible text input so that input events are no
     * longer delivered to this view. If you override willLoseKeyResponderTo(),
     * you should call this function in your implementation.
     */
     blur: function() {
        this.domNode.blur();
    },

    /**
     * Attaches notification listeners to the text field so that your view will
     * be notified of events. If you override this method, you should call
     * that function as well.
     */
    _attachEvents: function() {
        var textField = this.domNode, self = this;

        // Listen focus/blur event.
        textField.addEventListener('focus', function(evt) {
            if (self.delegate && self.delegate.didFocus) {
                self.delegate.didFocus();
            }
        }, false);
        textField.addEventListener('blur', function(evt) {
            if (self.delegate && self.delegate.didBlur) {
                self.delegate.didBlur();
            }
        }, false);

        KeyUtil.addKeyDownListener(textField, function(evt) {
            if (self.delegate && self.delegate.keyDown) {
                return self.delegate.keyDown(evt);
            } else {
                return false;
            }
        });

        // No way that I can see around this ugly browser sniffing, without
        // more complicated hacks. No browsers have a complete enough
        // implementation of DOM 3 events at the current time (12/2009). --pcw
        if (util.isWebKit) {    // Chrome too
            // On Chrome the compositionend event is fired as well as the
            // textInput event, but only one of them has to be handled.
            if (!util.isChrome) {
                textField.addEventListener('compositionend', function(evt) {
                    self._textInserted(evt.data);
                }, false);
            }
            textField.addEventListener('textInput', function(evt) {
                self._textInserted(evt.data);
            }, false);
            textField.addEventListener('paste', function(evt) {
                self._textInserted(evt.clipboardData.
                    getData('text/plain'));
                evt.preventDefault();
            }, false);
        } else {
            var textFieldChangedFn = self._textFieldChanged.bind(self);

            // Same as above, but executes after all pending events. This
            // ensures that content gets added to the text field before the
            // value field is read.
            var textFieldChangedLater = function() {
                window.setTimeout(textFieldChangedFn, 0);
            };

            textField.addEventListener('keydown', textFieldChangedLater,
                false);
            textField.addEventListener('keypress', textFieldChangedFn, false);
            textField.addEventListener('keyup', textFieldChangedFn, false);

            textField.addEventListener('compositionstart', function(evt) {
                self._composing = true;
            }, false);
            textField.addEventListener('compositionend', function(evt) {
                self._composing = false;
                self._textFieldChanged();
            }, false);

            textField.addEventListener('paste', function(evt) {
                // FIXME: This is ugly and could result in extraneous text
                // being included as part of the text if extra DOMNodeInserted
                // or DOMCharacterDataModified events happen to be in the queue
                // when this function runs. But until Fx supports TextInput
                // events, there's nothing better we can do.

                // Waits till the paste content is pasted to the textarea.
                // Sometimes a delay of 0 is too short for Fx. In such a case
                // the keyUp events occur a little bit later and the pasted
                // content is detected there.
                self._setValueAndSelect('');
                window.setTimeout(function() {
                    self._textFieldChanged();
                }, 0);
            }, false);
        }

        // Here comes the code for copy and cut...

        // This is the basic copy and cut function. Depending on the
        // OS and browser this function needs to be extended.
        var copyCutBaseFn = function(evt) {
            // Get the data that should be copied/cutted.
            var copyCutData = evt.type.indexOf('copy') != -1 ?
                            self._copy() :
                            self._cut();
            // Set the textField's value equal to the copyCutData.
            // After this function is called, the real copy or cut
            // event takes place and the selected text in the
            // textField is pushed to the OS's clipboard.
            self._setValueAndSelect(copyCutData);
        };

        // For all browsers that are not Safari running on Mac.
        if (!(util.isWebKit && !util.isChrome && util.isMac)) {
            var copyCutMozillaFn = false;
            if (util.isMozilla) {
                // If the browser is Mozilla like, the copyCut function has to
                // be extended.
                copyCutMozillaFn = function(evt) {
                    // Call the basic copyCut function.
                    copyCutBaseFn(evt);

                    self._ignore = true;
                    window.setTimeout(function() {
                        self._setValueAndSelect('');
                        self._ignore = false;
                    }, 0);
                };
            }
            textField.addEventListener('copy', copyCutMozillaFn ||
                copyCutBaseFn, false);
            textField.addEventListener('cut',  copyCutMozillaFn ||
                copyCutBaseFn, false);
         } else {
            // For Safari on Mac (only!) the copy and cut event only occurs if
            // you have some text selected. Fortunately, the beforecopy and
            // beforecut event occurs before the copy or cut event does so we
            // can put the to be copied or cutted text in the textarea.

            // Also, the cut event is fired twice. If it's fired twice within a
            // certain time period, the second call will be skipped.
            var lastCutCall = new Date().getTime();
            var copyCutSafariMacFn = function(evt) {
                var doCut = evt.type.indexOf('cut') != -1;
                if (doCut && new Date().getTime() - lastCutCall < 10) {
                    return;
                }

                // Call the basic copyCut function.
                copyCutBaseFn(evt);

                if (doCut) {
                    lastCutCall = new Date().getTime();
                }
            };

            textField.addEventListener('beforecopy', copyCutSafariMacFn,
                false);
            textField.addEventListener('beforecut',  copyCutSafariMacFn,
                false);
        }
    }
};


});

bespin.tiki.module("text_editor:index",function(require,exports,module) {

});
;bespin.tiki.register("::less", {
    name: "less",
    dependencies: {  }
});
bespin.tiki.module("less:index",function(require,exports,module) {
"define metadata";
({
    "description": "Leaner CSS",
    "url": "http://lesscss.org",
    "dependencies": {},
    "provides": [],
    "keywords": ["css", "parser", "lesscss", "browser"],
    "author": "Alexis Sellier <self@cloudhead.net>",
    "contributors": [],
    "version": "1.0.11"
});
"end";

// --- Begin less.js ---

//
// LESS - Leaner CSS v1.0.11
// http://lesscss.org
// 
// Copyright (c) 2010, Alexis Sellier
// Licensed under the MIT license.
//

// Tell the LESS library that this is a dist build. Important when using the
// dist build as a one-file CommonJS package.
var __LESS_DIST__ = true;

// ecma-5.js
//
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson
// dantman Daniel Friesen

//
// Array
//
if (!Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]" ||
               (obj instanceof Array);
    };
}
if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        var res = new Array(len);
        var thisp = arguments[1];

        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(thisp, this[i], i, this);
            }
        }
        return res;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function (block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++) {
            if (block.call(thisp, this[i])) {
                values.push(this[i]);
            }
        }
        return values;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        var i = 0;

        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1) throw new TypeError();

        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }
                // if array contains no values, no initial value to return
                if (++i >= len) throw new TypeError();
            } while (true);
        }
        for (; i < len; i++) {
            if (i in this) {
                rv = fun.call(null, rv, this[i], i, this);
            }
        }
        return rv;
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (value /*, fromIndex */ ) {
        var length = this.length;
        var i = arguments[1] || 0;

        if (!length)     return -1;
        if (i >= length) return -1;
        if (i < 0)       i += length;

        for (; i < length; i++) {
            if (!Object.prototype.hasOwnProperty.call(this, i)) { continue }
            if (value === this[i]) return i;
        }
        return -1;
    };
}

//
// Object
//
if (!Object.keys) {
    Object.keys = function (object) {
        var keys = [];
        for (var name in object) {
            if (Object.prototype.hasOwnProperty.call(object, name)) {
                keys.push(name);
            }
        }
        return keys;
    };
}

//
// String
//
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}
if (typeof(require) !== 'undefined') {
    var less = exports;

    if (typeof(__LESS_DIST__) === 'undefined') {
        var tree = require('less/tree');
    } else {
        var tree = {};
    }
} else {
    var less = tree = {};
}
//
// less.js - parser
//
//    A relatively straight-forward recursive-descent parser.
//    There is no tokenization/lexing stage, the input is parsed
//    in one sweep.
//
//    To make the parser fast enough to run in the browser, several
//    optimization had to be made:
//
//    - Instead of the more commonly used technique of slicing the
//      input string on every match, we use global regexps (/g),
//      and move the `lastIndex` pointer on match, foregoing `slice()`
//      completely. This gives us a 3x speed-up.
//
//    - Matching on a huge input is often cause of slowdowns,
//      especially with the /g flag. The solution to that is to
//      chunkify the input: we split it by /\n\n/, just to be on
//      the safe side. The chunks are stored in the `chunks` var,
//      `j` holds the current chunk index, and `current` holds
//      the index of the current chunk in relation to `input`.
//      This gives us an almost 4x speed-up.
//
//    - In many cases, we don't need to match individual tokens;
//      for example, if a value doesn't hold any variables, operations
//      or dynamic references, the parser can effectively 'skip' it,
//      treating it as a literal.
//      An example would be '1px solid #000' - which evaluates to itself,
//      we don't need to know what the individual components are.
//      The drawback, of course is that you don't get the benefits of
//      syntax-checking on the CSS. This gives us a 50% speed-up in the parser,
//      and a smaller speed-up in the code-gen.
//
//
//    Token matching is done with the `$` function, which either takes
//    a terminal string or regexp, or a non-terminal function to call.
//    It also takes care of moving all the indices forwards.
//
//
less.Parser = function Parser(env) {
    var input,       // LeSS input string
        i,           // current index in `input`
        j,           // current chunk
        furthest,    // furthest index the parser has gone to
        chunks,      // chunkified input
        current,     // index of current chunk, in `input`
        inputLength,
        parser;

    var that = this;

    // This function is called after all files
    // have been imported through `@import`.
    var finish = function () {};

    var imports = this.imports = {
        paths: env && env.paths || [],  // Search paths, when importing
        queue: [],                      // Files which haven't been imported yet
        files: {},                      // Holds the imported parse trees
        push: function (path, callback) {
            var that = this;
            this.queue.push(path);

            //
            // Import a file asynchronously
            //
            less.Parser.importer(path, this.paths, function (root) {
                that.queue.splice(that.queue.indexOf(path), 1); // Remove the path from the queue
                that.files[path] = root;                        // Store the root

                callback(root);

                if (that.queue.length === 0) { finish() }       // Call `finish` if we're done importing
            });
        }
    };

    //
    // Parse from a token, regexp or string, and move forward if match
    //
    function $(tok) {
        var match, args, length, c, index, endIndex;

        //
        // Non-terminal
        //
        if (tok instanceof Function) {
            return tok.call(parser.parsers);
        //
        // Terminal
        //
        //     Either match a single character in the input,
        //     or match a regexp in the current chunk (chunk[j]).
        //
        } else if (typeof(tok) === 'string') {
            match = input.charAt(i) === tok ? tok : null;
            length = 1;

        //  1. We move to the next chunk, if necessary.
        //  2. Set the `lastIndex` to be relative
        //     to the current chunk, and try to match in it.
        //  3. Make sure we matched at `index`. Because we use
        //     the /g flag, the match could be anywhere in the
        //     chunk. We have to make sure it's at our previous
        //     index, which we stored in [2].
        //
        } else {
            if (i >= current + chunks[j].length &&
                j < chunks.length - 1) { // 1.
                current += chunks[j++].length;
            }
            tok.lastIndex = index =  i - current; // 2.
            match = tok.exec(chunks[j]);

            if (match) {
                length = match[0].length;
                if (tok.lastIndex - length !== index) { return } // 3.
            }
        }

        // The match is confirmed, add the match length to `i`,
        // and consume any extra white-space characters (' ' || '\n')
        // which come after that. The reason for this is that LeSS's
        // grammar is mostly white-space insensitive.
        //
        if (match) {
            i += length;
            endIndex = current + chunks[j].length;

            while (i <= endIndex) {
                c = input.charCodeAt(i);
                if (! (c === 32 || c === 10 || c === 9)) { break }
                i++;
            }

            if(typeof(match) === 'string') {
                return match;
            } else {
                return match.length === 1 ? match[0] : match;
            }
        }
    }

    // Same as $(), but don't change the state of the parser,
    // just return the match.
    function peek(tok) {
        var match;

        if (typeof(tok) === 'string') {
            return input.charAt(i) === tok;
        } else {
            tok.lastIndex = i;

            if ((match = tok.exec(input)) &&
               (tok.lastIndex - match[0].length === i)) {
                return match;
            }
        }
    }

    this.env = env || {};

    // The optimization level dictates the thoroughness of the parser,
    // the lower the number, the less nodes it will create in the tree.
    // This could matter for debugging, or if you want to access
    // the individual nodes in the tree.
    this.optimization = ('optimization' in this.env) ? this.env.optimization : 1;

    //
    // The Parser
    //
    return parser = {

        imports: imports,
        //
        // Parse an input string into an abstract syntax tree,
        // call `callback` when done.
        //
        parse: function (str, callback) {
            var root, start, end, zone, line, lines, buff = [], c, error = null;

            i = j = current = furthest = 0;
            chunks = [];
            input = str.replace(/\r\n/g, '\n');

            // Split the input into chunks,
            // delimited by /\n\n/ and 
            // removing comments (see rationale above),
            // depending on the level of optimization.
            if (that.optimization > 0) {
                input = input.replace(/\/\*(?:[^*]|\*+[^\/*])*\*+\//g, function (comment) {
                    return that.optimization > 1 ? '' : comment.replace(/\n(\s*\n)+/g, '\n');
                });
                chunks = input.split(/^(?=\n)/mg);
            } else {
                chunks = [input];
            }
            inputLength = input.length;

            // Start with the primary rule.
            // The whole syntax tree is held under a Ruleset node,
            // with the `root` property set to true, so no `{}` are
            // output. The callback is called when the input is parsed.
            root = new(tree.Ruleset)([], $(this.parsers.primary));
            root.root = true;

            root.toCSS = (function (toCSS) {
                var line, lines, column;

                return function () {
                    try {
                        return toCSS.call(this);
                    } catch (e) {
                        lines = input.split('\n');
                        line = (input.slice(0, e.index).match(/\n/g) || "").length + 1;
                        for (var n = e.index, column = -1;
                                 n >= 0 && input.charAt(n) !== '\n';
                                 n--) { column++ }

                        throw {
                            name: "NameError",
                            message: e.message,
                            line: line,
                            column: column,
                            extract: [
                                lines[line - 2],
                                lines[line - 1],
                                lines[line]
                            ]
                        };
                    }
                };
            })(root.toCSS);

            // If `i` is smaller than the `input.length - 1`,
            // it means the parser wasn't able to parse the whole
            // string, so we've got a parsing error.
            //
            // We try to extract a \n delimited string,
            // showing the line where the parse error occured.
            // We split it up into two parts (the part which parsed,
            // and the part which didn't), so we can color them differently.
            if (i < input.length - 1) {
                i = furthest;
                lines = input.split('\n');
                line = (input.slice(0, i).match(/\n/g) || "").length + 1;

                for (var n = i, column = -1; n >= 0 && input.charAt(n) !== '\n'; n--) { column++ }

                error = {
                    name: "ParseError",
                    message: "Syntax Error on line " + line,
                    filename: env.filename,
                    line: line,
                    column: column,
                    extract: [
                        lines[line - 2],
                        lines[line - 1],
                        lines[line]
                    ]
                };
            }

            if (this.imports.queue.length > 0) {
                finish = function () { callback(error, root) };
            } else {
                callback(error, root);
            }
        },

        //
        // Here in, the parsing rules/functions
        //
        // The basic structure of the syntax tree generated is as follows:
        //
        //   Ruleset ->  Rule -> Value -> Expression -> Entity
        //
        // Here's some LESS code:
        //
        //    .class {
        //      color: #fff;
        //      border: 1px solid #000;
        //      width: @w + 4px;
        //      > .child {...}
        //    }
        //
        // And here's what the parse tree might look like:
        //
        //     Ruleset (Selector '.class', [
        //         Rule ("color",  Value ([Expression [Color #fff]]))
        //         Rule ("border", Value ([Expression [Dimension 1px][Keyword "solid"][Color #000]]))
        //         Rule ("width",  Value ([Expression [Operation "+" [Variable "@w"][Dimension 4px]]]))
        //         Ruleset (Selector [Element '>', '.child'], [...])
        //     ])
        //
        //  In general, most rules will try to parse a token with the `$()` function, and if the return
        //  value is truly, will return a new node, of the relevant type. Sometimes, we need to check
        //  first, before parsing, that's when we use `peek()`.
        //
        parsers: {
            //
            // The `primary` rule is the *entry* and *exit* point of the parser.
            // The rules here can appear at any level of the parse tree.
            //
            // The recursive nature of the grammar is an interplay between the `block`
            // rule, which represents `{ ... }`, the `ruleset` rule, and this `primary` rule,
            // as represented by this simplified grammar:
            //
            //     primary  →  (ruleset | rule)+
            //     ruleset  →  selector+ block
            //     block    →  '{' primary '}'
            //
            // Only at one point is the primary rule not called from the
            // block rule: at the root level.
            //
            primary: function () {
                var node, root = [];

                while (node = $(this.mixin.definition) || $(this.rule)    ||  $(this.ruleset) ||
                              $(this.mixin.call)       || $(this.comment) ||
                              $(/[\n\s]+/g)            || $(this.directive)) {
                    root.push(node);
                }
                return root;
            },

            // We create a Comment node for CSS comments `/* */`,
            // but keep the LeSS comments `//` silent, by just skipping
            // over them.
            comment: function () {
                var comment;

                if (input.charAt(i) !== '/') return;

                if (comment = $(/\/\*(?:[^*]|\*+[^\/*])*\*+\/\n?/g)) {
                    return new(tree.Comment)(comment);
                } else {
                    return $(/\/\/.*/g);
                }
            },

            //
            // Entities are tokens which can be found inside an Expression
            //
            entities: {
                //
                // A string, which supports escaping " and '
                //
                //     "milky way" 'he\'s the one!'
                //
                quoted: function () {
                    var str;
                    if (input.charAt(i) !== '"' && input.charAt(i) !== "'") return;

                    if (str = $(/"((?:[^"\\\r\n]|\\.)*)"|'((?:[^'\\\r\n]|\\.)*)'/g)) {
                        return new(tree.Quoted)(str[0], str[1] || str[2]);
                    }
                },

                //
                // A catch-all word, such as:
                //
                //     black border-collapse
                //
                keyword: function () {
                    var k;
                    if (k = $(/[A-Za-z-]+/g)) { return new(tree.Keyword)(k) }
                },

                //
                // A function call
                //
                //     rgb(255, 0, 255)
                //
                // We also try to catch IE's `alpha()`, but let the `alpha` parser
                // deal with the details.
                //
                // The arguments are parsed with the `entities.arguments` parser.
                //
                call: function () {
                    var name, args;

                    if (! (name = $(/([a-zA-Z0-9_-]+|%)\(/g))) return;

                    if (name[1].toLowerCase() === 'alpha') { return $(this.alpha) }

                    args = $(this.entities.arguments);

                    if (! $(')')) return;

                    if (name) { return new(tree.Call)(name[1], args) }
                },
                arguments: function () {
                    var args = [], arg;

                    while (arg = $(this.expression)) {
                        args.push(arg);
                        if (! $(',')) { break }
                    }
                    return args;
                },
                literal: function () {
                    return $(this.entities.dimension) ||
                           $(this.entities.color) ||
                           $(this.entities.quoted);
                },

                //
                // Parse url() tokens
                //
                // We use a specific rule for urls, because they don't really behave like
                // standard function calls. The difference is that the argument doesn't have
                // to be enclosed within a string, so it can't be parsed as an Expression.
                //
                url: function () {
                    var value;

                    if (input.charAt(i) !== 'u' || !$(/url\(/g)) return;
                    value = $(this.entities.quoted) || $(/[-a-zA-Z0-9_%@$\/.&=:;#+?]+/g);
                    if (! $(')')) throw new(Error)("missing closing ) for url()");

                    return new(tree.URL)(value.value ? value : new(tree.Anonymous)(value));
                },

                //
                // A Variable entity, such as `@fink`, in
                //
                //     width: @fink + 2px
                //
                // We use a different parser for variable definitions,
                // see `parsers.variable`.
                //
                variable: function () {
                    var name, index = i;

                    if (input.charAt(i) === '@' && (name = $(/@[a-zA-Z0-9_-]+/g))) {
                        return new(tree.Variable)(name, index);
                    }
                },

                //
                // A Hexadecimal color
                //
                //     #4F3C2F
                //
                // `rgb` and `hsl` colors are parsed through the `entities.call` parser.
                //
                color: function () {
                    var rgb;

                    if (input.charAt(i) === '#' && (rgb = $(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g))) {
                        return new(tree.Color)(rgb[1]);
                    }
                },

                //
                // A Dimension, that is, a number and a unit
                //
                //     0.5em 95%
                //
                dimension: function () {
                    var value, c = input.charCodeAt(i);
                    if ((c > 57 || c < 45) || c === 47) return;

                    if (value = $(/(-?[0-9]*\.?[0-9]+)(px|%|em|pc|ex|in|deg|s|ms|pt|cm|mm)?/g)) {
                        return new(tree.Dimension)(value[1], value[2]);
                    }
                }
            },

            //
            // The variable part of a variable definition. Used in the `rule` parser
            //
            //     @fink:
            //
            variable: function () {
                var name;

                if (input.charAt(i) === '@' && (name = $(/(@[a-zA-Z0-9_-]+)\s*:/g))) { return name[1] }
            },

            //
            // A font size/line-height shorthand
            //
            //     small/12px
            //
            // We need to peek first, or we'll match on keywords and dimensions
            //
            shorthand: function () {
                var a, b;

                if (! peek(/[@\w.-]+\/[@\w.-]+/g)) return;

                if ((a = $(this.entity)) && $('/') && (b = $(this.entity))) {
                    return new(tree.Shorthand)(a, b);
                }
            },

            //
            // Mixins
            //
            mixin: {
                //
                // A Mixin call, with an optional argument list
                //
                //     #mixins > .square(#fff);
                //     .rounded(4px, black);
                //     .button;
                //
                // The `while` loop is there because mixins can be
                // namespaced, but we only support the child and descendant
                // selector for now.
                //
                call: function () {
                    var elements = [], e, c, args, index = i;

                    while (e = $(/[#.][a-zA-Z0-9_-]+/g)) {
                        elements.push(new(tree.Element)(c, e));
                        c = $('>');
                    }
                    $('(') && (args = $(this.entities.arguments)) && $(')');

                    if (elements.length > 0 && ($(';') || peek('}'))) {
                        return new(tree.mixin.Call)(elements, args, index);
                    }
                },

                //
                // A Mixin definition, with a list of parameters
                //
                //     .rounded (@radius: 2px, @color) {
                //        ...
                //     }
                //
                // Until we have a finer grained state-machine, we have to
                // do a look-ahead, to make sure we don't have a mixin call.
                // See the `rule` function for more information.
                //
                // We start by matching `.rounded (`, and then proceed on to
                // the argument list, which has optional default values.
                // We store the parameters in `params`, with a `value` key,
                // if there is a value, such as in the case of `@radius`.
                //
                // Once we've got our params list, and a closing `)`, we parse
                // the `{...}` block.
                //
                definition: function () {
                    var name, params = [], match, ruleset, param, value;

                    if (input.charAt(i) !== '.' || peek(/[^{]*(;|})/g)) return;

                    if (match = $(/([#.][a-zA-Z0-9_-]+)\s*\(/g)) {
                        name = match[1];

                        while (param = $(/@[\w-]+/g) || $(this.entities.literal)
                                                     || $(this.entities.keyword)) {
                            // Variable
                            if (param[0] === '@') {
                                if ($(':')) {
                                    if (value = $(this.expression)) {
                                        params.push({ name: param, value: value });
                                    } else {
                                        throw new(Error)("Expected value");
                                    }
                                } else {
                                    params.push({ name: param });
                                }
                            } else {
                                params.push({ value: param });
                            }
                            if (! $(',')) { break }
                        }
                        if (! $(')')) throw new(Error)("Expected )");

                        ruleset = $(this.block);

                        if (ruleset) {
                            return new(tree.mixin.Definition)(name, params, ruleset);
                        }
                    }
                }
            },

            //
            // Entities are the smallest recognized token,
            // and can be found inside a rule's value.
            //
            entity: function () {
                return $(this.entities.literal) || $(this.entities.variable) || $(this.entities.url) ||
                       $(this.entities.call)    || $(this.entities.keyword);
            },

            //
            // A Rule terminator. Note that we use `peek()` to check for '}',
            // because the `block` rule will be expecting it, but we still need to make sure
            // it's there, if ';' was ommitted.
            //
            end: function () {
                return $(';') || peek('}');
            },

            //
            // IE's alpha function
            //
            //     alpha(opacity=88)
            //
            alpha: function () {
                var value;

                if (! $(/opacity=/gi)) return;
                if (value = $(/[0-9]+/g) || $(this.entities.variable)) {
                    if (! $(')')) throw new(Error)("missing closing ) for alpha()");
                    return new(tree.Alpha)(value);
                }
            },

            //
            // A Selector Element
            //
            //     div
            //     + h1
            //     #socks
            //     input[type="text"]
            //
            // Elements are the building blocks for Selectors,
            // they are made out of a `Combinator` (see combinator rule),
            // and an element name, such as a tag a class, or `*`.
            //
            element: function () {
                var e, t;

                c = $(this.combinator);
                e = $(/[.#:]?[a-zA-Z0-9_-]+/g) || $('*') || $(this.attribute) || $(/\([^)@]+\)/g);

                if (e) { return new(tree.Element)(c, e) }
            },

            //
            // Combinators combine elements together, in a Selector.
            //
            // Because our parser isn't white-space sensitive, special care
            // has to be taken, when parsing the descendant combinator, ` `,
            // as it's an empty space. We have to check the previous character
            // in the input, to see if it's a ` ` character. More info on how
            // we deal with this in *combinator.js*.
            //
            combinator: function () {
                var match;
                if (match = $(/[+>~]/g) || $('&') || $(/::/g)) {
                    return new(tree.Combinator)(match);
                } else {
                    return new(tree.Combinator)(input.charAt(i - 1) === " " ? " " : null);
                }
            },

            //
            // A CSS Selector
            //
            //     .class > div + h1
            //     li a:hover
            //
            // Selectors are made out of one or more Elements, see above.
            //
            selector: function () {
                var sel, e, elements = [], match;

                while (e = $(this.element)) { elements.push(e) }

                if (elements.length > 0) { return new(tree.Selector)(elements) }
            },
            tag: function () {
                return $(/[a-zA-Z][a-zA-Z-]*[0-9]?/g) || $('*');
            },
            attribute: function () {
                var attr = '', key, val, op;

                if (! $('[')) return;

                if (key = $(/[a-z-]+/g) || $(this.entities.quoted)) {
                    if ((op = $(/[|~*$^]?=/g)) &&
                        (val = $(this.entities.quoted) || $(/[\w-]+/g))) {
                        attr = [key, op, val.toCSS ? val.toCSS() : val].join('');
                    } else { attr = key }
                }

                if (! $(']')) return;

                if (attr) { return "[" + attr + "]" }
            },

            //
            // The `block` rule is used by `ruleset` and `mixin.definition`.
            // It's a wrapper around the `primary` rule, with added `{}`.
            //
            block: function () {
                var content;

                if ($('{') && (content = $(this.primary)) && $('}')) {
                    return content;
                }
            },

            //
            // div, .class, body > p {...}
            //
            ruleset: function () {
                var selectors = [], s, rules, match, memo = i;

                if (match = peek(/([a-z.#: _-]+)[\s\n]*\{/g)) {
                    i += match[0].length - 1;
                    selectors = [new(tree.Selector)([new(tree.Element)(null, match[1])])];
                } else {
                    while (s = $(this.selector)) {
                        selectors.push(s);
                        if (! $(',')) { break }
                    }
                    if (s) $(this.comment);
                }

                if (selectors.length > 0 && (rules = $(this.block))) {
                    return new(tree.Ruleset)(selectors, rules);
                } else {
                    // Backtrack
                    furthest = i;
                    i = memo;
                }
            },
            rule: function () {
                var value;
                var memo = i;

                if (name = $(this.property) || $(this.variable)) {
                    if ((name.charAt(0) != '@') && (match = peek(/([^@+\/*(;{}-]*);/g))) {
                        i += match[0].length - 1;
                        value = new(tree.Anonymous)(match[1]);
                    } else if (name === "font") {
                        value = $(this.font);
                    } else {
                        value = $(this.value);
                    }

                    if ($(this.end)) {
                        return new(tree.Rule)(name, value, memo);
                    } else {
                        furthest = i;
                        i = memo;
                    }
                }
            },

            //
            // An @import directive
            //
            //     @import "lib";
            //
            // Depending on our environemnt, importing is done differently:
            // In the browser, it's an XHR request, in Node, it would be a
            // file-system operation. The function used for importing is
            // stored in `import`, which we pass to the Import constructor.
            //
            "import": function () {
                var path;
                if ($(/@import\s+/g) &&
                    (path = $(this.entities.quoted) || $(this.entities.url)) &&
                    $(';')) {
                    return new(tree.Import)(path, imports);
                }
            },

            //
            // A CSS Directive
            //
            //     @charset "utf-8";
            //
            directive: function () {
                var name, value, rules, types;

                if (input.charAt(i) !== '@') return;

                if (value = $(this['import'])) {
                    return value;
                } else if (name = $(/@media|@page/g)) {
                    types = $(/[^{]+/g).trim();
                    if (rules = $(this.block)) {
                        return new(tree.Directive)(name + " " + types, rules);
                    }
                } else if (name = $(/@[-a-z]+/g)) {
                    if (name === '@font-face') {
                        if (rules = $(this.block)) {
                            return new(tree.Directive)(name, rules);
                        }
                    } else if ((value = $(this.entity)) && $(';')) {
                        return new(tree.Directive)(name, value);
                    }
                }
            },
            font: function () {
                var value = [], expression = [], weight, shorthand, font, e;

                while (e = $(this.shorthand) || $(this.entity)) {
                    expression.push(e);
                }
                value.push(new(tree.Expression)(expression));

                if ($(',')) {
                    while (e = $(this.expression)) {
                        value.push(e);
                        if (! $(',')) { break }
                    }
                }
                return new(tree.Value)(value, $(this.important));
            },

            //
            // A Value is a comma-delimited list of Expressions
            //
            //     font-family: Baskerville, Georgia, serif;
            //
            // In a Rule, a Value represents everything after the `:`,
            // and before the `;`.
            //
            value: function () {
                var e, expressions = [], important;

                while (e = $(this.expression)) {
                    expressions.push(e);
                    if (! $(',')) { break }
                }
                important = $(this.important);

                if (expressions.length > 0) {
                    return new(tree.Value)(expressions, important);
                }
            },
            important: function () {
                return $(/!\s*important/g);
            },
            sub: function () {
                var e;

                if ($('(') && (e = $(this.expression)) && $(')')) {
                    return e;
                }
            },
            multiplication: function () {
                var m, a, op, operation;
                if (m = $(this.operand)) {
                    while ((op = $(/[\/*]/g)) && (a = $(this.operand))) {
                        operation = new(tree.Operation)(op, [operation || m, a]);
                    }
                    return operation || m;
                }
            },
            addition: function () {
                var m, a, op, operation;
                if (m = $(this.multiplication)) {
                    while ((op = $(/[-+]\s+/g) || (input.charAt(i - 1) != ' ' && $(/[-+]/g))) &&
                           (a = $(this.multiplication))) {
                        operation = new(tree.Operation)(op, [operation || m, a]);
                    }
                    return operation || m;
                }
            },

            //
            // An operand is anything that can be part of an operation,
            // such as a Color, or a Variable
            //
            operand: function () {
                return $(this.sub) || $(this.entities.dimension) ||
                       $(this.entities.color) || $(this.entities.variable);
            },

            //
            // Expressions either represent mathematical operations,
            // or white-space delimited Entities.
            //
            //     1px solid black
            //     @var * 2
            //
            expression: function () {
                var e, delim, entities = [], d;

                while (e = $(this.addition) || $(this.entity)) {
                    entities.push(e);
                }
                if (entities.length > 0) {
                    return new(tree.Expression)(entities);
                }
            },
            property: function () {
                var name;

                if (name = $(/(\*?-?[-a-z_0-9]+)\s*:/g)) {
                    return name[1];
                }
            }
        }
    };
};

less.Parser.importer = null;

if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.functions = {
    rgb: function (r, g, b) {
        return this.rgba(r, g, b, 1.0);
    },
    rgba: function (r, g, b, a) {
        var rgb = [r, g, b].map(function (c) { return number(c) }),
            a = number(a);
        return new(tree.Color)(rgb, a);
    },
    hsl: function (h, s, l) {
        return this.hsla(h, s, l, 1.0);
    },
    hsla: function (h, s, l, a) {
        h = (((number(h) % 360) + 360) % 360) / 360;
        s = number(s); l = number(l); a = number(a);

        //require('sys').puts(h, s, l)

        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = l * 2 - m2;

        return this.rgba(hue(h + 1/3) * 255,
                         hue(h)       * 255,
                         hue(h - 1/3) * 255,
                         a);

        function hue(h) {
            h = h < 0 ? h + 1 : (h > 1 ? h - 1 : h);
            if      (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
            else if (h * 2 < 1) return m2;
            else if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
            else                return m1;
        }
    },
    opacity: function(color, amount) {
        var alpha = number(amount) * (color.alpha || 1.0);
        return new(tree.Color)(color.rgb, number(amount));
    },
    saturate: function (color, amount) {
        var hsl = color.toHSL();

        hsl.s += amount.value / 100;
        hsl.s = clamp(hsl.s);
        return this.hsl(hsl.h, hsl.s, hsl.l);
    },
    desaturate: function (color, amount) {
        var hsl = color.toHSL();

        hsl.s -= amount.value / 100;
        hsl.s = clamp(hsl.s);
        return this.hsl(hsl.h, hsl.s, hsl.l);
    },
    lighten: function (color, amount) {
        var hsl = color.toHSL();

        hsl.l *= (1 + amount.value / 100);
        hsl.l = clamp(hsl.l);
        return this.hsl(hsl.h, hsl.s, hsl.l);
    },
    darken: function (color, amount) {
        var hsl = color.toHSL();

        hsl.l *= (1 - amount.value / 100);
        hsl.l = clamp(hsl.l);
        return this.hsl(hsl.h, hsl.s, hsl.l);
    },
    greyscale: function (color, amount) {
        return this.desaturate(color, new(tree.Dimension)(100));
    },
    e: function (str) {
        return new(tree.Anonymous)(str);
    },
    '%': function (quoted /* arg, arg, ...*/) {
        var args = Array.prototype.slice.call(arguments, 1),
            str = quoted.content;

        for (var i = 0; i < args.length; i++) {
            str = str.replace(/%s/,    args[i].content)
                     .replace(/%[da]/, args[i].toCSS());
        }
        str = str.replace(/%%/g, '%');
        return new(tree.Quoted)('"' + str + '"', str);
    }
};

function number(n) {
    if (n instanceof tree.Dimension) {
        return parseFloat(n.unit == '%' ? n.value / 100 : n.value);
    } else if (typeof(n) === 'number') {
        return n;
    } else {
        throw {
            error: "RuntimeError",
            message: "color functions take numbers as parameters"
        };
    }
}

function clamp(val) {
    return Math.min(1, Math.max(0, val));
}
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Alpha = function Alpha(val) {
    this.value = val;
};
tree.Alpha.prototype = {
    toCSS: function () {
        return "alpha(opacity=" + this.value.toCSS() + ")";
    },
    eval: function () { return this }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Anonymous = function Anonymous(string) {
    this.value = string.content || string;
};
tree.Anonymous.prototype = {
    toCSS: function () {
        return this.value;
    },
    eval: function () { return this }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

//
// A function call node.
//
tree.Call = function Call(name, args) {
    this.name = name;
    this.args = args;
};
tree.Call.prototype = {
    //
    // When evaluating a function call,
    // we either find the function in `tree.functions` [1],
    // in which case we call it, passing the  evaluated arguments,
    // or we simply print it out as it appeared originally [2].
    //
    // The *functions.js* file contains the built-in functions.
    //
    // The reason why we evaluate the arguments, is in the case where
    // we try to pass a variable to a function, like: `saturate(@color)`.
    // The function should receive the value, not the variable.
    //
    eval: function (env) {
        var args = this.args.map(function (a) { return a.eval(env) });

        if (this.name in tree.functions) { // 1.
            return tree.functions[this.name].apply(tree.functions, args);
        } else { // 2.
            return new(tree.Anonymous)(this.name +
                   "(" + args.map(function (a) { return a.toCSS() }).join(', ') + ")");
        }
    },

    toCSS: function (env) {
        return this.eval(env).toCSS();
    }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }
//
// RGB Colors - #ff0014, #eee
//
tree.Color = function Color(rgb, a) {
    //
    // The end goal here, is to parse the arguments
    // into an integer triplet, such as `128, 255, 0`
    //
    // This facilitates operations and conversions.
    //
    if (Array.isArray(rgb)) {
        this.rgb = rgb;
        this.alpha = a;
    } else if (rgb.length == 6) {
        this.rgb = rgb.match(/.{2}/g).map(function (c) {
            return parseInt(c, 16);
        });
    } else {
        this.rgb = rgb.split('').map(function (c) {
            return parseInt(c + c, 16);
        });
    }
};
tree.Color.prototype = {
    eval: function () { return this },

    //
    // If we have some transparency, the only way to represent it
    // is via `rgba`. Otherwise, we use the hex representation,
    // which has better compatibility with older browsers.
    // Values are capped between `0` and `255`, rounded and zero-padded.
    //
    toCSS: function () {
        if (this.alpha && this.alpha < 1.0) {
            return "rgba(" + this.rgb.concat(this.alpha).join(', ') + ")";
        } else {
            return '#' + this.rgb.map(function (i) {
                i = Math.round(i);
                i = (i > 255 ? 255 : (i < 0 ? 0 : i)).toString(16);
                return i.length === 1 ? '0' + i : i;
            }).join('');
        }
    },

    //
    // Operations have to be done per-channel, if not,
    // channels will spill onto each other. Once we have
    // our result, in the form of an integer triplet,
    // we create a new Color node to hold the result.
    //
    operate: function (op, other) {
        var result = [];

        if (! (other instanceof tree.Color)) {
            other = other.toColor();
        }

        for (var c = 0; c < 3; c++) {
            result[c] = tree.operate(op, this.rgb[c], other.rgb[c]);
        }
        return new(tree.Color)(result);
    },

    toHSL: function () {
        var r = this.rgb[0] / 255,
            g = this.rgb[1] / 255,
            b = this.rgb[2] / 255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2, d = max - min;

        if (max === min) {
            h = s = 0;
        } else {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2;               break;
                case b: h = (r - g) / d + 4;               break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, l: l };
    }
};

if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Comment = function Comment(value) {
    this.value = value;
};
tree.Comment.prototype = {
    toCSS: function () {
        return this.value;
    }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

//
// A number with a unit
//
tree.Dimension = function Dimension(value, unit) {
    this.value = parseFloat(value);
    this.unit = unit || null;
};

tree.Dimension.prototype = {
    eval: function () { return this },
    toColor: function () {
        return new(tree.Color)([this.value, this.value, this.value]);
    },
    toCSS: function () {
        var css = this.value + this.unit;
        return css;
    },

    // In an operation between two Dimensions,
    // we default to the first Dimension's unit,
    // so `1px + 2em` will yield `3px`.
    // In the future, we could implement some unit
    // conversions such that `100cm + 10mm` would yield
    // `101cm`.
    operate: function (op, other) {
        return new(tree.Dimension)
                  (tree.operate(op, this.value, other.value),
                  this.unit || other.unit);
    }
};

if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Directive = function Directive(name, value) {
    this.name = name;
    if (Array.isArray(value)) {
        this.ruleset = new(tree.Ruleset)([], value);
    } else {
        this.value = value;
    }
};
tree.Directive.prototype = {
    toCSS: function (ctx, env) {
        if (this.ruleset) {
            this.ruleset.root = true;
            return this.name + ' {\n  ' +
                   this.ruleset.toCSS(ctx, env).trim().replace(/\n/g, '\n  ') + '\n}\n';
        } else {
            return this.name + ' ' + this.value.toCSS() + ';\n';
        }
    },
    eval: function (env) {
        env.frames.unshift(this);
        this.ruleset && this.ruleset.evalRules(env);
        env.frames.shift();
        return this;
    },
    variable: function (name) { return tree.Ruleset.prototype.variable.call(this.ruleset, name) },
    find: function () { return tree.Ruleset.prototype.find.apply(this.ruleset, arguments) },
    rulesets: function () { return tree.Ruleset.prototype.rulesets.apply(this.ruleset) }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Element = function Element(combinator, value) {
    this.combinator = combinator instanceof tree.Combinator ?
                      combinator : new(tree.Combinator)(combinator);
    this.value = value.trim();
};
tree.Element.prototype.toCSS = function () {
    return this.combinator.toCSS() + this.value;
};

tree.Combinator = function Combinator(value) {
    if (value === ' ') {
        this.value = ' ';
    } else {
        this.value = value ? value.trim() : "";
    }
};
tree.Combinator.prototype.toCSS = function () {
    switch (this.value) {
        case ''  : return '';
        case ' ' : return ' ';
        case '&' : return '';
        case ':' : return ' :';
        case '::': return '::';
        case '+' : return ' + ';
        case '~' : return ' ~ ';
        case '>' : return ' > ';
    }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Expression = function Expression(value) { this.value = value };
tree.Expression.prototype = {
    eval: function (env) {
        if (this.value.length > 1) {
            return new(tree.Expression)(this.value.map(function (e) {
                return e.eval(env);
            }));
        } else {
            return this.value[0].eval(env);
        }
    },
    toCSS: function () {
        return this.value.map(function (e) {
            return e.toCSS();
        }).join(' ');
    }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }
//
// CSS @import node
//
// The general strategy here is that we don't want to wait
// for the parsing to be completed, before we start importing
// the file. That's because in the context of a browser,
// most of the time will be spent waiting for the server to respond.
//
// On creation, we push the import path to our import queue, though
// `import,push`, we also pass it a callback, which it'll call once
// the file has been fetched, and parsed.
//
tree.Import = function Import(path, imports) {
    var that = this;

    this._path = path;

    // The '.less' extension is optional
    if (path instanceof tree.Quoted) {
        this.path = /\.(le?|c)ss$/.test(path.content) ? path.content : path.content + '.less';
    } else {
        this.path = path.value.content || path.value;
    }

    this.css = /css$/.test(this.path);

    // Only pre-compile .less files
    if (! this.css) {
        imports.push(this.path, function (root) {
            that.root = root;
        });
    }
};

//
// The actual import node doesn't return anything, when converted to CSS.
// The reason is that it's used at the evaluation stage, so that the rules
// it imports can be treated like any other rules.
//
// In `eval`, we make sure all Import nodes get evaluated, recursively, so
// we end up with a flat structure, which can easily be imported in the parent
// ruleset.
//
tree.Import.prototype = {
    toCSS: function () {
        if (this.css) {
            return "@import " + this._path.toCSS() + ';\n';
        } else {
            return "";
        }
    },
    eval: function () {
        if (this.css) {
            return this;
        } else {
            for (var i = 0; i < this.root.rules.length; i++) {
                if (this.root.rules[i] instanceof tree.Import) {
                    Array.prototype
                         .splice
                         .apply(this.root.rules,
                                [i, 1].concat(this.root.rules[i].eval()));
                }
            }
            return this.root.rules;
        }
    }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Keyword = function Keyword(value) { this.value = value };
tree.Keyword.prototype = {
    eval: function () { return this },
    toCSS: function () { return this.value }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.mixin = {};
tree.mixin.Call = function MixinCall(elements, args, index) {
    this.selector = new(tree.Selector)(elements);
    this.arguments = args;
    this.index = index;
};
tree.mixin.Call.prototype = {
    eval: function (env) {
        var mixins, rules = [], match = false;

        for (var i = 0; i < env.frames.length; i++) {
            if ((mixins = env.frames[i].find(this.selector)).length > 0) {
                for (var m = 0; m < mixins.length; m++) {
                    if (mixins[m].match(this.arguments, env)) {
                        try {
                            Array.prototype.push.apply(
                                  rules, mixins[m].eval(this.arguments, env).rules);
                            match = true;
                        } catch (e) {
                            throw { message: e.message, index: this.index };
                        }
                    }
                }
                if (match) {
                    return rules;
                } else {
                    throw { message: 'No matching definition was found for `' +
                                      this.selector.toCSS().trim() + '('      +
                                      this.arguments.map(function (a) {
                                          return a.toCSS();
                                      }).join(', ') + ")`",
                            index:   this.index };
                }
            }
        }
        throw { message: this.selector.toCSS().trim() + " is undefined",
                index: this.index };
    }
};

tree.mixin.Definition = function MixinDefinition(name, params, rules) {
    this.name = name;
    this.selectors = [new(tree.Selector)([new(tree.Element)(null, name)])];
    this.params = params;
    this.arity = params.length;
    this.rules = rules;
    this._lookups = {};
    this.required = params.reduce(function (count, p) {
        if (p.name && !p.value) { return count + 1 }
        else                    { return count }
    }, 0);
};
tree.mixin.Definition.prototype = {
    toCSS: function () { return "" },
    variable: function (name) { return tree.Ruleset.prototype.variable.call(this, name) },
    find: function () { return tree.Ruleset.prototype.find.apply(this, arguments) },
    rulesets: function () { return tree.Ruleset.prototype.rulesets.apply(this) },

    eval: function (args, env) {
        var frame = new(tree.Ruleset)(null, []), context;

        for (var i = 0, val; i < this.params.length; i++) {
            if (this.params[i].name) {
                if (val = (args && args[i]) || this.params[i].value) {
                    frame.rules.unshift(new(tree.Rule)(this.params[i].name, val.eval(env)));
                } else {
                    throw { message: "wrong number of arguments for " + this.name +
                            ' (' + args.length + ' for ' + this.arity + ')' };
                }
            }
        }
        return new(tree.Ruleset)(null, this.rules).evalRules({
            frames: [this, frame].concat(env.frames)
        });
    },
    match: function (args, env) {
        var argsLength = (args && args.length) || 0;

        if (argsLength < this.required) {
            return false;
        }

        for (var i = 0; i < Math.min(argsLength, this.arity); i++) {
            if (!this.params[i].name) {
                if (args[i].wildcard) { continue }
                else if (args[i].eval(env).toCSS() != this.params[i].value.eval(env).toCSS()) {
                    return false;
                }
            }
        }
        return true;
    }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Operation = function Operation(op, operands) {
    this.op = op.trim();
    this.operands = operands;
};
tree.Operation.prototype.eval = function (env) {
    var a = this.operands[0].eval(env),
        b = this.operands[1].eval(env),
        temp;

    if (a instanceof tree.Dimension && b instanceof tree.Color) {
        if (this.op === '*' || this.op === '+') {
            temp = b, b = a, a = temp;
        } else {
            throw { name: "OperationError",
                    message: "Can't substract or divide a color from a number" };
        }
    }
    return a.operate(this.op, b);
};

tree.operate = function (op, a, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
    }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Quoted = function Quoted(value, content) {
    this.value = value;
    this.content = content;
};
tree.Quoted.prototype = {
    toCSS: function () {
        var css = this.value;
        return css;
    },
    eval: function () {
        return this;
    }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Rule = function Rule(name, value, index) {
    this.name = name;
    this.value = (value instanceof tree.Value) ? value : new(tree.Value)([value]);
    this.index = index;

    if (name.charAt(0) === '@') {
        this.variable = true;
    } else { this.variable = false }
};
tree.Rule.prototype.toCSS = function () {
    if (this.variable) { return "" }
    else {
        return this.name + ": " + this.value.toCSS() + ";";
    }
};

tree.Rule.prototype.eval = function (context) {
    return new(tree.Rule)(this.name, this.value.eval(context));
};

tree.Value = function Value(value) {
    this.value = value;
    this.is = 'value';
};
tree.Value.prototype = {
    eval: function (env) {
        if (this.value.length === 1) {
            return this.value[0].eval(env);
        } else {
            return new(tree.Value)(this.value.map(function (v) {
                return v.eval(env);
            }));
        }
    },
    toCSS: function () {
        return this.value.map(function (e) {
            return e.toCSS();
        }).join(', ');
    }
};

tree.Shorthand = function Shorthand(a, b) {
    this.a = a;
    this.b = b;
};

tree.Shorthand.prototype = {
    toCSS: function (env) {
        return this.a.toCSS(env) + "/" + this.b.toCSS(env);
    },
    eval: function () { return this }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Ruleset = function Ruleset(selectors, rules) {
    this.selectors = selectors;
    this.rules = rules;
    this._lookups = {};
};
tree.Ruleset.prototype = {
    eval: function () { return this },
    evalRules: function (context) {
        var rules = [];

        this.rules.forEach(function (rule) {
            if (rule.evalRules) {
                rules.push(rule.evalRules(context));
            } else if (rule instanceof tree.mixin.Call) {
                Array.prototype.push.apply(rules, rule.eval(context));
            } else {
                rules.push(rule.eval(context));
            }
        });
        this.rules = rules;
        return this;
    },
    match: function (args) {
        return !args || args.length === 0;
    },
    variable: function (name) {
        if (this._variables) { return this._variables[name] }
        else {
            return (this._variables = this.rules.reduce(function (hash, r) {
                if (r instanceof tree.Rule && r.variable === true) {
                    hash[r.name] = r;
                }
                return hash;
            }, {}))[name];
        }
    },
    rulesets: function () {
        if (this._rulesets) { return this._rulesets }
        else {
            return this._rulesets = this.rules.filter(function (r) {
                if (r instanceof tree.Ruleset || r instanceof tree.mixin.Definition) { return r }
            });
        }
    },
    find: function (selector, self) {
        self = self || this;
        var rules = [], rule, match,
            key = selector.toCSS();

        if (key in this._lookups) { return this._lookups[key] }

        this.rulesets().forEach(function (rule) {
            if (rule !== self) {
                for (var j = 0; j < rule.selectors.length; j++) {
                    if (match = selector.match(rule.selectors[j])) {
                        if (selector.elements.length > 1) {
                            Array.prototype.push.apply(rules, rule.find(
                                new(tree.Selector)(selector.elements.slice(1)), self));
                        } else {
                            rules.push(rule);
                        }
                        break;
                    }
                }
            }
        });
        return this._lookups[key] = rules;
    },
    //
    // Entry point for code generation
    //
    //     `context` holds an array of arrays.
    //
    toCSS: function (context, env) {
        var css = [],      // The CSS output
            rules = [],    // node.Rule instances
            rulesets = [], // node.Ruleset instances
            paths = [],    // Current selectors
            selector,      // The fully rendered selector
            rule;

        if (! this.root) {
            if (context.length === 0) {
                paths = this.selectors.map(function (s) { return [s] });
            } else {
                for (var s = 0; s < this.selectors.length; s++) {
                    for (var c = 0; c < context.length; c++) {
                        paths.push(context[c].concat([this.selectors[s]]));
                    }
                }
            }
        } else {
            context = [], env = { frames: [] }
            for (var i = 0; i < this.rules.length; i++) {
                if (this.rules[i] instanceof tree.Import) {
                    Array.prototype.splice
                         .apply(this.rules, [i, 1].concat(this.rules[i].eval(env)));
                }
            }
        }

        // push the current ruleset to the frames stack
        env.frames.unshift(this);

        // Evaluate mixins
        for (var i = 0; i < this.rules.length; i++) {
            if (this.rules[i] instanceof tree.mixin.Call) {
                Array.prototype.splice
                     .apply(this.rules, [i, 1].concat(this.rules[i].eval(env)));
            }
        }

        // Evaluate rules and rulesets
        for (var i = 0; i < this.rules.length; i++) {
            rule = this.rules[i];

            if (rule instanceof tree.Directive) {
                rulesets.push(rule.eval(env).toCSS(paths, env));
            } else if (rule.rules) {
                rulesets.push(rule.toCSS(paths, env));
            } else if (rule instanceof tree.Comment) {
                if (this.root) {
                    rulesets.push(rule.toCSS());
                } else {
                    rules.push(rule.toCSS());
                }
            } else {
                if (rule.toCSS && !rule.variable) {
                    rules.push(rule.eval(env).toCSS());
                } else if (rule.value && !rule.variable) {
                    rules.push(rule.value.toString());
                }
            }
        } 

        rulesets = rulesets.join('');

        // If this is the root node, we don't render
        // a selector, or {}.
        // Otherwise, only output if this ruleset has rules.
        if (this.root) {
            css.push(rules.join('\n'));
        } else {
            if (rules.length > 0) {
                selector = paths.map(function (p) {
                    return p.map(function (s) {
                        return s.toCSS();
                    }).join('').trim();
                }).join(paths.length > 3 ? ',\n' : ', ');
                css.push(selector, " {\n  " + rules.join('\n  ') + "\n}\n");
            }
        }
        css.push(rulesets);

        // Pop the stack
        env.frames.shift();

        return css.join('');
    }
};

if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Selector = function Selector(elements) {
    this.elements = elements;
    if (this.elements[0].combinator.value === "") {
        this.elements[0].combinator.value = ' ';
    }
};
tree.Selector.prototype.match = function (other) {
    if (this.elements[0].value === other.elements[0].value) {
        return true;
    } else {
        return false;
    }
};
tree.Selector.prototype.toCSS = function () {
    if (this._css) { return this._css }

    return this._css = this.elements.map(function (e) {
        if (typeof(e) === 'string') {
            return ' ' + e.trim();
        } else {
            return e.toCSS();
        }
    }).join('');
};

if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.URL = function URL(val) {
    this.value = val;
};
tree.URL.prototype = {
    toCSS: function () {
        return "url(" + this.value.toCSS() + ")";
    },
    eval: function () { return this }
};
if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.Variable = function Variable(name, index) { this.name = name, this.index = index };
tree.Variable.prototype = {
    eval: function (env) {
        var variable, v, name = this.name;

        if (variable = tree.find(env.frames, function (frame) {
            if (v = frame.variable(name)) {
                return v.value.eval(env);
            }
        })) { return variable }
        else {
            throw { message: "variable " + this.name + " is undefined",
                    index: this.index };
        }
    }
};

if (typeof(require) !== 'undefined' && typeof(__LESS_DIST__) === 'undefined') { var tree = require('less/tree') }

tree.find = function (obj, fun) {
    for (var i = 0, r; i < obj.length; i++) {
        if (r = fun.call(obj, obj[i])) { return r }
    }
    return null;
};
(function () {
//
// Select all links with the 'rel' attribute set to "less"
//
var sheets = [];

less.env = location.hostname == '127.0.0.1' ||
           location.hostname == '0.0.0.0'   ||
           location.hostname == 'localhost' ||
           location.protocol == 'file:'     ? 'development'
                                            : 'production';


// Load the stylesheets when the body is ready
var readyTimer = setInterval(function () {
    if (document.body) {
        if (!document.querySelectorAll && typeof(jQuery) === "undefined") {
            log("No selector method found");
        } else {
            sheets = (document.querySelectorAll || jQuery).call(document, 'link[rel="stylesheet/less"]');
        }
        clearInterval(readyTimer);

        loadStyleSheets(function (root, sheet, env) {
            createCSS(root.toCSS(), sheet, env.lastModified);

            if (env.local) {
                log("less: loading " + sheet.href + " from local storage.");
            } else {
                log("less: parsed " + sheet.href + " successfully.");
            }
        });
    }
}, 10);

//
// Auto-refresh
//
if (less.env === 'development') {
    refreshTimer = setInterval(function () {
        if (/!refresh/.test(location.hash)) {
            loadStyleSheets(function (root, sheet, lastModified) {
                createCSS(root.toCSS(), sheet, lastModified);
            });
        }
    }, 1000);
}

function loadStyleSheets(callback) {
    for (var i = 0; i < sheets.length; i++) {
        loadStyleSheet(sheets[i], callback);
    }
}

function loadStyleSheet(sheet, callback) {
    var css = typeof(localStorage) !== "undefined" && localStorage.getItem(sheet.href);
    var styles = css && JSON.parse(css);

    xhr(sheet.href, function (data, lastModified) {
        if (styles && (new(Date)(lastModified).valueOf() ===
                       new(Date)(styles.timestamp).valueOf())) {
            // Use local copy
            createCSS(styles.css, sheet);
            callback(null, sheet, { local: true });
        } else {
            // Use remote copy (re-parse)
            new(less.Parser)({ optimization: 3 }).parse(data, function (e, root) {
                if (e) { return error(e, sheet.href) }
                try {
                    callback(root, sheet, { local: false, lastModified: lastModified });
                } catch (e) {
                    error(e, sheet.href);
                }
            });
        }
    }, function (status) {
        throw new(Error)("Couldn't load " + sheet.href + " (" + status + ")");
    });
}

function createCSS(styles, sheet, lastModified) {
    var css = document.createElement('style');
    css.type = 'text/css';
    css.media = 'screen';
    css.title = 'less-sheet';

    if (sheet) {
        css.title = sheet.title || sheet.href.match(/(?:^|\/)([-\w]+)\.[a-z]+$/i)[1];

        // Don't update the local store if the file wasn't modified
        if (lastModified && typeof(localStorage) !== "undefined") {
            localStorage.setItem(sheet.href, JSON.stringify({ timestamp: lastModified, css: styles }));
        }
    }

    if (css.styleSheet) {
        css.styleSheet.cssText = styles;
    } else {
        css.appendChild(document.createTextNode(styles));
    }
    document.getElementsByTagName('head')[0].appendChild(css);
}

function xhr(url, callback, errback) {
    var xhr = getXMLHttpRequest();

    if (window.location.protocol === "file:") {
        xhr.open('GET', url, false);
        xhr.send(null);
        if (xhr.status === 0) {
            callback(xhr.responseText);
        } else {
            errback(xhr.status);
        }
    } else {
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    callback(xhr.responseText,
                             xhr.getResponseHeader("Last-Modified"));
                } else if (typeof(errback) === 'function') {
                    errback(xhr.status);
                }
            }
        };
        xhr.send(null);
    }
}

function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new(XMLHttpRequest);
    } else {
        try {
            return new(ActiveXObject)("MSXML2.XMLHTTP.3.0");
        } catch (e) {
            log("less: browser doesn't support AJAX.");
            return null;
        }
    }
}

function log(str) {
    if (less.env == 'development' && typeof(console) !== "undefined") { console.log(str) }
}

function error(e, href) {
    var template = ['<div>',
                        '<pre class="ctx"><span>[-1]</span>{0}</pre>',
                        '<pre><span>[0]</span>{current}</pre>',
                        '<pre class="ctx"><span>[1]</span>{2}</pre>',
                    '</div>'].join('\n');

    var elem = document.createElement('div'), timer;
    elem.id = "less-error-message";
    elem.innerHTML = '<h3>' + (e.message || 'There is an error in your .less file') + '</h3>' +
                     '<p><a href="' + href   + '">' + href + "</a> "                +
                     'on line '     + e.line + ', column ' + (e.column + 1)         + ':</p>' +
                     template.replace(/\[(-?\d)\]/g, function (_, i) {
                         return e.line + parseInt(i);
                     }).replace(/\{(\d)\}/g, function (_, i) {
                         return e.extract[parseInt(i)];
                     }).replace(/\{current\}/, e.extract[1].slice(0, e.column)      +
                                               '<span class="error">'               +
                                               e.extract[1].slice(e.column)         +
                                               '</span>');
    // CSS for error messages
    createCSS([
        '#less-error-message span {',
            'margin-right: 15px;',
        '}',
        '#less-error-message pre {',
            'color: #ee4444;',
            'padding: 4px 0;',
            'margin: 0;',
        '}',
        '#less-error-message pre.ctx {',
            'color: #dd7777;',
        '}',
        '#less-error-message h3 {',
            'padding: 15px 0 5px 0;',
            'margin: 0;',
        '}',
        '#less-error-message a {',
            'color: #10a',
        '}',
        '#less-error-message .error {',
            'color: red;',
            'font-weight: bold;',
            'padding-bottom: 2px;',
            'border-bottom: 1px dashed red;',
        '}'
    ].join(''));

    elem.style.cssText = [
        "font-family: Arial, sans-serif",
        "border: 1px solid #e00",
        "background-color: #eee",
        "border-radius: 5px",
        "color: #e00",
        "padding: 15px",
        "margin-bottom: 15px"
    ].join(';');

    if (less.env == 'development') {
        timer = setInterval(function () {
            if (document.body) {
                document.body.insertBefore(elem, document.body.childNodes[0]);
                clearInterval(timer);
            }
        }, 10);
    }
}

less.Parser.importer = function (path, paths, callback) {
    loadStyleSheet({ href: path, title: path }, function (root) {
        callback(root);
    });
};

})();

// --- End less.js ---

});
;bespin.tiki.register("::theme_manager_base", {
    name: "theme_manager_base",
    dependencies: {  }
});
bespin.tiki.module("theme_manager_base:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"define metadata";
({
    "description": "Defines extension points required for theming",
    "dependencies": { },
    "environments": { "main": true },
    "share": true,
    "provides": [
        {
            "ep": "extensionpoint",
            "name": "themestyles",
            "description": "(Less)files holding the CSS style information for the UI.",

            "params": [
                {
                    "name": "url",
                    "required": true,
                    "description": "Name of the ThemeStylesFile - can also be an array of files."
                }
            ]
        },
        {
            "ep": "extensionpoint",
            "name": "themeChange",
            "description": "Event: Notify when the theme(styles) changed.",

            "params": [
                {
                    "name": "pointer",
                    "required": true,
                    "description": "Function that is called whenever the theme is changed."
                }
            ]

        },
        {
            "ep": "extensionpoint",
            "name": "theme",
            "indexOn": "name",
            "description": "A theme is a way change the look of the application.",

            "params": [
                {
                    "name": "url",
                    "required": false,
                    "description": "Name of a ThemeStylesFile that holds theme specific CSS rules - can also be an array of files."
                },
                {
                    "name": "pointer",
                    "required": true,
                    "description": "Function that returns the ThemeData"
                }
            ]
        }
    ]
})
"end";

});
;bespin.tiki.register("::canon", {
    name: "canon",
    dependencies: { "environment": "0.0.0", "events": "0.0.0", "settings": "0.0.0" }
});
bespin.tiki.module("canon:history",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var Trace = require('bespin:util/stacktrace').Trace;
var catalog = require('bespin:plugins').catalog;

/**
 * Current requirements are around displaying the command line, and provision
 * of a 'history' command and cursor up|down navigation of history.
 * <p>Future requirements could include:
 * <ul>
 * <li>Multiple command lines
 * <li>The ability to recall key presses (i.e. requests with no output) which
 * will likely be needed for macro recording or similar
 * <li>The ability to store the command history either on the server or in the
 * browser local storage.
 * </ul>
 * <p>The execute() command doesn't really live here, except as part of that
 * last future requirement, and because it doesn't really have anywhere else to
 * live.
 */

/**
 * The array of requests that wish to announce their presence
 */
exports.requests = [];

/**
 * How many requests do we store?
 */
var maxRequestLength = 100;

/**
 * Called by Request instances when some output (or a cell to async() happens)
 */
exports.addRequestOutput = function(request) {
    exports.requests.push(request);
    // This could probably be optimized with some maths, but 99.99% of the
    // time we will only be off by one, and I'm feeling lazy.
    while (exports.requests.length > maxRequestLength) {
        exports.requests.shiftObject();
    }

    catalog.publish(this, 'addedRequestOutput', null, request);
};

/**
 * Execute a new command.
 * This is basically an error trapping wrapper around request.command(...)
 */
exports.execute = function(args, request) {
    // Check the function pointed to in the meta-data exists
    if (!request.command) {
        request.doneWithError('Command not found.');
        return;
    }

    try {
        request.command(args, request);
    } catch (ex) {
        var trace = new Trace(ex, true);
        console.group('Error executing command \'' + request.typed + '\'');
        console.log('command=', request.commandExt);
        console.log('args=', args);
        console.error(ex);
        trace.log(3);
        console.groupEnd();

        request.doneWithError(ex);
    }
};

});

bespin.tiki.module("canon:request",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var Event = require('events').Event;
var history = require('canon:history');

/**
 * To create an invocation, you need to do something like this (all the ctor
 * args are optional):
 * <pre>
 * var request = new Request({
 *     command: command,
 *     commandExt: commandExt,
 *     args: args,
 *     typed: typed
 * });
 * </pre>
 */
exports.Request = function(options) {
    options = options || {};

    // Will be used in the keyboard case and the cli case
    this.command = options.command;
    this.commandExt = options.commandExt;

    // Will be used only in the cli case
    this.args = options.args;
    this.typed = options.typed;

    // Have we been initialized?
    this._begunOutput = false;

    this.start = new Date();
    this.end = null;
    this.completed = false;
    this.error = false;

    this.changed = new Event();
};

/**
 * Lazy init to register with the history should only be done on output.
 * init() is expensive, and won't be used in the majority of cases
 */
exports.Request.prototype._beginOutput = function() {
    this._begunOutput = true;
    this.outputs = [];

    history.addRequestOutput(this);
};

/**
 * Sugar for:
 * <pre>request.error = true; request.done(output);</pre>
 */
exports.Request.prototype.doneWithError = function(content) {
    this.error = true;
    this.done(content);
};

/**
 * Declares that this function will not be automatically done when
 * the command exits
 */
exports.Request.prototype.async = function() {
    if (!this._begunOutput) {
        this._beginOutput();
    }
};

/**
 * Complete the currently executing command with successful output.
 * @param output Either DOM node, an SproutCore element or something that
 * can be used in the content of a DIV to create a DOM node.
 */
exports.Request.prototype.output = function(content) {
    if (!this._begunOutput) {
        this._beginOutput();
    }

    if (typeof content !== 'string' && !(content instanceof Node)) {
        content = content.toString();
    }

    this.outputs.push(content);
    this.changed();

    return this;
};

/**
 * All commands that do output must call this to indicate that the command
 * has finished execution.
 */
exports.Request.prototype.done = function(content) {
    this.completed = true;
    this.end = new Date();
    this.duration = this.end.getTime() - this.start.getTime();

    if (content) {
        this.output(content);
    } else {
        this.changed();
    }
};

});

bespin.tiki.module("canon:index",function(require,exports,module) {

});
;bespin.tiki.register("::traits", {
    name: "traits",
    dependencies: {  }
});
bespin.tiki.module("traits:index",function(require,exports,module) {
// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// See http://code.google.com/p/es-lab/wiki/Traits
// for background on traits and a description of this library

"define metadata";
({
    "description": "Traits library, traitsjs.org",
    "dependencies": {},
    "provides": []
});
"end";

// --- Begin traits-0.1.js ---

exports.Trait = (function(){

  // == Ancillary functions ==
  
  // this signals that the current ES implementation supports properties,
  // so probably also accessor properties
  var SUPPORTS_DEFINEPROP = !!Object.defineProperty;

  var call = Function.prototype.call;

  /**
   * An ad hoc version of bind that only binds the 'this' parameter.
   */
  var bindThis = Function.prototype.bind
    ? function(fun, self) { return Function.prototype.bind.call(fun, self); }
    : function(fun, self) {
        function funcBound(var_args) {
          return fun.apply(self, arguments);
        }
        return funcBound;
      };

  var hasOwnProperty = bindThis(call, Object.prototype.hasOwnProperty);
  var slice = bindThis(call, Array.prototype.slice);
    
  // feature testing such that traits.js runs on both ES3 and ES5
  var forEach = Array.prototype.forEach
      ? bindThis(call, Array.prototype.forEach)
      : function(arr, fun) {
          for (var i = 0, len = arr.length; i < len; i++) { fun(arr[i]); }
        };
      
  var freeze = Object.freeze || function(obj) { return obj; };
  var getPrototypeOf = Object.getPrototypeOf || function(obj) { return Object.prototype };
  var getOwnPropertyNames = Object.getOwnPropertyNames ||
      function(obj) {
        var props = [];
        for (var p in obj) { if (hasOwnProperty(obj,p)) { props.push(p); } }
        return props;
      };
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor ||
      function(obj, name) {
        return {
          value: obj[name],
          enumerable: true,
          writable: true,
          configurable: true
        };
      };
  var defineProperty = Object.defineProperty ||
      function(obj, name, pd) {
        obj[name] = pd.value;
      };
  var defineProperties = Object.defineProperties ||
      function(obj, propMap) {
        for (var name in propMap) {
          if (hasOwnProperty(propMap, name)) {
            defineProperty(obj, name, propMap[name]);
          }
        }
      };
  var Object_create = Object.create ||
      function(proto, propMap) {
        var self;
        function dummy() {};
        dummy.prototype = proto || Object.prototype;
        self = new dummy();
        if (propMap) {
          defineProperties(self, propMap);          
        }
        return self;
      };
  var getOwnProperties = Object.getOwnProperties ||
      function(obj) {
        var map = {};
        forEach(getOwnPropertyNames(obj), function (name) {
          map[name] = getOwnPropertyDescriptor(obj, name);
        });
        return map;
      };
  
  // end of ES3 - ES5 compatibility functions
  
  function makeConflictAccessor(name) {
    var accessor = function(var_args) {
      throw new Error("Conflicting property: "+name);
    };
    freeze(accessor.prototype);
    return freeze(accessor);
  };

  function makeRequiredPropDesc(name) {
    return freeze({
      value: undefined,
      enumerable: false,
      required: true
    });
  }
  
  function makeConflictingPropDesc(name) {
    var conflict = makeConflictAccessor(name);
    if (SUPPORTS_DEFINEPROP) {
      return freeze({
       get: conflict,
       set: conflict,
       enumerable: false,
       conflict: true
      }); 
    } else {
      return freeze({
        value: conflict,
        enumerable: false,
        conflict: true
      });
    }
  }
  
  /**
   * Are x and y not observably distinguishable?
   */
  function identical(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1/x === 1/y;
    } else {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      return x !== x && y !== y;
    }
  }

  // Note: isSameDesc should return true if both
  // desc1 and desc2 represent a 'required' property
  // (otherwise two composed required properties would be turned into a conflict)
  function isSameDesc(desc1, desc2) {
    // for conflicting properties, don't compare values because
    // the conflicting property values are never equal
    if (desc1.conflict && desc2.conflict) {
      return true;
    } else {
      return (   desc1.get === desc2.get
              && desc1.set === desc2.set
              && identical(desc1.value, desc2.value)
              && desc1.enumerable === desc2.enumerable
              && desc1.required === desc2.required
              && desc1.conflict === desc2.conflict); 
    }
  }
  
  function freezeAndBind(meth, self) {
    return freeze(bindThis(meth, self));
  }

  /* makeSet(['foo', ...]) => { foo: true, ...}
   *
   * makeSet returns an object whose own properties represent a set.
   *
   * Each string in the names array is added to the set.
   *
   * To test whether an element is in the set, perform:
   *   hasOwnProperty(set, element)
   */
  function makeSet(names) {
    var set = {};
    forEach(names, function (name) {
      set[name] = true;
    });
    return freeze(set);
  }

  // == singleton object to be used as the placeholder for a required property ==
  
  var required = freeze({ toString: function() { return '<Trait.required>'; } });

  // == The public API methods ==

  /**
   * var newTrait = trait({ foo:required, ... })
   *
   * @param object an object record (in principle an object literal)
   * @returns a new trait describing all of the own properties of the object
   *          (both enumerable and non-enumerable)
   *
   * As a general rule, 'trait' should be invoked with an
   * object literal, since the object merely serves as a record
   * descriptor. Both its identity and its prototype chain are irrelevant.
   * 
   * Data properties bound to function objects in the argument will be flagged
   * as 'method' properties. The prototype of these function objects is frozen.
   * 
   * Data properties bound to the 'required' singleton exported by this module
   * will be marked as 'required' properties.
   *
   * The <tt>trait</tt> function is pure if no other code can witness the
   * side-effects of freezing the prototypes of the methods. If <tt>trait</tt>
   * is invoked with an object literal whose methods are represented as
   * in-place anonymous functions, this should normally be the case.
   */
  function trait(obj) {
    var map = {};
    forEach(getOwnPropertyNames(obj), function (name) {
      var pd = getOwnPropertyDescriptor(obj, name);
      if (pd.value === required) {
        pd = makeRequiredPropDesc(name);
      } else if (typeof pd.value === 'function') {
        pd.method = true;
        if ('prototype' in pd.value) {
          freeze(pd.value.prototype);
        }
      } else {
        if (pd.get && pd.get.prototype) { freeze(pd.get.prototype); }
        if (pd.set && pd.set.prototype) { freeze(pd.set.prototype); }
      }
      map[name] = pd;
    });
    return map;
  }

  /**
   * var newTrait = compose(trait_1, trait_2, ..., trait_N)
   *
   * @param trait_i a trait object
   * @returns a new trait containing the combined own properties of
   *          all the trait_i.
   * 
   * If two or more traits have own properties with the same name, the new
   * trait will contain a 'conflict' property for that name. 'compose' is
   * a commutative and associative operation, and the order of its
   * arguments is not significant.
   *
   * If 'compose' is invoked with < 2 arguments, then:
   *   compose(trait_1) returns a trait equivalent to trait_1
   *   compose() returns an empty trait
   */
  function compose(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    
    forEach(traits, function (trait) {
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        if (hasOwnProperty(newTrait, name) &&
            !newTrait[name].required) {
          
          // a non-required property with the same name was previously defined
          // this is not a conflict if pd represents a 'required' property itself:
          if (pd.required) {
            return; // skip this property, the required property is now present
          }
            
          if (!isSameDesc(newTrait[name], pd)) {
            // a distinct, non-required property with the same name
            // was previously defined by another trait => mark as conflicting property
            newTrait[name] = makeConflictingPropDesc(name); 
          } // else,
          // properties are not in conflict if they refer to the same value
          
        } else {
          newTrait[name] = pd;
        }
      });
    });
    
    return freeze(newTrait);
  }

  /* var newTrait = exclude(['name', ...], trait)
   *
   * @param names a list of strings denoting property names.
   * @param trait a trait some properties of which should be excluded.
   * @returns a new trait with the same own properties as the original trait,
   *          except that all property names appearing in the first argument
   *          are replaced by required property descriptors.
   *
   * Note: exclude(A, exclude(B,t)) is equivalent to exclude(A U B, t)
   */
  function exclude(names, trait) {
    var exclusions = makeSet(names);
    var newTrait = {};
    
    forEach(getOwnPropertyNames(trait), function (name) {
      // required properties are not excluded but ignored
      if (!hasOwnProperty(exclusions, name) || trait[name].required) {
        newTrait[name] = trait[name];
      } else {
        // excluded properties are replaced by required properties
        newTrait[name] = makeRequiredPropDesc(name);
      }
    });
    
    return freeze(newTrait);
  }

  /**
   * var newTrait = override(trait_1, trait_2, ..., trait_N)
   *
   * @returns a new trait with all of the combined properties of the argument traits.
   *          In contrast to 'compose', 'override' immediately resolves all conflicts
   *          resulting from this composition by overriding the properties of later
   *          traits. Trait priority is from left to right. I.e. the properties of the
   *          leftmost trait are never overridden.
   *
   *  override is associative:
   *    override(t1,t2,t3) is equivalent to override(t1, override(t2, t3)) or
   *    to override(override(t1, t2), t3)
   *  override is not commutative: override(t1,t2) is not equivalent to override(t2,t1)
   *
   * override() returns an empty trait
   * override(trait_1) returns a trait equivalent to trait_1
   */
  function override(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    forEach(traits, function (trait) {
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        // add this trait's property to the composite trait only if
        // - the trait does not yet have this property
        // - or, the trait does have the property, but it's a required property
        if (!hasOwnProperty(newTrait, name) || newTrait[name].required) {
          newTrait[name] = pd;
        }
      });
    });
    return freeze(newTrait);
  }
  
  /**
   * var newTrait = override(dominantTrait, recessiveTrait)
   *
   * @returns a new trait with all of the properties of dominantTrait
   *          and all of the properties of recessiveTrait not in dominantTrait
   *
   * Note: override is associative:
   *   override(t1, override(t2, t3)) is equivalent to override(override(t1, t2), t3)
   */
  /*function override(frontT, backT) {
    var newTrait = {};
    // first copy all of backT's properties into newTrait
    forEach(getOwnPropertyNames(backT), function (name) {
      newTrait[name] = backT[name];
    });
    // now override all these properties with frontT's properties
    forEach(getOwnPropertyNames(frontT), function (name) {
      var pd = frontT[name];
      // frontT's required property does not override the provided property
      if (!(pd.required && hasOwnProperty(newTrait, name))) {
        newTrait[name] = pd; 
      }      
    });
    
    return freeze(newTrait);
  }*/

  /**
   * var newTrait = rename(map, trait)
   *
   * @param map an object whose own properties serve as a mapping from
            old names to new names.
   * @param trait a trait object
   * @returns a new trait with the same properties as the original trait,
   *          except that all properties whose name is an own property
   *          of map will be renamed to map[name], and a 'required' property
   *          for name will be added instead.
   *
   * rename({a: 'b'}, t) eqv compose(exclude(['a'],t),
   *                                 { a: { required: true },
   *                                   b: t[a] })
   *
   * For each renamed property, a required property is generated.
   * If the map renames two properties to the same name, a conflict is generated.
   * If the map renames a property to an existing unrenamed property, a conflict is generated.
   *
   * Note: rename(A, rename(B, t)) is equivalent to rename(\n -> A(B(n)), t)
   * Note: rename({...},exclude([...], t)) is not eqv to exclude([...],rename({...}, t))
   */
  function rename(map, trait) {
    var renamedTrait = {};
    forEach(getOwnPropertyNames(trait), function (name) {
      // required props are never renamed
      if (hasOwnProperty(map, name) && !trait[name].required) {
        var alias = map[name]; // alias defined in map
        if (hasOwnProperty(renamedTrait, alias) && !renamedTrait[alias].required) {
          // could happen if 2 props are mapped to the same alias
          renamedTrait[alias] = makeConflictingPropDesc(alias);
        } else {
          // add the property under an alias
          renamedTrait[alias] = trait[name];
        }
        // add a required property under the original name
        // but only if a property under the original name does not exist
        // such a prop could exist if an earlier prop in the trait was previously
        // aliased to this name
        if (!hasOwnProperty(renamedTrait, name)) {
          renamedTrait[name] = makeRequiredPropDesc(name);     
        }
      } else { // no alias defined
        if (hasOwnProperty(renamedTrait, name)) {
          // could happen if another prop was previously aliased to name
          if (!trait[name].required) {
            renamedTrait[name] = makeConflictingPropDesc(name);            
          }
          // else required property overridden by a previously aliased property
          // and otherwise ignored
        } else {
          renamedTrait[name] = trait[name];
        }
      }
    });
    
    return freeze(renamedTrait);
  }
  
  /**
   * var newTrait = resolve({ oldName: 'newName', excludeName: undefined, ... }, trait)
   *
   * This is a convenience function combining renaming and exclusion. It can be implemented
   * as <tt>rename(map, exclude(exclusions, trait))</tt> where map is the subset of
   * mappings from oldName to newName and exclusions is an array of all the keys that map
   * to undefined (or another falsy value).
   *
   * @param resolutions an object whose own properties serve as a mapping from
            old names to new names, or to undefined if the property should be excluded
   * @param trait a trait object
   * @returns a resolved trait with the same own properties as the original trait.
   *
   * In a resolved trait, all own properties whose name is an own property
   * of resolutions will be renamed to resolutions[name] if it is truthy,
   * or their value is changed into a required property descriptor if
   * resolutions[name] is falsy.
   *
   * Note, it's important to _first_ exclude, _then_ rename, since exclude
   * and rename are not associative, for example:
   * rename({a: 'b'}, exclude(['b'], trait({ a:1,b:2 }))) eqv trait({b:1})
   * exclude(['b'], rename({a: 'b'}, trait({ a:1,b:2 }))) eqv trait({b:Trait.required})
   *
   * writing resolve({a:'b', b: undefined},trait({a:1,b:2})) makes it clear that
   * what is meant is to simply drop the old 'b' and rename 'a' to 'b'
   */
  function resolve(resolutions, trait) {
    var renames = {};
    var exclusions = [];
    // preprocess renamed and excluded properties
    for (var name in resolutions) {
      if (hasOwnProperty(resolutions, name)) {
        if (resolutions[name]) { // old name -> new name
          renames[name] = resolutions[name];
        } else { // name -> undefined
          exclusions.push(name);
        }
      }
    }
    return rename(renames, exclude(exclusions, trait));
  }

  /**
   * var obj = create(proto, trait)
   *
   * @param proto denotes the prototype of the completed object
   * @param trait a trait object to be turned into a complete object
   * @returns an object with all of the properties described by the trait.
   * @throws 'Missing required property' the trait still contains a required property.
   * @throws 'Remaining conflicting property' if the trait still contains a conflicting property.
   *
   * Trait.create is like Object.create, except that it generates
   * high-integrity or final objects. In addition to creating a new object
   * from a trait, it also ensures that:
   *    - an exception is thrown if 'trait' still contains required properties
   *    - an exception is thrown if 'trait' still contains conflicting properties
   *    - the object is and all of its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of the object is
   *      bound to the composed object.
   *
   *  Use Object.create instead of Trait.create if you want to create
   *  abstract or malleable objects. Keep in mind that for such objects:
   *    - no exception is thrown if 'trait' still contains required properties
   *      (the properties are simply dropped from the composite object)
   *    - no exception is thrown if 'trait' still contains conflicting properties
   *      (these properties remain as conflicting properties in the composite object)
   *    - neither the object nor its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of the object is
   *      left unbound.
   */
  function create(proto, trait) {
    var self = Object_create(proto);
    var properties = {};
  
    forEach(getOwnPropertyNames(trait), function (name) {
      var pd = trait[name];
      // check for remaining 'required' properties
      // Note: it's OK for the prototype to provide the properties
      if (pd.required && !(name in proto)) {
        throw new Error('Missing required property: '+name);
      } else if (pd.conflict) { // check for remaining conflicting properties
        throw new Error('Remaining conflicting property: '+name);
      } else if ('value' in pd) { // data property
        // freeze all function properties and their prototype
        if (pd.method) { // the property is meant to be used as a method
          // bind 'this' in trait method to the composite object
          properties[name] = {
            value: freezeAndBind(pd.value, self),
            enumerable: pd.enumerable,
            configurable: pd.configurable,
            writable: pd.writable
          };
        } else {
          properties[name] = pd;
        }
      } else { // accessor property
        properties[name] = {
          get: pd.get ? freezeAndBind(pd.get, self) : undefined,
          set: pd.set ? freezeAndBind(pd.set, self) : undefined,
          enumerable: pd.enumerable,
          configurable: pd.configurable,
          writable: pd.writable            
        };
      }
    });

    defineProperties(self, properties);
    return freeze(self);
  }

  /** A shorthand for create(Object.prototype, trait({...}), options) */
  function object(record, options) {
    return create(Object.prototype, trait(record), options);
  }

  /**
   * Tests whether two traits are equivalent. T1 is equivalent to T2 iff
   * both describe the same set of property names and for all property
   * names n, T1[n] is equivalent to T2[n]. Two property descriptors are
   * equivalent if they have the same value, accessors and attributes.
   *
   * @return a boolean indicating whether the two argument traits are equivalent.
   */
  function eqv(trait1, trait2) {
    var names1 = getOwnPropertyNames(trait1);
    var names2 = getOwnPropertyNames(trait2);
    var name;
    if (names1.length !== names2.length) {
      return false;
    }
    for (var i = 0; i < names1.length; i++) {
      name = names1[i];
      if (!trait2[name] || !isSameDesc(trait1[name], trait2[name])) {
        return false;
      }
    }
    return true;
  }
  
  // if this code is ran in ES3 without an Object.create function, this
  // library will define it on Object:
  if (!Object.create) {
    Object.create = Object_create;
  }
  // ES5 does not by default provide Object.getOwnProperties
  // if it's not defined, the Traits library defines this utility function on Object
  if(!Object.getOwnProperties) {
    Object.getOwnProperties = getOwnProperties;
  }
  
  // expose the public API of this module
  function Trait(record) {
    // calling Trait as a function creates a new atomic trait
    return trait(record);
  }
  Trait.required = freeze(required);
  Trait.compose = freeze(compose);
  Trait.resolve = freeze(resolve);
  Trait.override = freeze(override);
  Trait.create = freeze(create);
  Trait.eqv = freeze(eqv);
  Trait.object = freeze(object); // not essential, cf. create + trait
  return freeze(Trait);
  
})();

// --- End traits-0.1.js ---


});
;bespin.tiki.register("::keyboard", {
    name: "keyboard",
    dependencies: { "canon": "0.0.0", "settings": "0.0.0" }
});
bespin.tiki.module("keyboard:keyboard",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;
var Trace = require('bespin:util/stacktrace').Trace;
var util = require('bespin:util/util');

var settings = require('settings').settings;

var keyutil = require('keyboard:keyutil');
var history = require('canon:history');
var Request = require('canon:request').Request;
var env = require('environment').env;

/*
 * Things to do to sanitize this code:
 * - 'no command' is a bizarre special value at the very least it should be a
 *   constant to make typos more obvious, but it would be better to refactor
 *   so that a natural value like null worked.
 * - sender seems to be totally customized to the editor case, and the functions
 *   that we assume that it has make no sense for the commandLine case. We
 *   should either document and implement the same function set for both cases
 *   or admit that the cases are different enough to have separate
 *   implementations.
 * - remove remaining sproutcore-isms
 * - fold buildFlags into processKeyEvent or something better, preferably the
 *   latter. We don't want the environment to become a singleton
 */

/**
 * Every time we call processKeyEvent, we pass in some flags that require the
 * same processing to set them up. This function can be called to do that
 * setup.
 * @param env Probably environment.env
 * @param flags Probably {} (but check other places where this is called)
 */
exports.buildFlags = function(flags) {
    flags.context = env.contexts[0];
    return flags;
};

/**
 * The canon, or the repository of commands, contains functions to process
 * events and dispatch command messages to targets.
 * @class
 */
var KeyboardManager = function() { };

util.mixin(KeyboardManager.prototype, {
    _customKeymappingCache: { states: {} },

    /**
     * Searches through the command canon for an event matching the given flags
     * with a key equivalent matching the given SproutCore event, and, if the
     * command is found, sends a message to the appropriate target.
     *
     * This will get a couple of upgrades in the not-too-distant future:
     * 1. caching in the Canon for fast lookup based on key
     * 2. there will be an extra layer in between to allow remapping via
     *    user preferences and keyboard mapping plugins
     *
     * @return True if a matching command was found, false otherwise.
     */
    processKeyEvent: function(evt, sender, flags) {
        // Use our modified commandCodes function to detect the meta key in
        // more circumstances than SproutCore alone does.
        var symbolicName = keyutil.commandCodes(evt, true)[0];
        if (util.none(symbolicName)) {
            return false;
        }

        // TODO: Maybe it should be the job of our caller to do this?
        exports.buildFlags(flags);

        flags.isCommandKey = true;
        return this._matchCommand(symbolicName, sender, flags);
    },

    _matchCommand: function(symbolicName, sender, flags) {
        var match = this._findCommandExtension(symbolicName, sender, flags);
        if (match && match.commandExt !== 'no command') {
            if (flags.isTextView) {
                sender.resetKeyBuffers();
            }

            var commandExt = match.commandExt;
            commandExt.load(function(command) {
                var request = new Request({
                    command: command,
                    commandExt: commandExt
                });
                history.execute(match.args, request);
            });
            return true;
        }

        // 'no command' is returned if a keyevent is handled but there is no
        // command executed (for example when switchting the keyboard state).
        if (match && match.commandExt === 'no command') {
            return true;
        } else {
            return false;
        }
    },

    _buildBindingsRegex: function(bindings) {
        // Escape a given Regex string.
        bindings.forEach(function(binding) {
            if (!util.none(binding.key)) {
                binding.key = new RegExp('^' + binding.key + '$');
            } else if (Array.isArray(binding.regex)) {
                binding.key = new RegExp('^' + binding.regex[1] + '$');
                binding.regex = new RegExp(binding.regex.join('') + '$');
            } else {
                binding.regex = new RegExp(binding.regex + '$');
            }
        });
    },

    /**
     * Build the RegExp from the keymapping as RegExp can't stored directly
     * in the metadata JSON and as the RegExp used to match the keys/buffer
     * need to be adapted.
     */
    _buildKeymappingRegex: function(keymapping) {
        for (state in keymapping.states) {
            this._buildBindingsRegex(keymapping.states[state]);
        }
        keymapping._convertedRegExp = true;
    },

    /**
     * Loop through the commands in the canon, looking for something that
     * matches according to #_commandMatches, and return that.
     */
    _findCommandExtension: function(symbolicName, sender, flags) {
        // If the flags indicate that we handle the textView's input then take
        // a look at keymappings as well.
        if (flags.isTextView) {
            var currentState = sender._keyState;

            // Don't add the symbolic name to the key buffer if the alt_ key is
            // part of the symbolic name. If it starts with alt_, this means
            // that the user hit an alt keycombo and there will be a single,
            // new character detected after this event, which then will be
            // added to the buffer (e.g. alt_j will result in ∆).
            if (!flags.isCommandKey || symbolicName.indexOf('alt_') === -1) {
                sender._keyBuffer +=
                    symbolicName.replace(/ctrl_meta|meta/,'ctrl');
                sender._keyMetaBuffer += symbolicName;
            }

            // List of all the keymappings to look at.
            var ak = [ this._customKeymappingCache ];

            // Get keymapping extension points.
            ak = ak.concat(catalog.getExtensions('keymapping'));

            for (var i = 0; i < ak.length; i++) {
                // Check if the keymapping has the current state.
                if (util.none(ak[i].states[currentState])) {
                    continue;
                }

                if (util.none(ak[i]._convertedRegExp)) {
                    this._buildKeymappingRegex(ak[i]);
                }

                // Try to match the current mapping.
                var result = this._bindingsMatch(
                                    symbolicName,
                                    flags,
                                    sender,
                                    ak[i]);

                if (!util.none(result)) {
                    return result;
                }
            }
        }

        var commandExts = catalog.getExtensions('command');
        var reply = null;
        var args = {};

        symbolicName = symbolicName.replace(/ctrl_meta|meta/,'ctrl');

        commandExts.some(function(commandExt) {
            if (this._commandMatches(commandExt, symbolicName, flags)) {
                reply = commandExt;
                return true;
            }
            return false;
        }.bind(this));

        return util.none(reply) ? null : { commandExt: reply, args: args };
    },


    /**
     * Checks if the given parameters fit to one binding in the given bindings.
     * Returns the command and arguments if a command was matched.
     */
    _bindingsMatch: function(symbolicName, flags, sender, keymapping) {
        var match;
        var commandExt = null;
        var args = {};
        var bufferToUse;

        if (!util.none(keymapping.hasMetaKey)) {
            bufferToUse = sender._keyBuffer;
        } else {
            bufferToUse = sender._keyMetaBuffer;
        }

        // Add the alt_key to the buffer as we don't want it to be in the buffer
        // that is saved but for matching, it needs to be there.
        if (symbolicName.indexOf('alt_') === 0 && flags.isCommandKey) {
            bufferToUse += symbolicName;
        }

        // Loop over all the bindings of the keymapp until a match is found.
        keymapping.states[sender._keyState].some(function(binding) {
            // Check if the key matches.
            if (binding.key && !binding.key.test(symbolicName)) {
                return false;
            }

            // Check if the regex matches.
            if (binding.regex && !(match = binding.regex.exec(bufferToUse))) {
                return false;
            }

            // Check for disallowed matches.
            if (binding.disallowMatches) {
                for (var i = 0; i < binding.disallowMatches.length; i++) {
                    if (!!match[binding.disallowMatches[i]]) {
                        return true;
                    }
                }
            }

            // Check predicates.
            if (!exports.flagsMatch(binding.predicates, flags)) {
                return false;
            }

            // If there is a command to execute, then figure out the
            // comand and the arguments.
            if (binding.exec) {
                // Get the command.
                commandExt = catalog.getExtensionByKey('command', binding.exec);
                if (util.none(commandExt)) {
                    throw new Error('Can\'t find command ' + binding.exec +
                        ' in state=' + sender._keyState +
                        ', symbolicName=' + symbolicName);
                }

                // Bulid the arguments.
                if (binding.params) {
                    var value;
                    binding.params.forEach(function(param) {
                        if (!util.none(param.match) && !util.none(match)) {
                            value = match[param.match] || param.defaultValue;
                        } else {
                            value = param.defaultValue;
                        }

                        if (param.type === 'number') {
                            value = parseInt(value);
                        }

                        args[param.name] = value;
                    });
                }
                sender.resetKeyBuffers();
            }

            // Handle the 'then' property.
            if (binding.then) {
                sender._keyState = binding.then;
                sender.resetKeyBuffers();
            }

            // If there is no command matched now, then return a 'false'
            // command to stop matching.
            if (util.none(commandExt)) {
                commandExt = 'no command';
            }

            return true;
        });

        if (util.none(commandExt)) {
            return null;
        }

        return { commandExt: commandExt, args: args };
    },

    /**
     * Check that the given command fits the given key name and flags.
     */
    _commandMatches: function(commandExt, symbolicName, flags) {
        var mappedKeys = commandExt.key;
        if (!mappedKeys) {
            return false;
        }

        // Check predicates
        if (!exports.flagsMatch(commandExt.predicates, flags)) {
            return false;
        }

        if (typeof(mappedKeys) === 'string') {
            if (mappedKeys != symbolicName) {
                return false;
            }
            return true;
        }

        if (!Array.isArray(mappedKeys)) {
            mappedKeys = [mappedKeys];
            commandExt.key = mappedKeys;
        }

        for (var i = 0; i < mappedKeys.length; i++) {
            var keymap = mappedKeys[i];
            if (typeof(keymap) === 'string') {
                if (keymap == symbolicName) {
                    return true;
                }
                continue;
            }

            if (keymap.key != symbolicName) {
                continue;
            }

            return exports.flagsMatch(keymap.predicates, flags);
        }
        return false;
    },

    /**
     * Build a cache of custom keymappings whenever the associated setting
     * changes.
     */
    _customKeymappingChanged: function() {
        var ckc = this._customKeymappingCache =
                            JSON.parse(settings.get('customKeymapping'));

        ckc.states = ckc.states || {};

        for (state in ckc.states) {
            this._buildBindingsRegex(ckc.states[state]);
        }
        ckc._convertedRegExp = true;
    }
});

/**
 *
 */
exports.flagsMatch = function(predicates, flags) {
    if (util.none(predicates)) {
        return true;
    }

    if (!flags) {
        return false;
    }

    for (var flagName in predicates) {
        if (flags[flagName] !== predicates[flagName]) {
            return false;
        }
    }

    return true;
};

/**
 * The global exported KeyboardManager
 */
exports.keyboardManager = new KeyboardManager();

catalog.registerExtension('settingChange', {
    match: "customKeymapping",
    pointer: exports.keyboardManager._customKeymappingChanged
                                        .bind(exports.keyboardManager)
});

});

bespin.tiki.module("keyboard:keyutil",function(require,exports,module) {
/*! @license
==========================================================================
SproutCore -- JavaScript Application Framework
copyright 2006-2009, Sprout Systems Inc., Apple Inc. and contributors.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

SproutCore and the SproutCore logo are trademarks of Sprout Systems, Inc.

For more information about SproutCore, visit http://www.sproutcore.com


==========================================================================
@license */

// Most of the following code is taken from SproutCore with a few changes.

var util = require('bespin:util/util');

/**
 * Helper functions and hashes for key handling.
 */
exports.KeyHelper = function() {
    var ret = {
        MODIFIER_KEYS: {
            16: 'shift', 17: 'ctrl', 18: 'alt', 224: 'meta'
        },

        FUNCTION_KEYS : {
              8: 'backspace', 9: 'tab',         13: 'return',   19: 'pause',
             27: 'escape',   33: 'pageup',      34: 'pagedown', 35: 'end',
             36: 'home',     37: 'left',        38: 'up',       39: 'right',
             40: 'down',     44: 'printscreen', 45: 'insert',   46: 'delete',
            112: 'f1',      113: 'f2',         114: 'f3',      115: 'f4',
            116: 'f5',      117: 'f7',         119: 'f8',      120: 'f9',
            121: 'f10',     122: 'f11',        123: 'f12',     144: 'numlock',
            145: 'scrolllock'
        },

        PRINTABLE_KEYS: {
           32: ' ',  48: '0',  49: '1',  50: '2',  51: '3',  52: '4', 53:  '5',
           54: '6',  55: '7',  56: '8',  57: '9',  59: ';',  61: '=', 65:  'a',
           66: 'b',  67: 'c',  68: 'd',  69: 'e',  70: 'f',  71: 'g', 72:  'h',
           73: 'i',  74: 'j',  75: 'k',  76: 'l',  77: 'm',  78: 'n', 79:  'o',
           80: 'p',  81: 'q',  82: 'r',  83: 's',  84: 't',  85: 'u', 86:  'v',
           87: 'w',  88: 'x',  89: 'y',  90: 'z', 107: '+', 109: '-', 110: '.',
          188: ',', 190: '.', 191: '/', 192: '`', 219: '[', 220: '\\',
          221: ']', 222: '\"'
        },

        /**
         * Create the lookup table for Firefox to convert charCodes to keyCodes
         * in the keyPress event.
         */
        PRINTABLE_KEYS_CHARCODE: {},

        /**
         * Allow us to lookup keyCodes by symbolic name rather than number
         */
        KEY: {}
    };

    // Create the PRINTABLE_KEYS_CHARCODE hash.
    for (var i in ret.PRINTABLE_KEYS) {
        var k = ret.PRINTABLE_KEYS[i];
        ret.PRINTABLE_KEYS_CHARCODE[k.charCodeAt(0)] = i;
        if (k.toUpperCase() != k) {
            ret.PRINTABLE_KEYS_CHARCODE[k.toUpperCase().charCodeAt(0)] = i;
        }
    }

    // A reverse map of FUNCTION_KEYS
    for (i in ret.FUNCTION_KEYS) {
        var name = ret.FUNCTION_KEYS[i].toUpperCase();
        ret.KEY[name] = parseInt(i, 10);
    }

    return ret;
}();

/**
 * Determines if the keyDown event is a non-printable or function key.
 * These kinds of events are processed as keyboard shortcuts.
 * If no shortcut handles the event, then it will be sent as a regular
 * keyDown event.
 * @private
 */
var isFunctionOrNonPrintableKey = function(evt) {
    return !!(evt.altKey || evt.ctrlKey || evt.metaKey ||
            ((evt.charCode !== evt.which) &&
                    exports.KeyHelper.FUNCTION_KEYS[evt.which]));
};

/**
 * Returns character codes for the event.
 * The first value is the normalized code string, with any Shift or Ctrl
 * characters added to the beginning.
 * The second value is the char string by itself.
 * @return {Array}
 */
exports.commandCodes = function(evt, dontIgnoreMeta) {
    var code = evt._keyCode || evt.keyCode;
    var charCode = (evt._charCode === undefined ? evt.charCode : evt._charCode);
    var ret = null;
    var key = null;
    var modifiers = '';
    var lowercase;
    var allowShift = true;

    // Absent a value for 'keyCode' or 'which', we can't compute the
    // command codes. Bail out.
    if (code === 0 && evt.which === 0) {
        return false;
    }

    // If the charCode is not zero, then we do not handle a command key
    // here. Bail out.
    if (charCode !== 0) {
        return false;
    }

    // Check for modifier keys.
    if (exports.KeyHelper.MODIFIER_KEYS[charCode]) {
        return [exports.KeyHelper.MODIFIER_KEYS[charCode], null];
    }

    // handle function keys.
    if (code) {
        ret = exports.KeyHelper.FUNCTION_KEYS[code];
        if (!ret && (evt.altKey || evt.ctrlKey || evt.metaKey)) {
            ret = exports.KeyHelper.PRINTABLE_KEYS[code];
            // Don't handle the shift key if the combo is
            //    (meta_|ctrl_)<number>
            // This is necessary for the French keyboard. On that keyboard,
            // you have to hold down the shift key to access the number
            // characters.
            if (code > 47 && code < 58) {
                allowShift = evt.altKey;
            }
        }

        if (ret) {
           if (evt.altKey) {
               modifiers += 'alt_';
           }
           if (evt.ctrlKey) {
               modifiers += 'ctrl_';
           }
           if (evt.metaKey) {
               modifiers += 'meta_';
           }
        } else if (evt.ctrlKey || evt.metaKey) {
            return false;
        }
    }

    // otherwise just go get the right key.
    if (!ret) {
        code = evt.which;
        key = ret = String.fromCharCode(code);
        lowercase = ret.toLowerCase();

        if (evt.metaKey) {
           modifiers = 'meta_';
           ret = lowercase;

        } else ret = null;
    }

    if (evt.shiftKey && ret && allowShift) {
        modifiers += 'shift_';
    }

    if (ret) {
        ret = modifiers + ret;
    }

    if (!dontIgnoreMeta && ret) {
        ret = ret.replace(/ctrl_meta|meta/,'ctrl');
    }

    return [ret, key];
};

// Note: Most of the following code is taken from SproutCore with a few changes.

/**
 * Firefox sends a few key events twice: the first time to the keydown event
 * and then later again to the keypress event. To handle them correct, they
 * should be processed only once. Due to this, we will skip these events
 * in keydown and handle them then in keypress.
 */
exports.addKeyDownListener = function(element, boundFunction) {

    var handleBoundFunction = function(ev) {
        var handled = boundFunction(ev);
        // If the boundFunction returned true, then stop the event.
        if (handled) {
            util.stopEvent(ev);
        }
        return handled;
    };

    element.addEventListener('keydown', function(ev) {
        if (util.isMozilla) {
            // Check for function keys (like DELETE, TAB, LEFT, RIGHT...)
            if (exports.KeyHelper.FUNCTION_KEYS[ev.keyCode]) {
                return true;
                // Check for command keys (like ctrl_c, ctrl_z...)
            } else if ((ev.ctrlKey || ev.metaKey) &&
                    exports.KeyHelper.PRINTABLE_KEYS[ev.keyCode]) {
                return true;
            }
        }

        if (isFunctionOrNonPrintableKey(ev)) {
            return handleBoundFunction(ev);
        }

        return true;
    }, false);

    element.addEventListener('keypress', function(ev) {
        if (util.isMozilla) {
            // If this is a function key, we have to use the keyCode.
            if (exports.KeyHelper.FUNCTION_KEYS[ev.keyCode]) {
                return handleBoundFunction(ev);
            } else if ((ev.ctrlKey || ev.metaKey) &&
                    exports.KeyHelper.PRINTABLE_KEYS_CHARCODE[ev.charCode]){
                // Check for command keys (like ctrl_c, ctrl_z...).
                // For command keys have to convert the charCode to a keyCode
                // as it has been sent from the keydown event to be in line
                // with the other browsers implementations.

                // FF does not allow let you change the keyCode or charCode
                // property. Store to a custom keyCode/charCode variable.
                // The getCommandCodes() function takes care of these
                // special variables.
                ev._keyCode = exports.KeyHelper.PRINTABLE_KEYS_CHARCODE[ev.charCode];
                ev._charCode = 0;
                return handleBoundFunction(ev);
            }
        }

        // normal processing: send keyDown for printable keys.
        if (ev.charCode !== undefined && ev.charCode === 0) {
            return true;
        }

        return handleBoundFunction(ev);
    }, false);
};

});

bespin.tiki.module("keyboard:index",function(require,exports,module) {

});
;bespin.tiki.register("::worker_manager", {
    name: "worker_manager",
    dependencies: { "canon": "0.0.0", "events": "0.0.0", "underscore": "0.0.0" }
});
bespin.tiki.module("worker_manager:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"define metadata";
({
    "description": "Manages a web worker on the browser side",
    "dependencies": {
        "canon": "0.0.0",
        "events": "0.0.0",
        "underscore": "0.0.0"
    },
    "provides": [
        {
            "ep": "command",
            "name": "worker",
            "description": "Low-level web worker control (for plugin development)"
        },
        {
            "ep": "command",
            "name": "worker restart",
            "description": "Restarts all web workers (for plugin development)",
            "pointer": "#workerRestartCommand"
        }
    ]
});
"end";

if (window == null) {
    throw new Error('The "worker_manager" plugin can only be loaded in the ' +
        'browser, not a web worker. Use "worker" instead.');
}

var proxy = require('bespin:proxy');
var plugins = require('bespin:plugins');
var console = require('bespin:console').console;
var _ = require('underscore')._;
var Event = require('events').Event;
var Promise = require('bespin:promise').Promise;
var env = require('environment').env;

var workerManager = {
    _workers: [],

    add: function(workerSupervisor) {
        this._workers.push(workerSupervisor);
    },

    remove: function(workerSupervisor) {
        this._workers = _(this._workers).without(workerSupervisor);
    },

    restartAll: function() {
        var workers = this._workers;
        _(workers).invoke('kill');
        _(workers).invoke('start');
    }
};

function WorkerSupervisor(pointer) {
    var m = /^([^#:]+)(?::([^#:]+))?#([^#:]+)$/.exec(pointer);
    if (m == null) {
        throw new Error('WorkerSupervisor: invalid pointer specification: "' +
            pointer + '"');
    }

    var packageId = m[1], target = m[3];
    var moduleId = packageId + ":" + (m[2] != null ? m[2] : "index");
    var base = bespin != null && bespin.base != null ? bespin.base : "";

    this._packageId = packageId;
    this._moduleId = moduleId;
    this._base = base;
    this._target = target;

    this._worker = null;
    this._currentId = 0;

    this.started = new Event();
}

WorkerSupervisor.prototype = {
    _onError: function(ev) {
        this._worker = null;
        workerManager.remove(this);

        console.error("WorkerSupervisor: worker failed at file " +
            ev.filename + ":" + ev.lineno + "; fix the worker and use " +
            "'worker restart' to restart it");
    },

    _onMessage: function(ev) {
        var msg = JSON.parse(ev.data);
        switch (msg.op) {
        case 'finish':
            if (msg.id === this._currentId) {
                var promise = this._promise;

                // We have to set the promise to null first, in case the user's
                // then() handler on the promise decides to send another
                // message to the object.
                this._promise = null;

                promise.resolve(msg.result);
            }
            break;

        case 'log':
            console[msg.method].apply(console, msg.args);
            break;
        }
    },

    _promise: null,

    /** An event that fires whenever the worker is started or restarted. */
    started: null,

    /**
     * Terminates the worker. After this call, the worker can be restarted via
     * a call to start().
     */
    kill: function() {
        var oldPromise = this._promise;
        if (oldPromise != null) {
            oldPromise.reject("killed");
            this._promise = null;
        }

        this._worker.terminate();
        this._worker = null;
        workerManager.remove(this);
    },

    /**
     * Invokes a method on the target running in the worker and returns a
     * promise that will resolve to the result of that method.
     */
    send: function(method, args) {
        var oldPromise = this._promise;
        if (oldPromise != null) {
            oldPromise.reject("interrupted");
            this._currentId++;
        }

        var id = this._currentId;
        var promise = new Promise();
        this._promise = promise;

        var msg = { op: 'invoke', id: id, method: method, args: args };
        this._worker.postMessage(JSON.stringify(msg));

        return promise;
    },

    /**
     * Starts the worker. Immediately after this method is called, the
     * "started" event will fire.
     */
    start: function() {
        if (this._worker != null) {
            throw new Error("WorkerSupervisor: worker already started");
        }

        var base = this._base, target = this._target;
        var packageId = this._packageId, moduleId = this._moduleId;

        var worker = new proxy.Worker(base + "BespinEmbedded.js");

        worker.onmessage = this._onMessage.bind(this);
        worker.onerror = this._onError.bind(this);

        var msg = {
            op:     'load',
            base:   base,
            pkg:    packageId,
            module: moduleId,
            target: target
        };
        worker.postMessage(JSON.stringify(msg));

        this._worker = worker;
        this._currentId = 0;

        workerManager.add(this);

        this.started();
    }
};

function workerRestartCommand(args, req) {
    workerManager.restartAll();
}

exports.WorkerSupervisor = WorkerSupervisor;
exports.workerManager = workerManager;
exports.workerRestartCommand = workerRestartCommand;


});
;bespin.tiki.register("::edit_session", {
    name: "edit_session",
    dependencies: { "events": "0.0.0" }
});
bespin.tiki.module("edit_session:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var Promise = require('bespin:promise').Promise;
var catalog = require('bespin:plugins').catalog;
var util = require('bespin:util/util');

var Event = require("events").Event;

exports.EditSession = function() { };

exports.EditSession.prototype = {
    /**
     * @property{TextView}
     *
     * The 'current' view is the editor component that most recently had
     * the focus.
     */
    _currentView: null,


    /**
     * @type{string}
     * The name of the user, or null if no user is logged in.
     */
    currentUser: null,

    /**
     * The history object to store file history in.
     */
    history: null,

    /**
     * figures out the full path, taking into account the current file
     * being edited.
     */
    getCompletePath: function(path) {
        if (path == null) {
            path = '';
        }

        if (path == null || path.substring(0, 1) != '/') {
            var buffer;
            if (this._currentView && this._currentView.buffer) {
                buffer = this._currentView.buffer;
            }
            var file;
            if (buffer) {
                file = buffer.file;
            }
            if (!file) {
                path = '/' + path;
            } else {
                path = file.parentdir() + path;
            }
        }

        return path;
    }
};

Object.defineProperties(exports.EditSession.prototype, {
    currentView: {
        set: function(newView) {
            var oldView = this._currentView;
            if (newView !== oldView) {
                this._currentView = newView;
            }
        },
        
        get: function() {
            return this._currentView;
        }
    }
});

/*
 * set up a session based on a view. This seems a bit convoluted and is
 * likely to change.
 */
exports.createSession = function(view, user) {
    var session = new exports.EditSession();
    if (view) {
        session.currentView = view.textView;
    }
    if (user) {
        session.currentUser = user;
    }
    return session;
};

});
;bespin.tiki.register("::syntax_manager", {
    name: "syntax_manager",
    dependencies: { "worker_manager": "0.0.0", "events": "0.0.0", "underscore": "0.0.0", "syntax_directory": "0.0.0" }
});
bespin.tiki.module("syntax_manager:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var _ = require('underscore')._;
var Event = require('events').Event;
var WorkerSupervisor = require('worker_manager').WorkerSupervisor;
var console = require('bespin:console').console;
var rangeutils = require('rangeutils:utils/range');
var syntaxDirectory = require('syntax_directory').syntaxDirectory;

// The number of lines to highlight at once.
var GRANULARITY = 100;

// Replaces elements at position i in dest with the elements of src. If i is
// beyond the end of dest, expands dest with copies of fill.
function replace(dest, i, src, fill) {
    while (dest.length < i) {
        dest.push(_(fill).clone());
    }

    var args = [ i, src.length ].concat(src);
    Array.prototype.splice.apply(dest, args);
    return dest;
}

// A simple key-value store in which each key is paired with a corresponding
// line. When the syntax information is updated for a line, the symbols from
// those lines are wiped out and replaced with the new symbols.
function Symbols() {
    this._lines = [];
    this._syms = {};
}

Symbols.prototype = {
    get: function(sym) {
        return this._syms["-" + sym];
    },

    replaceLine: function(row, newSymbols) {
        var lines = this._lines, syms = this._syms;
        if (row < lines.length && _(lines[row]).isArray()) {
            _(lines[row]).each(function(ident) { delete syms["-" + ident]; });
        }

        function stripLeadingDash(s) { return s.substring(1); }
        lines[row] = _(newSymbols).keys().map(stripLeadingDash);

        _(syms).extend(newSymbols);
    }
};

function Context(syntaxInfo, syntaxManager) {
    this._syntaxInfo = syntaxInfo;
    this._syntaxManager = syntaxManager;

    this._invalidRow = 0;
    this._states = [];
    this._active = false;

    this.symbols = new Symbols;
}

Context.prototype = {
    _annotate: function() {
        if (this._invalidRow == null) {
            throw new Error("syntax_manager.Context: attempt to annotate " +
                "without any invalid row");
        }
        if (!this._active) {
            throw new Error("syntax_manager.Context: attempt to annotate " +
                "while inactive");
        }

        if (this._worker == null) {
            this._createWorker();
            return;
        }

        var lines = this._syntaxManager.getTextLines();
        var row = this._invalidRow;
        var state = row === 0 ? this.getName() + ':start' : this._states[row];
        var lastRow = Math.min(lines.length, row + GRANULARITY);
        lines = lines.slice(row, lastRow);

        var runRange = {
            start: { row: row, col: 0 },
            end: { row: lastRow - 1, col: _(lines).last().length }
        };

        var pr = this._worker.send('annotate', [ state, lines, runRange ]);
        pr.then(_(this._annotationFinished).bind(this, row, lastRow));
    },

    _annotationFinished: function(row, lastRow, result) {
        if (!this._active) {
            return;
        }

        var syntaxManager = this._syntaxManager;
        syntaxManager.mergeAttrs(row, result.attrs);
        syntaxManager.mergeSymbols(row, result.symbols);

        replace(this._states, row, result.states);

        if (lastRow >= this._getRowCount()) {
            this._invalidRow = null;    // We're done!
            this._active = false;
            return;
        }

        this._invalidRow = lastRow;
        this._annotate();
    },

    _createWorker: function() {
        var syntaxInfo = this._syntaxInfo;
        if (syntaxInfo == null) {
            return false;
        }

        var worker = new WorkerSupervisor("syntax_worker#syntaxWorker");
        this._worker = worker;

        worker.started.add(this._workerStarted.bind(this));
        worker.start();

        return true;
    },

    _getRowCount: function() {
        return this._syntaxManager.getTextLines().length;
    },

    _workerStarted: function() {
        this._worker.send('loadSyntax', [ this._syntaxInfo.name ]);
        if (this._active) {
            this._annotate();
        }
    },

    // Switches on this syntax context and begins annotation. It is the
    // caller's responsibility to ensure that there exists an invalid row
    // before calling this. (Typically the caller ensures this by calling cut()
    // first.)
    activateAndAnnotate: function() {
        this._active = true;
        this._annotate();
    },

    contextsAtPosition: function(pos) {
        var syntaxInfo = this._syntaxInfo;
        if (syntaxInfo == null) {
            return [ 'plain' ];
        }

        return [ syntaxInfo.name ];             // FIXME
    },

    // Invalidates the syntax context at a row.
    cut: function(row) {
        var endRow = this._getRowCount();
        if (row < 0 || row >= endRow) {
            throw new Error("Attempt to cut the context at an invalid row");
        }

        if (this._invalidRow != null && this._invalidRow < row) {
            return;
        }
        this._invalidRow = row;

        // Mark ourselves as inactive, so that if the web worker was working on
        // a series of rows we know to discard its results.
        this._active = false;
    },

    getName: function() {
        return this._syntaxInfo.name;
    },

    kill: function() {
        var worker = this._worker;
        if (worker == null) {
            return;
        }

        worker.kill();
        this._worker = null;
    }
};

/**
 * The syntax manager coordinates a series of syntax contexts, each run in a
 * separate web worker. It receives text editing notifications, updates and
 * stores the relevant syntax attributes, and provides marked-up text as the
 * layout manager requests it.
 *
 * @constructor
 * @exports SyntaxManager as syntax_manager:SyntaxManager
 */
function SyntaxManager(layoutManager) {
    this.layoutManager = layoutManager;

    /** Called whenever the attributes have been updated. */
    this.attrsChanged = new Event;

    /** Called whenever the syntax (file type) has been changed. */
    this.syntaxChanged = new Event;

    this._context = null;
    this._invalidRows = null;
    this._contextRanges = null;
    this._attrs = [];
    this._symbols = new Symbols;
    this._syntax = 'plain';

    this._reset();
}

SyntaxManager.prototype = {
    /** @lends SyntaxManager */

    _getTextStorage: function() {
        return this.layoutManager.textStorage;
    },

    // Invalidates all the highlighting and recreates the workers.
    _reset: function() {
        var ctx = this._context;
        if (ctx != null) {
            ctx.kill();
            this._context = null;
        }

        var syn = this._syntax;
        var syntaxInfo = syn === 'plain' ? null : syntaxDirectory.get(syn);

        ctx = new Context(syntaxInfo, this);
        this._context = ctx;
        ctx.activateAndAnnotate();
    },

    attrsChanged: null,
    syntaxChanged: null,

    /** Returns the contexts that are active at the position pos. */
    contextsAtPosition: function(pos) {
        return this._context.contextsAtPosition(pos);
    },

    /**
     * Returns the attributes most recently delivered from the syntax engine.
     * Does not instruct the engine to perform any work; use invalidateRow()
     * for that.
     */
    getAttrsForRows: function(startRow, endRow) {
        return this._attrs.slice(startRow, endRow);
    },

    /**
     * Returns the metadata currently associated with the given symbol, or null
     * if the symbol is unknown.
     */
    getSymbol: function(ident) {
        return this._symbols.get(ident);
    },

    /** Returns the current syntax. */
    getSyntax: function() {
        return this._syntax;
    },

    /** A convenience function to return the lines from the text storage. */
    getTextLines: function() {
        return this._getTextStorage().lines;
    },

    /** Marks the text as needing an update starting at the given row. */
    invalidateRow: function(row) {
        var ctx = this._context;
        ctx.cut(row);
        ctx.activateAndAnnotate();
    },

    /**
     * Merges the supplied attributes into the text, overwriting the attributes
     * that were there previously.
     */
    mergeAttrs: function(startRow, newAttrs) {
        replace(this._attrs, startRow, newAttrs, []);
        this.attrsChanged(startRow, startRow + newAttrs.length);
    },

    /**
     * Merges the supplied symbols into the symbol store, overwriting any
     * symbols previously defined on those lines.
     */
    mergeSymbols: function(startRow, newSymbols) {
        var symbols = this._symbols;
        _(newSymbols).each(function(lineSyms, i) {
            symbols.replaceLine(startRow + i, lineSyms);
        });
    },

    /**
     * Sets the syntax and invalidates all the highlighting. If no syntax
     * plugin is available, sets the syntax to "plain".
     */
    setSyntax: function(syntax) {
        this._syntax = syntaxDirectory.hasSyntax(syntax) ? syntax : 'plain';
        this.syntaxChanged(syntax);
        this._reset();
    },

    /** Sets the syntax appropriately for a file extension. */
    setSyntaxFromFileExt: function(fileExt) {
        return this.setSyntax(syntaxDirectory.syntaxForFileExt(fileExt));
    }
};

exports.SyntaxManager = SyntaxManager;


});
;bespin.tiki.register("::completion", {
    name: "completion",
    dependencies: { "jquery": "0.0.0", "ctags": "0.0.0", "rangeutils": "0.0.0", "canon": "0.0.0", "underscore": "0.0.0" }
});
bespin.tiki.module("completion:controller",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var ctags = require('ctags');
var range = require('rangeutils:utils/range');
var CompletionUI = require('completion:ui').CompletionUI;
var catalog = require('bespin:plugins').catalog;
var env = require('environment').env;

function CompletionController(editorView) {
    this._editorView = editorView;
    editorView.selectionChanged.add(this._selectionChanged.bind(this));
    editorView.willChangeBuffer.add(this._willChangeBuffer.bind(this));

    // Prebind _syntaxChanged so that we can attach and detach it.
    this._syntaxChanged = this._syntaxChanged.bind(this);

    this.tags = new ctags.Tags();
    this.ui = new CompletionUI(editorView.element);
}

CompletionController.prototype = {
    _buffer: null,
    _completionEngine: null,
    _completions: null,
    _stem: null,

    _hideCompletions: function() {
        this.ui.hide();
    },

    _selectionChanged: function(newRange) {
        var engine = this._completionEngine;
        if (engine == null || !range.isZeroLength(newRange)) {
            return;
        }

        var layoutManager = this._buffer.layoutManager;
        var textStorage = layoutManager.textStorage;
        var syntaxManager = layoutManager.syntaxManager;

        var pos = newRange.start;
        var row = pos.row, col = pos.col;
        var line = textStorage.lines[row];
        var prefix = line.substring(0, col), suffix = line.substring(col);

        var completions = engine.getCompletions(prefix, suffix, syntaxManager);
        if (completions == null) {
            this._hideCompletions();
            return;
        }

        var tags = completions.tags;
        this._stem = completions.stem;
        this._showCompletions(tags);
    },

    _showCompletions: function(completions) {
        var editorView = this._editorView;
        var cursorPt = editorView.textView.getInsertionPointPosition();
        var pt = editorView.convertTextViewPoint(cursorPt);
        var lineHeight = editorView.layoutManager.fontDimension.lineHeight;
        this.ui.show(completions, pt, lineHeight);
    },

    _syntaxChanged: function(newSyntax) {
        var ext = catalog.getExtensionByKey('completion', newSyntax);
        if (ext == null) {
            this._completionEngine = null;
            return;
        }

        ext.load().then(function(engine) {
            this._completionEngine = new engine(this.tags);
        }.bind(this));
    },

    _willChangeBuffer: function(newBuffer) {
        var oldBuffer = this._buffer;
        if (oldBuffer != null) {
            var oldSyntaxManager = oldBuffer.layoutManager.syntaxManager;
            oldSyntaxManager.syntaxChanged.remove(this._syntaxChanged);
        }

        var newSyntaxManager = newBuffer.layoutManager.syntaxManager;
        newSyntaxManager.syntaxChanged.add(this._syntaxChanged);

        this._buffer = newBuffer;
    },

    cancel: function(env) {
        this.ui.hide();
    },

    complete: function(env) {
        var ui = this.ui;
        var tag = ui.getCompletion();
        var ident = tag.name;
        env.view.insertText(ident.substring(this._stem.length));
        ui.hide();
    },

    isCompleting: function() {
        return this.ui.visible;
    },

    moveDown: function(env) {
        this.ui.move('down');
    },

    moveUp: function(env) {
        this.ui.move('up');
    },

    /** The current store of tags. */
    tags: null
};

function makeCommand(name) {
    return function(args, req) {
        return env.editor.completionController[name](env);
    };
}

exports.CompletionController = CompletionController;
exports.completeCommand = makeCommand('complete');
exports.completeCancelCommand = makeCommand('cancel');
exports.completeDownCommand = makeCommand('moveDown');
exports.completeUpCommand = makeCommand('moveUp');


});

bespin.tiki.module("completion:ui",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var $ = require('jquery').$;
var _ = require('underscore')._;

var ANIMATION_SPEED = 100;  // in ms

var populate_container_template =
    _.template('<span class="bespin-completion-container"> &mdash; ' +
        '<%= container %></span>');
var populate_second_row_template =
    _.template('<div class="bespin-completion-second-row"><%= type %></div>');
var populate_item_template =
    _.template('<li><div class="bespin-completion-top-row">' +
        '<span class="bespin-completion-kind bespin-completion-kind-' +
            '<%= kind %>"><%= kind %></span>' +
        '<span class="bespin-completion-ident"><%= ident %></span>' +
            '<%= container %></div><%= second_row %></li>');

function CompletionUI(parent) {
    var id = _.uniqueId('bespin-completion-panel');

    var panel = document.createElement("div");
    panel.id = id;
    panel.className = "bespin-completion-panel";
    panel.style.display = 'none';
    panel.innerHTML =
        '<div class="bespin-completion-pointer"></div>' +
        '<div class="bespin-completion-bubble-outer">' +
            '<div class="bespin-completion-bubble-inner">' +
                '<div class="bespin-completion-highlight"></div>' +
                '<ul></ul>' +
            '</div>' +
        '</div>';

    $(parent).append(panel);

    this.panel = $(panel);
    this.parent = $(parent);
}

CompletionUI.prototype = {
    _fromBottom: false,
    _index: 0,
    _tags: null,

    _getHighlightDimensions: function(elem) {
        var pos = elem.position();
        var height = elem.outerHeight() - 2;
        var width = elem.outerWidth() - 2;
        return { left: pos.left, top: pos.top, height: height, width: width };
    },

    _listItemForIndex: function(idx) {
        return this.panel.find("li:eq(" + idx + ")");
    },

    _populate: function() {
        var html = _(this._tags).map(function(tag) {
            var klass = tag['class'], module = tag.module, ns = tag.namespace;

            var container;
            if (klass != null) {
                container = klass;
            } else if (ns != null) {
                container = ns;
            } else {
                container = "";
            }

            if (module != null) {
                container = module + (container != "" ? "#" + container : "");
            }

            var container_html = (container == "") ? "" :
                populate_container_template({ container: container });

            var type = tag.type;
            var second_row_html = (type == null) ? "" :
                populate_second_row_template({ type: type });

            return populate_item_template({
                kind:       tag.kind,
                ident:      tag.name,
                container:  container_html,
                second_row: second_row_html
            });
        });

        this.panel.find("ul").html(html.join("\n"));
    },

    panel: null,
    visible: false,

    getCompletion: function() {
        return this.visible ? this._tags[this._index] : null;
    },

    hide: function() {
        if (!this.visible) {
            return;
        }

        this.panel.fadeOut(ANIMATION_SPEED);
        this.visible = false;
    },

    move: function(dir) {
        var index = this._index;

        var sel = this._listItemForIndex(index);

        var unsel = (dir === 'up') ? sel.prev() : sel.next();
        if (unsel.length === 0) {
            return;
        }

        index = (dir === 'up') ? index - 1 : index + 1;
        this._index = index;

        var selFirstRow = $(sel).find('.bespin-completion-top-row');
        var selSecondRow = $(sel).find('.bespin-completion-second-row');
        var unselFirstRow = $(unsel).find('.bespin-completion-top-row');
        var unselSecondRow = $(unsel).find('.bespin-completion-second-row');

        selSecondRow.hide();
        unselSecondRow.show();

        var highlight = this.panel.find(".bespin-completion-highlight");
        highlight.stop(true, true);
        var highlightDimensions = this._getHighlightDimensions(unsel);
        highlight.animate(highlightDimensions, ANIMATION_SPEED);
        unselSecondRow.hide();

        if (dir === 'down') {
            var height = selSecondRow.height();
            unselFirstRow.css('top', height);
            unselFirstRow.animate({ top: 0 }, ANIMATION_SPEED);
        } else {
            var height = unselSecondRow.height();
            selFirstRow.css('top', -height);
            selFirstRow.animate({ top: 0 }, ANIMATION_SPEED);
        }

        unselSecondRow.fadeIn();
    },

    show: function(tags, point, lineHeight) {
        var tags = _(tags).clone();
        this._tags = tags;

        this._populate();

        var visible = this.visible;
        var panel = this.panel;
        panel.stop(true, true);
        if (!visible) {
            panel.show();
        }

        var parentOffset = this.parent.offset();
        var parentX = parentOffset.left, parentY = parentOffset.top;
        var absX = parentX + point.x, absY = parentY + point.y;

        var panelWidth = panel.outerWidth(), panelHeight = panel.outerHeight();
        var windowWidth = $(window).width(), windowHeight = $(window).height();

        var fromBottom = absY + panelHeight + lineHeight > windowHeight;
        this._fromBottom = fromBottom;

        if (this._index >= tags.length) {
            this._index = tags.length - 1;
        }

        var pointer;
        if (fromBottom) {
            pointer = panel.find('.bespin-completion-pointer');
            pointer.removeClass('bespin-completion-pointer-up');
            pointer.addClass('bespin-completion-pointer-down');
            panel.css({ bottom: -point.y, top: "" });

            // Reverse the list.
            this._tags.reverse();
            this._populate();

            if (!visible) {
                this._index = tags.length - 1;
            }
        } else {
            pointer = panel.find('.bespin-completion-pointer');
            pointer.removeClass('bespin-completion-pointer-down');
            pointer.addClass('bespin-completion-pointer-up');
            panel.css({ top: point.y + lineHeight, bottom: "" });

            if (!visible) {
                this._index = 0;
            }
        }

        if (!visible) {
            var fromRight = absX + point.x + panelWidth > windowWidth;
            if (fromRight) {
                pointer.css({ left: "", right: 32 });
                panel.css('left', Math.min(windowWidth - panelWidth - parentX,
                    point.x - panelWidth + 43));
            } else {
                pointer.css({ left: 32, right: "" });
                panel.css('left', Math.max(parentX, point.x - 43));
            }

            panel.hide().animate({ opacity: 'show' }, ANIMATION_SPEED);
        }

        var highlight = panel.find(".bespin-completion-highlight");
        highlight.stop(true, true);
        var sel = this._listItemForIndex(this._index);
        sel.find(".bespin-completion-second-row").show();

        var highlightDimensions = this._getHighlightDimensions(sel);
        var highlightWidth = highlightDimensions.width;
        var highlightHeight = highlightDimensions.height;
        highlight.css(highlightDimensions);

        this.visible = true;
    }
};

exports.CompletionUI = CompletionUI;


});

bespin.tiki.module("completion:index",function(require,exports,module) {

});
;bespin.tiki.register("::rangeutils", {
    name: "rangeutils",
    dependencies: {  }
});
bespin.tiki.module("rangeutils:utils/range",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');

/**
 * Returns the result of adding the two positions.
 */
exports.addPositions = function(a, b) {
    return { row: a.row + b.row, col: a.col + b.col };
};

/** Returns a copy of the given range. */
exports.cloneRange = function(range) {
    var oldStart = range.start, oldEnd = range.end;
    var newStart = { row: oldStart.row, col: oldStart.col };
    var newEnd = { row: oldEnd.row, col: oldEnd.col };
    return { start: newStart, end: newEnd };
};

/**
 * Given two positions a and b, returns a negative number if a < b, 0 if a = b,
 * or a positive number if a > b.
 */
exports.comparePositions = function(positionA, positionB) {
    var rowDiff = positionA.row - positionB.row;
    return rowDiff === 0 ? positionA.col - positionB.col : rowDiff;
};

/**
 * Returns true if the two ranges are equal and false otherwise.
 */
exports.equal = function(rangeA, rangeB) {
    return (exports.comparePositions(rangeA.start, rangeB.start) === 0 &&
                exports.comparePositions(rangeA.end, rangeB.end) === 0);
};

exports.extendRange = function(range, delta) {
    var end = range.end;
    return {
        start: range.start,
        end:   {
            row: end.row + delta.row,
            col: end.col + delta.col
        }
    };
};

/**
 * Given two sets of ranges, returns the ranges of characters that exist in one
 * of the sets but not both.
 */
exports.intersectRangeSets = function(setA, setB) {
    var stackA = util.clone(setA), stackB = util.clone(setB);
    var result = [];
    while (stackA.length > 0 && stackB.length > 0) {
        var rangeA = stackA.shift(), rangeB = stackB.shift();
        var startDiff = exports.comparePositions(rangeA.start, rangeB.start);
        var endDiff = exports.comparePositions(rangeA.end, rangeB.end);

        if (exports.comparePositions(rangeA.end, rangeB.start) < 0) {
            // A is completely before B
            result.push(rangeA);
            stackB.unshift(rangeB);
        } else if (exports.comparePositions(rangeB.end, rangeA.start) < 0) {
            // B is completely before A
            result.push(rangeB);
            stackA.unshift(rangeA);
        } else if (startDiff < 0) {     // A starts before B
            result.push({ start: rangeA.start, end: rangeB.start });
            stackA.unshift({ start: rangeB.start, end: rangeA.end });
            stackB.unshift(rangeB);
        } else if (startDiff === 0) {   // A and B start at the same place
            if (endDiff < 0) {          // A ends before B
                stackB.unshift({ start: rangeA.end, end: rangeB.end });
            } else if (endDiff > 0) {   // A ends after B
                stackA.unshift({ start: rangeB.end, end: rangeA.end });
            }
        } else if (startDiff > 0) {     // A starts after B
            result.push({ start: rangeB.start, end: rangeA.start });
            stackA.unshift(rangeA);
            stackB.unshift({ start: rangeA.start, end: rangeB.end });
        }
    }
    return result.concat(stackA, stackB);
};

exports.isZeroLength = function(range) {
    return range.start.row === range.end.row &&
        range.start.col === range.end.col;
};

/**
 * Returns the greater of the two positions.
 */
exports.maxPosition = function(a, b) {
    return exports.comparePositions(a, b) > 0 ? a : b;
};

/**
 * Converts a range with swapped 'end' and 'start' values into one with the
 * values in the correct order.
 *
 * TODO: Unit test.
 */
exports.normalizeRange = function(range) {
    return this.comparePositions(range.start, range.end) < 0 ? range :
        { start: range.end, end: range.start };
};

/**
 * Returns a single range that spans the entire given set of ranges.
 */
exports.rangeSetBoundaries = function(rangeSet) {
    return {
        start:  rangeSet[0].start,
        end:    rangeSet[rangeSet.length - 1].end
    };
};

exports.toString = function(range) {
    var start = range.start, end = range.end;
    return '[ ' + start.row + ', ' + start.col + ' ' + end.row + ',' + + end.col +' ]';
};

/**
 * Returns the union of the two ranges.
 */
exports.unionRanges = function(a, b) {
    return {
        start:  a.start.row < b.start.row ||
            (a.start.row === b.start.row && a.start.col < b.start.col) ?
            a.start : b.start,
        end:    a.end.row > b.end.row ||
            (a.end.row === b.end.row && a.end.col > b.end.col) ?
            a.end : b.end
    };
};

exports.isPosition = function(pos) {
    return !util.none(pos) && !util.none(pos.row) && !util.none(pos.col);
};

exports.isRange = function(range) {
    return (!util.none(range) && exports.isPosition(range.start) &&
                                                exports.isPosition(range.end));
};

});

bespin.tiki.module("rangeutils:index",function(require,exports,module) {

});
;bespin.tiki.register("::undomanager", {
    name: "undomanager",
    dependencies: {  }
});
bespin.tiki.module("undomanager:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');
var env = require('environment').env;

/**
 * This simple undo manager coordinates undo for the app that embeds Bespin.
 * It's similar to SproutCore's UndoManager class, but it separates undo and
 * redo and correctly flushes the redo stack when an action is performed.
 */
exports.UndoManager = function() {};

util.mixin(exports.UndoManager.prototype, {
    _redoStack: [],
    _undoStack: [],

    _undoOrRedo: function(method, stack, otherStack) {
        if (stack.length === 0) {
            return false;
        }

        var record = stack.pop();
        if (!record.target[method](record.context)) {
            this._redoStack = [];
            this._undoStack = [];
            return false;
        }

        otherStack.push(record);
        return true;
    },

    /**
     * Redo the last undone action.
     * @return{boolean} True if the action was successfully redone, false
     *     otherwise.
     */
    redo: function() {
        return this._undoOrRedo('redo', this._redoStack, this._undoStack);
    },

    /**
     * Notifies the undo manager that an action was performed. When the action
     * is to be undone, the 'undo' message will be sent to the target with the
     * given context. When the action is to be redone, the 'redo' message is
     * sent in the same way.
     */
    registerUndo: function(target, context) {
        this._redoStack = [];
        this._undoStack.push({ target: target, context: context });
    },

    /**
     * Undoes the last action.
     *
     * @return{boolean} True if the action was successfully undone, false
     *     otherwise.
     */
    undo: function() {
        return this._undoOrRedo('undo', this._undoStack, this._redoStack);
    }
});

exports.global = new exports.UndoManager();

/**
 *
 */
exports.undoManagerCommand = function(args, request) {
    exports.global[request.commandExt.name]();
};

});
;bespin.tiki.register("::environment", {
    name: "environment",
    dependencies: { "settings": "0.0.0" }
});
bespin.tiki.module("environment:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"define metadata";
({
    "dependencies": {
        "settings": "0.0.0"
    }
});
"end";

var util = require('bespin:util/util');
var console = require('bespin:console').console;
var catalog = require("bespin:plugins").catalog;
var settings = require('settings').settings;

/**
 * The environment plays a similar role to the environment under unix.
 * Bespin does not currently have a concept of variables, (i.e. things the user
 * directly changes, however it does have a number of pre-defined things that
 * are changed by the system.
 * <p>The role of the Environment is likely to be expanded over time.
 */
exports.Environment = function() {
    // The current command line pushes this value into here
    this.commandLine = null;

    // Fire the sizeChanged event when the window is resized.
    window.addEventListener('resize', this.dimensionsChanged.bind(this), false);
};

Object.defineProperties(exports.Environment.prototype, {

    /**
     * Provides a get() and set() function to set and get settings.
     */
    settings: {
        value: {
            set: function(key, value) {
                if (util.none(key)) {
                    throw new Error('setSetting(): key must be supplied');
                }
                if (util.none(value)) {
                    throw new Error('setSetting(): value must be supplied');
                }

                settings.set(key, value);
            },
            
            get: function(key) {
                if (util.none(key)) {
                    throw new Error('getSetting(): key must be supplied');
                }
                return settings.get(key);
            }
        }
    },

    dimensionsChanged: {
        value: function() {
            catalog.publish(this, 'dimensionsChanged');
        }
    },

    /**
     * Retrieves the EditSession
     */
    session: {
        get: function() {
            return catalog.getObject('session');
        }
    },

    /**
     * Gets the currentView from the session.
     */
    view: {
        get: function() {
            if (!this.session) {
                // This can happen if the session is being reloaded.
                return null;
            }
            return this.session.currentView;
        }
    },

    /**
     * Gets the currentEditor from the session.
     */
    editor: {
        get: function() {
            if (!this.session) {
                // This can happen if the session is being reloaded.
                return null;
            }
            return this.session.currentView.editor;
        }
    },

    /**
     * Returns the currently-active syntax contexts.
     */
    contexts: {
        get: function() {
            // when editorapp is being refreshed, the textView is not available.
            if (!this.view) {
                return [];
            }

            var syntaxManager = this.view.editor.layoutManager.syntaxManager;
            var pos = this.view.getSelectedRange().start;
            return syntaxManager.contextsAtPosition(pos);
        }
    },

    /**
     * The current Buffer from the session
     */
    buffer: {
        get: function() {
            if (!this.session) {
                console.error("command attempted to get buffer but there's no session");
                return undefined;
            }
            return this.view.editor.buffer;
        }
    },

    /**
     * The current editor model might not always be easy to find so you should
     * use <code>instruction.model</code> to access the view where
     * possible.
     */
    model: {
        get: function() {
            if (!this.buffer) {
                console.error('Session has no current buffer');
                return undefined;
            }
            return this.view.editor.layoutManager.textStorage;
        }
    },

    /**
     * gets the current file from the session
     */
    file: {
        get: function() {
            if (!this.buffer) {
                console.error('Session has no current buffer');
                return undefined;
            }
            return this.buffer.file;
        }
    },

    /**
     * If files are available, this will get them. Perhaps we need some other
     * mechanism for populating these things from the catalog?
     */
    files: {
        get: function() {
            return catalog.getObject('files');
        }
    }
});

/**
 * The global environment used throughout this Bespin instance.
 */
exports.env = new exports.Environment();

});
;bespin.tiki.register("::ctags", {
    name: "ctags",
    dependencies: { "traits": "0.0.0", "underscore": "0.0.0" }
});
bespin.tiki.module("ctags:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var _ = require('underscore')._;
var TagReader = require('./reader').TagReader;
var Trait = require('traits').Trait;

exports.Tags = function() {
    this.tags = [];
};

exports.Tags.prototype = Object.create(Object.prototype, Trait.compose(Trait({
    _search: function(id, pred) {
        var shadowTag = { name: id };
        var tags = this.tags;
        var index = _(tags).sortedIndex(shadowTag, function(tag) {
            return tag.name;
        });

        var start = index, end = index;
        while (start >= 0 && start < tags.length && pred(tags[start])) {
            start--;
        }
        while (end >= 0 && end < tags.length && pred(tags[end])) {
            end++;
        }

        return tags.slice(start + 1, end);
    },

    add: function(newTags) {
        var tags = this.tags;
        Array.prototype.push.apply(tags, newTags);

        tags.sort(function(a, b) {
            var nameA = a.name, nameB = b.name;
            if (nameA < nameB) {
                return -1;
            }
            if (nameA === nameB) {
                return 0;
            }
            return 1;
        });
    },

    /** Returns all the tags that match the given identifier. */
    get: function(id) {
        return this._search(id, function(tag) { return tag.name === id; });
    },

    /**
     * Adds the tags from the supplied JavaScript file to the internal store of
     * tags.
     */
    scan: function(src, file, opts) {
        if (opts === null || opts === undefined) {
            opts = {};
        }

        var lines = src.split("\n");
        var ast = parse(src, file, 1);

        var interp = new Interpreter(ast, file, lines, opts);
        interp.interpret();
        this.add(interp.tags);
    },

    /** Returns all the tags that begin with the given prefix. */
    stem: function(prefix) {
        var len = prefix.length;
        return this._search(prefix, function(tag) {
            return tag.name.substring(0, len) === prefix;
        });
    }
}), TagReader));


});

bespin.tiki.module("ctags:reader",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var _ = require('underscore')._;
var Trait = require('traits').Trait;

exports.TagReader = Trait({
    readLines: function(lines) {
        var tags = [];

        _(lines).each(function(line) {
            var parts = line.split("\t");
            if (parts.length < 3) {
                return;
            }

            var name = parts[0];
            if (/^!_TAG_/.test(name)) {
                return;
            }

            // TODO: cope with tab characters in the addr
            var tag = { name: name, tagfile: parts[1], addr: parts[2] };

            var fieldIndex;
            if (parts.length > 3 && parts[3].indexOf(":") === -1) {
                tag.kind = parts[3];
                fieldIndex = 4;
            } else {
                fieldIndex = 3;
            }

            var fields = {};
            _(parts.slice(fieldIndex)).each(function(field) {
                var match = /^([^:]+):(.*)/.exec(field);
                fields[match[1]] = match[2];
            });
            tag.fields = fields;

            tags.push(tag);
        });

        this.add(tags);
    },

    readString: function(str) {
        this.readLines(str.split("\n"));
    }
});


});
;bespin.tiki.register("::theme_manager", {
    name: "theme_manager",
    dependencies: { "theme_manager_base": "0.0.0", "settings": "0.0.0", "events": "0.0.0", "less": "0.0.0" }
});
bespin.tiki.module("theme_manager:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var Promise = require('bespin:promise').Promise;
var catalog = require('bespin:plugins').catalog;
var Event = require('events').Event;
var themestyles = require('themestyles');
var settings = require('settings').settings;

// The current themeExt used on the page.
var currentThemeExt = null;

// Name of the themePlugin that is used as standard theme. This is not the
// base theme.
var standardThemeName = null;

// Load promise for the basePlugin.
var basePluginLoadPromise = null;

// Export the themeStyles object. This is necessary, as in some cases you want
// to access the themeStyles object when the `themeChange` event was fired.
exports.themestyles = themestyles;

exports.themeSettingChanged = function(source, settingName, themeName) {
    // Get the themeExtensionPoint for 'themeName'
    var themeExt = catalog.getExtensionByKey('theme', themeName);

    // 'themeName' === standard : Remove the current set theme.
    // !themeName || !themeExt  : The named theme couldn't get found
    if (themeName === 'standard' || !themeName || !themeExt) {
        themeExt = null;
        // If a standardTheme is given, try to get it.
        if (standardThemeName !== null) {
            themeExt = catalog.getExtensionByKey('theme', standardThemeName);

        }
    }

    // If no theme should get applied (including no standardTheme).
    if (!themeExt) {
        // If there is a currentTheme before switching to 'standard' which means
        // removing the currentTheme as applied on the page.
        if (currentThemeExt) {
            // There might be a themeStyle file to remove.
            themestyles.unregisterThemeStyles(currentThemeExt);

            currentThemeExt = null;

            // Reset the themeVariables applied by the theme.
            themestyles.currentThemeVariables = null;

            // Update the globalVariables.
            themestyles.parseGlobalVariables();

            // Reparse all the applied themeStyles.
            themestyles.reparse();

            // Publish the 'themeChange' event.
            catalog.publish(this, 'themeChange');
        }
        return;
    } else {
        themeExt.load().then(function(theme) {
            // Remove the former themeStyle file, if the former extension has
            // one declaired.
            if (currentThemeExt) {
                themestyles.unregisterThemeStyles(currentThemeExt);
            }

            // The theme is a function. Execute it to get the themeData.
            themestyles.currentThemeVariables = theme();

            // Store the data for later use.
            currentThemeExt = themeExt;

            // Update the globalVariables.
            themestyles.parseGlobalVariables();

            // Reparse all the applied themeStyles.
            themestyles.reparse();

            // If the theme has a url that points to a themeStyles file, then
            // register it.
            if (themeExt.url) {
                themestyles.registerThemeStyles(themeExt);
            }

            // Publish the 'themeChange' event.
            catalog.publish(exports, 'themeChange');
        });
    }
};

catalog.registerExtension('settingChange', {
    match: "theme",
    pointer: exports.themeSettingChanged.bind(exports)
});

/**
 * Sets the standard theme that is used when no other theme is specified or
 * the specified theme is not around.
 */
exports.setStandardTheme = function(themeName) {
    standardThemeName = themeName;

    // If the current theme is equal to themeName, then the theme is already
    // applied. Otherwise, call themeSttingChanged which handles the standard-
    // theme change then.
    if (themeName !== settings.get('theme')) {
        exports.themeSettingChanged(this);
    }
};

/**
 * Sets the plugin that should get treated as 'basePlugin'. BasePlugins contains
 * the generic theming for buttons, inputs, panes etc.
 */
exports.setBasePlugin = function(pluginName) {
    // Set the basePlugin.
    themestyles.basePluginName = pluginName;
};

/**
 * This function has to be called to enable parsing. Before calling this
 * function, parsing is prevented. This allows the developer to prevent parsing
 * until certain basic theme plugins are loaded.
 * Returns a promise that is resolved after all currently applied themeStyles
 * are parsed.
 */
exports.startParsing = function() {
    // Allow the parsing.
    themestyles.preventParsing = false;

    // Reparse all the applied themeStyles.
    return themestyles.reparse();
};

exports.registerTheme = function(extension) {
    var currentThemeName = settings.get('theme');
    if (extension.name === currentThemeName) {
        exports.themeSettingChanged(this, 'theme', extension.name);
    }
};

exports.unregisterTheme = function(extension) {
    if (extension.name === settings.get('theme')) {
        exports.themeSettingChanged(this);
    }
};

// Called when the app is launched.
exports.appLaunched = function() {
    // Fire the `themeChange` event as some plugins might haven't triggered it
    // during the launch of the app.
    catalog.publish(exports, 'themeChange');
};

});

bespin.tiki.module("theme_manager:themestyles",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');
var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;
var Promise = require('bespin:promise').Promise;
var group = require('bespin:promise').group;

var proxy = require('bespin:proxy');

var less = require('less');

// The less parser to use.
var lessParser = new less.Parser({ optimization: 3 });

// The incremented styleID number.
var styleID = 1;

// The theme variables as set by the current theme.
exports.currentThemeVariables = null;

// The plugin that should get applied before any other plugins get applied.
exports.basePluginName = null;

// If true, no less file is parsed.
exports.preventParsing = true;

// Stores the variableHeader used by every themeStyleFile for the global
// ThemeVariables.
var globalVariableHeader = '';

// The globalThemeVariables as a combination of the build in once and variables
// defined in a custom theme plugin.
exports.globalThemeVariables = {};

// Stores the internal styleID used with a extension.
var extensionStyleID = {};

// Stores the ThemeStyleFiles' content per plugin - somewhat like a par plugin
// themeStyle cache.
var extensionStyleData = {};

// Takes an JS object that and makes it 'linear'. Every item gets prefixed with
// 'global':
//
//      globalValues = {
//          a: {
//              b: 'test'
//          }
//      }
//
//      returns: { 'global_a_b': 'test' }
var parseGlobalThemeVariables = function(globalValues) {
    var ret = {};
    var nameStack = [];

    var parseSub = function(name, key) {
        nameStack.push(name);
        if (typeof key != 'object') {
            ret[nameStack.join('_')] = key;
        } else {
            for (prop in key) {
                parseSub(prop, key[prop]);
            }
        }
        nameStack.pop();
    };

    parseSub('global', globalValues);
    return ret;
};

//------------------------------------------------------------------------------
// BEGIN: THIS PART IS OVERRIDDEN BY dryice

// Stores the StyleFiles content per plugin during the build of Bespin.
// The variable scheme looks like: { pluginName: { "fileName": data } };
var extensionStyleBuildData = {};

// Stores the default globalTheme ThemeVariables, that are available to every
// ThemeStyleFile.
var defaultGlobalTheme = {
    // standard font.
    font:           'arial, lucida, helvetica, sans-serif',
    // standard font size.
    font_size:      '14px',
    // standard line_height.
    line_height:    '1.8em',
    // text color.
    color:          '#DAD4BA',

    text_shadow:    '1px 1px rgba(0, 0, 0, 0.4)',
    // text error color.
    error_color:    '#F99',
    // the color for headers (<h1> etc).
    header_color:   'white',
    // the color for links.
    link_color:     '#ACF',

    // Basic colors for a controller: textInput, tree etc.
    control: {
        color:          '#E1B41F',
        border:         '1px solid rgba(0, 0, 0, 0.2)',
        border_radius:  '0.25em',
        background:     'rgba(0, 0, 0, 0.2)',

        active: {
            color:          '#FF9600',
            border:         '1px solid #E1B41F',
            inset_color:    '#ff9600',
            background:     'rgba(0, 0, 0, 0.2)'
        }
    },

    pane: {
        h1: {
           font:        "'MuseoSans', Helvetica",
           font_size:   '2.8em',
           color:       "white"
        },

        color:          '#DAD4BA',
        text_shadow:    '1px 1px rgba(0, 0, 0, 0.4)',

        link_color:     'white',

        background:     '#45443C',
        border_radius:  '.5em'
    },

    form: {
        color: 'white',
        text_shadow: '1px 1px rgba(0, 0, 0, 0.4)',

        font: "'Lucida Sans','Lucida Grande',Verdana,Arial,sans-serif",
        font_size: '@global_font_size',
        line_height: '@global_line_height'
    },

    button: {
        color: 'white',
        background: '#3E6CB9'
    },

    container: {
        background:     '#1E1916',
        border:         '1px solid black'
    },

    // The items in the command line menu or something else,
    // that can get selected.
    selectable: {
        color:          'white',
        border:         '0px solid transparent',
        background:     'transparent',

        active: {
            color:          'black',
            border:         '0px solid transparent',
            background:     '#FF8E00'
        },

        hover: {
            color:          'black',
            border:         '0px solid transparent',
            background:     '#FF8E00'
        }
    },

    // A small hint text.
    hint: {
        color:          '#AAA',

        active: {
            color:      'black'
        },

        hover: {
            color:      'black'
        }
    },

    // E.g. in the command line menu, the 'ALT+2'.
    accelerator: {
        color:          '#996633',

        active: {
            color:      'black'
        },

        hover: {
            color:      'black'
        }
    },

    menu: {
        border_color:           'black',
        inset_color_right:      '#1E1916',
        inset_color_top_left:   '#3E3936',
        background:             'transparent'
    }
};

defaultGlobalTheme = parseGlobalThemeVariables(defaultGlobalTheme);

// END: THIS PART IS OVERRIDDEN BY dryice
//------------------------------------------------------------------------------

/**
 * Returns an object with all the themeVariables value for a given plugin.
 */
exports.getPluginThemeVariables = function(pluginName) {
    var plugin = catalog.plugins[pluginName];

    if (!plugin) {
        return null;
    }

    // Hash to look for custom theme variables.
    var themeVariables = {};
    if (exports.currentThemeVariables &&
            exports.currentThemeVariables[pluginName]) {
        themeVariables = exports.currentThemeVariables[pluginName];
    }

    // Set the value for all themeVariables in this plugin.
    plugin.provides.forEach(function(ext) {
        if (ext.ep === 'themevariable') {
            var value = ext.name;
            // The value is the customThemeVariable OR the defaultValue if the
            // customThemeVariable is not given.
            themeVariables[value] = themeVariables[value] || ext.defaultValue;
        }
    });

    return themeVariables;
};

/**
 * Update the globalThemeVariables. This is called whenever the theme changes.
 */
exports.parseGlobalVariables = function() {
    var globalObj = {};
    var globalHeader = '';
    var currentThemeVariables = exports.currentThemeVariables;

    util.mixin(globalObj, defaultGlobalTheme);

    if (currentThemeVariables  && currentThemeVariables['global']) {
        util.mixin(globalObj,
                    parseGlobalThemeVariables(currentThemeVariables['global']));
    }

    exports.globalThemeVariables = globalObj;

    for (prop in globalObj) {
        globalHeader += '@' + prop + ':' + globalObj[prop] + ';';
    }

    globalVariableHeader = globalHeader;
};

// Parse the globalThemeVariables.
exports.parseGlobalVariables();

/**
 * Parse one less files.
 */
var parseLess = function(pr, pluginName, variableHeader) {
    // Use already existing DOM style element or create a new one on the page.
    if (extensionStyleID[pluginName]) {
        styleElem = document.getElementById('_bespin_theme_style_' +
                                                extensionStyleID[pluginName]);
    } else {
        styleElem = document.createElement('style');
        styleElem.setAttribute('id', '_bespin_theme_style_' + styleID);
        extensionStyleID[pluginName] = styleID;
        styleID ++;
        document.body.appendChild(styleElem);
    }

    // DEBUG ONLY.
    // var timer = new Date();

    // Parse the data.
    var dataToParse = globalVariableHeader + // global ThemeVariables
                            variableHeader + // plugin specific ThemeVariables
                            extensionStyleData[pluginName]; // and the data
    lessParser.parse(dataToParse, function(e, tree) {
        var errMsg;
        if (e) {
            errMsg = 'Error less parsing ' +  pluginName + ' ' +  e.message;
            console.error(errMsg);
            pr.reject(errMsg);
            return;
        }

        try {
            var css = tree.toCSS();

            // DEBUG ONLY.
            // console.log('  parsing took: ', (new Date()) - timer, 'ms');
        } catch (e) {
            errMsg = 'Error less parsing ' + pluginName + ' ' + e;
            console.error(errMsg);
            pr.reject(errMsg);
            return;
        }

        // Add the parsed CSS content in the styleElement.
        if (styleElem && styleElem.firstChild) {
            styleElem.firstChild.textContent = css;
        } else {
            var cssContentNode = document.createTextNode(css);
            styleElem.appendChild(cssContentNode);
        }
        pr.resolve();
    });
};

// Queue with all the plugins waiting to get updated.
var parseQueue = {};

/**
 * Parse the less files for a entire plugin. The plugin is not parsed directly,
 * but with a small delay. Otherwise it could happen that the plugin is parsed
 * although not all themeVariables are available.
 * Returns a promise that is resolved after the plugin is successfully parsed.
 * An error during parsing rejects the promise.
 */
exports.parsePlugin = function(pluginName) {
    // Parse only if this is permitted.
    if (exports.preventParsing) {
        return (new Promise).resolve();
    }

    var plugin = catalog.plugins[pluginName];

    if (!plugin) {
        throw "reparsePlugin: plugin " + pluginName + " is not defined!";
    }

    // Start parsing only if it isn't started already.
    if (!parseQueue[pluginName]) {
        // Mark that the plugin is queued.
        parseQueue[pluginName] = new Promise();

        setTimeout(function() {
            // DEBUG ONLY:
            // console.log('=== Parse Plugin: ' + pluginName + ' ===');
            // var time = new Date();

            var themeVariables = exports.getPluginThemeVariables(pluginName);

            // Store the StyleVariables for the StyleData to parse.
            var variableHeader = '';

            for (prop in themeVariables) {
                variableHeader += '@' + prop + ':' + themeVariables[prop] + ';';
            }

            // DEBUG ONLY:
            // console.log('  variables: ', variableHeader, globalVariableHeader);

            var parsePr = new Promise;
            parsePr.then(function(data) {
                parseQueue[this.name].resolve(data);
                parseQueue[this.name] = null;
            }.bind(this), function() {
                parseQueue[this.name].reject(data);
                parseQueue[this.name] = null;
            }.bind(this))

            parseLess(parsePr, pluginName, variableHeader);

            // DEBUG ONLY:
            // console.log('everything took: ', (new Date()) - time, 'ms');
        }.bind(plugin), 0);
    }

    return parseQueue[pluginName];
};

// Function that pocesses the loaded StyleFile content.
var processStyleContent = function(resourceURL, pluginName, data, p) {
    // Convert url(something) to url(resourceURL/something).
    data = data.replace(/url\(['"]*([^'")]*)(['"]*)\)/g,
                                      'url(' + resourceURL + '$1)');
    extensionStyleData[pluginName] += data;

    // Resolve the promise when given.
    if (p) {
        p.resolve();
    }
};

var themeDataLoadPromise = null;

exports.registerThemeStyles = function(extension) {
    var pluginName = extension.getPluginName();
    var resourceURL = catalog.getResourceURL(pluginName);

    // Make the extension.url parameter an array if it isn't yet.
    if (!(extension.url instanceof Array)) {
        extension.url = [ extension.url ];
    }

    // (Re)set the loaded StyleData for the plugin.
    extensionStyleData[pluginName] = '';

    var loadPromises = [];

    var preventParsing = exports.preventParsing;

    // Load the StyleFiles.
    extension.url.forEach(function(styleFile) {
        if (extensionStyleBuildData[pluginName] &&
                extensionStyleBuildData[pluginName][styleFile]) {
            // Process the StyleContent.
            processStyleContent(resourceURL, pluginName,
                                extensionStyleBuildData[pluginName][styleFile]);
        } else {
            var p = new Promise();
            loadPromises.push(p);

            var url = resourceURL + styleFile + '?' + (new Date).getTime();
            proxy.xhr('GET', url, true, function(xhr) {
                xhr.overrideMimeType('text/plain');
            }).then(function(response) {
                  processStyleContent(resourceURL, pluginName, response, p);
            }, function(err) {
                console.error('registerLessFile: Could not load ' +
                        resourceURL + styleFile);

                // The file couldn't get loaded but to make the group
                // work we have to mark this loadPromise as resolved so that
                // at least the other sucessfully loaded files can get
                // proceeded.
                p.resolve();
            });
        }
    });

    if (loadPromises.length === 0) {
        exports.parsePlugin(pluginName);
    } else {
        // If parsing is allowed, then wait until all the styleFiles are loaded
        // and parse the plugin.
        if (!preventParsing) {
            group(loadPromises).then(function() {
                exports.parsePlugin(pluginName);
            });
        }

        if (themeDataLoadPromise !== null) {
            loadPromises = loadPromises.concat(themeDataLoadPromise);
        }
        themeDataLoadPromise = group(loadPromises);
    }
};

/**
 * Call this function to reparse all the ThemeStyles files.
 * Returns a promise. The promise is resolved after all themeStyles are reparsed.
 */
exports.reparse = function() {
    var pr = new Promise();

    // Reparse only if this is permitted.
    if (exports.preventParsing) {
        return pr.resolve();
    }

    // Reparsing makes only sense if there is a themeDataLoadPromise.
    // If the value is null, then no styleFile was loaded and there is nothing
    // to reparse.
    if (themeDataLoadPromise) {
        // When all the styleFiles are loaded.
        themeDataLoadPromise.then(function() {
            var parsePromises = [];

            // Reparese all the themeStyles. Instead of loading the themeStyles
            // again from the server, the cache extensionStyleData is used.
            // Every plugin in this cache is reparsed.

            // Check if a basePlugin is set and parse this one first.
            var basePluginName = exports.basePluginName;
            if (basePluginName !== null && extensionStyleData[basePluginName]) {
                parsePromises.push(exports.parsePlugin(basePluginName));
            }

            // Parse the other plugins.
            for (var pluginName in extensionStyleData) {
                // Skip the basePlugin as this is already parsed.
                if (pluginName === basePluginName) {
                    continue;
                }
                parsePromises.push(exports.parsePlugin(pluginName));
            }

            // After all themeStyles are parsed, resolve the returned promise.
            group(parsePromises).then(pr.resolve.bind(pr), pr.reject.bind(pr));
        }, function(err) {
            pr.reject(err);
        });
    } else {
        pr.resolve();
    }
    return pr;
};

/**
 * Unregister a themeStyle.
 * @param The extension to unregister.
 */
exports.unregisterThemeStyles = function(extension) {
    var pluginName = extension.getPluginName();
    if (!extensionStyleID[pluginName]) {
        return;
    }

    // Remove the style element from the page.
    var styleID = '_bespin_theme_style_' + extensionStyleID[pluginName];
    var styleElement = document.getElementById(styleID);
    styleElement.parentNode.removeChild(styleElement);

    // Remove the style reference.
    delete extensionStyleID[pluginName];
    // Remove the themeStyle cache.
    delete extensionStyleData[pluginName];
};

});
;bespin.tiki.register("::types", {
    name: "types",
    dependencies: {  }
});
bespin.tiki.module("types:basic",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;
var Promise = require('bespin:promise').Promise;

var r = require;

/**
 * These are the basic types that we accept. They are vaguely based on the
 * Jetpack settings system (https://wiki.mozilla.org/Labs/Jetpack/JEP/24)
 * although clearly more restricted.
 * <p>In addition to these types, Jetpack also accepts range, member, password
 * that we are thinking of adding in the short term.
 */

/**
 * 'text' is the default if no type is given.
 */
exports.text = {
    isValid: function(value, typeExt) {
        return typeof value == 'string';
    },

    toString: function(value, typeExt) {
        return value;
    },

    fromString: function(value, typeExt) {
        return value;
    }
};

/**
 * We don't currently plan to distinguish between integers and floats
 */
exports.number = {
    isValid: function(value, typeExt) {
        if (isNaN(value)) {
            return false;
        }
        if (value === null) {
            return false;
        }
        if (value === undefined) {
            return false;
        }
        if (value === Infinity) {
            return false;
        }
        return typeof value == 'number';// && !isNaN(value);
    },

    toString: function(value, typeExt) {
        if (!value) {
            return null;
        }
        return '' + value;
    },

    fromString: function(value, typeExt) {
        if (!value) {
            return null;
        }
        var reply = parseInt(value, 10);
        if (isNaN(reply)) {
            throw new Error('Can\'t convert "' + value + '" to a number.');
        }
        return reply;
    }
};

/**
 * true/false values
 */
exports.bool = {
    isValid: function(value, typeExt) {
        return typeof value == 'boolean';
    },

    toString: function(value, typeExt) {
        return '' + value;
    },

    fromString: function(value, typeExt) {
        if (value === null) {
            return null;
        }

        if (!value.toLowerCase) {
            return !!value;
        }

        var lower = value.toLowerCase();
        if (lower == 'true') {
            return true;
        } else if (lower == 'false') {
            return false;
        }

        return !!value;
    }
};

/**
 * A JSON object
 * TODO: Check to see how this works out.
 */
exports.object = {
    isValid: function(value, typeExt) {
        return typeof value == 'object';
    },

    toString: function(value, typeExt) {
        return JSON.stringify(value);
    },

    fromString: function(value, typeExt) {
        return JSON.parse(value);
    }
};

/**
 * One of a known set of options
 */
exports.selection = {
    isValid: function(value, typeExt) {
        if (typeof value != 'string') {
            return false;
        }

        if (!typeExt.data) {
            console.error('Missing data on selection type extension. Skipping');
            return true;
        }

        var match = false;
        typeExt.data.forEach(function(option) {
            if (value == option) {
                match = true;
            }
        });

        return match;
    },

    toString: function(value, typeExt) {
        return value;
    },

    fromString: function(value, typeExt) {
        // TODO: should we validate and return null if invalid?
        return value;
    },

    resolveTypeSpec: function(extension, typeSpec) {
        var promise = new Promise();

        if (typeSpec.data) {
            // If we've got the data already - just use it
            extension.data = typeSpec.data;
            promise.resolve();
        } else if (typeSpec.pointer) {
            catalog.loadObjectForPropertyPath(typeSpec.pointer).then(function(obj) {
                var reply = obj(typeSpec);
                if (typeof reply.then === 'function') {
                    reply.then(function(data) {
                        extension.data = data;
                        promise.resolve();
                    });
                } else {
                    extension.data = reply;
                    promise.resolve();
                }
            }, function(ex) {
                promise.reject(ex);
            });
        } else {
            // No extra data available
            console.warn('Missing data/pointer for selection', typeSpec);
            promise.resolve();
        }

        return promise;
    }
};

});

bespin.tiki.module("types:types",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;
var Promise = require('bespin:promise').Promise;

/**
 * Get the simple text-only, no-param version of a typeSpec.
 */
exports.getSimpleName = function(typeSpec) {
    if (!typeSpec) {
        throw new Error('null|undefined is not a valid typeSpec');
    }

    if (typeof typeSpec == 'string') {
        return typeSpec;
    }

    if (typeof typeSpec == 'object') {
        if (!typeSpec.name) {
            throw new Error('Missing name member to typeSpec');
        }

        return typeSpec.name;
    }

    throw new Error('Not a typeSpec: ' + typeSpec);
};

/**
 * 2 typeSpecs are considered equal if their simple names are the same.
 */
exports.equals = function(typeSpec1, typeSpec2) {
    return exports.getSimpleName(typeSpec1) == exports.getSimpleName(typeSpec2);
};

/**
 * A deferred type is one where we hope to find out what the type is just
 * in time to use it. For example the 'set' command where the type of the 2nd
 * param is defined by the 1st param.
 * @param typeSpec An object type spec with name = 'deferred' and a pointer
 * which to call through catalog.loadObjectForPropertyPath (passing in the
 * original typeSpec as a parameter). This function is expected to return either
 * a new typeSpec, or a promise of a typeSpec.
 * @returns A promise which resolves to the new type spec from the pointer.
 */
exports.undeferTypeSpec = function(typeSpec) {
    // Deferred types are specified by the return from the pointer
    // function.
    var promise = new Promise();
    if (!typeSpec.pointer) {
        promise.reject(new Error('Missing deferred pointer'));
        return promise;
    }

    catalog.loadObjectForPropertyPath(typeSpec.pointer).then(function(obj) {
        var reply = obj(typeSpec);
        if (typeof reply.then === 'function') {
            reply.then(function(newTypeSpec) {
                promise.resolve(newTypeSpec);
            }, function(ex) {
                promise.reject(ex);
            });
        } else {
            promise.resolve(reply);
        }
    }, function(ex) {
        promise.reject(ex);
    });

    return promise;
};

// Warning: These next 2 functions are virtually cut and paste from
// command_line:typehint.js
// If you change this, there are probably parallel changes to be made there
// There are 2 differences between the functions:
// - We lookup type|typehint in the catalog
// - There is a concept of a default typehint, where there is no similar
//   thing for types. This is sensible, because hints are optional nice
//   to have things. Not so for types.
// Whilst we could abstract out the changes, I'm not sure this simplifies
// already complex code

/**
 * Given a string, look up the type extension in the catalog
 * @param name The type name. Object type specs are not allowed
 * @returns A promise that resolves to a type extension
 */
function resolveObjectType(typeSpec) {
    var promise = new Promise();
    var ext = catalog.getExtensionByKey('type', typeSpec.name);
    if (ext) {
        promise.resolve({ ext: ext, typeSpec: typeSpec });
    } else {
        promise.reject(new Error('Unknown type: ' + typeSpec.name));
    }
    return promise;
};

/**
 * Look-up a typeSpec and find a corresponding type extension. This function
 * does not attempt to load the type or go through the resolution process,
 * for that you probably want #resolveType()
 * @param typeSpec A string containing the type name or an object with a name
 * and other type parameters e.g. { name: 'selection', data: [ 'one', 'two' ] }
 * @return a promise that resolves to an object containing the resolved type
 * extension and the typeSpec used to resolve the type (which could be different
 * from the passed typeSpec if this was deferred). The object will be in the
 * form { ext:... typeSpec:... }
 */
function resolveTypeExt(typeSpec) {
    if (typeof typeSpec === 'string') {
        return resolveObjectType({ name: typeSpec });
    }

    if (typeof typeSpec === 'object') {
        if (typeSpec.name === 'deferred') {
            var promise = new Promise();
            exports.undeferTypeSpec(typeSpec).then(function(newTypeSpec) {
                resolveTypeExt(newTypeSpec).then(function(reply) {
                    promise.resolve(reply);
                }, function(ex) {
                    promise.reject(ex);
                });
            });
            return promise;
        } else {
            return resolveObjectType(typeSpec);
        }
    }

    throw new Error('Unknown typeSpec type: ' + typeof typeSpec);
};

/**
 * Do all the nastiness of: converting the typeSpec to an extension, then
 * asynchronously loading the extension to a type and then calling
 * resolveTypeSpec if the loaded type defines it.
 * @param typeSpec a string or object defining the type to resolve
 * @returns a promise which resolves to an object containing the type and type
 * extension as follows: { type:... ext:... }
 * @see #resolveTypeExt
 */
exports.resolveType = function(typeSpec) {
    var promise = new Promise();

    resolveTypeExt(typeSpec).then(function(data) {
        data.ext.load(function(type) {
            // We might need to resolve the typeSpec in a custom way
            if (typeof type.resolveTypeSpec === 'function') {
                type.resolveTypeSpec(data.ext, data.typeSpec).then(function() {
                    promise.resolve({ type: type, ext: data.ext });
                }, function(ex) {
                    promise.reject(ex);
                });
            } else {
                // Nothing to resolve - just go
                promise.resolve({ type: type, ext: data.ext });
            }
        });
    }, function(ex) {
        promise.reject(ex);
    });

    return promise;
};

/**
 * Convert some data from a string to another type as specified by
 * <tt>typeSpec</tt>.
 */
exports.fromString = function(stringVersion, typeSpec) {
    var promise = new Promise();
    exports.resolveType(typeSpec).then(function(typeData) {
        promise.resolve(typeData.type.fromString(stringVersion, typeData.ext));
    });
    return promise;
};

/**
 * Convert some data from an original type to a string as specified by
 * <tt>typeSpec</tt>.
 */
exports.toString = function(objectVersion, typeSpec) {
    var promise = new Promise();
    exports.resolveType(typeSpec).then(function(typeData) {
        promise.resolve(typeData.type.toString(objectVersion, typeData.ext));
    });
    return promise;
};

/**
 * Convert some data from an original type to a string as specified by
 * <tt>typeSpec</tt>.
 */
exports.isValid = function(originalVersion, typeSpec) {
    var promise = new Promise();
    exports.resolveType(typeSpec).then(function(typeData) {
        promise.resolve(typeData.type.isValid(originalVersion, typeData.ext));
    });
    return promise;
};

});

bespin.tiki.module("types:index",function(require,exports,module) {

});
;bespin.tiki.register("::jquery", {
    name: "jquery",
    dependencies: {  }
});
bespin.tiki.module("jquery:index",function(require,exports,module) {
// This module exports the global jQuery.

"define metadata";
({});
"end";

exports.$ = window.$;

});
;bespin.tiki.register("::embedded", {
    name: "embedded",
    dependencies: { "theme_manager": "0.0.0", "text_editor": "0.0.0", "appconfig": "0.0.0", "edit_session": "0.0.0", "screen_theme": "0.0.0" }
});
bespin.tiki.module("embedded:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"define metadata";
({
    "dependencies": {
        "appconfig": "0.0.0",
        "edit_session": "0.0.0",
        "theme_manager": "0.0.0",
        "screen_theme": "0.0.0",
        "text_editor": "0.0.0"
    }
});
"end";

// This plugin is artificial as a convenience. It's just here to collect up
// the common dependencies for embedded use

});
;bespin.tiki.register("::settings", {
    name: "settings",
    dependencies: { "types": "0.0.0" }
});
bespin.tiki.module("settings:commands",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var env = require('environment').env;

var settings = require('settings').settings;

/**
 * 'set' command
 */
exports.setCommand = function(args, request) {
    var html;

    if (!args.setting) {
        var settingsList = settings._list();
        html = '';
        // first sort the settingsList based on the key
        settingsList.sort(function(a, b) {
            if (a.key < b.key) {
                return -1;
            } else if (a.key == b.key) {
                return 0;
            } else {
                return 1;
            }
        });

        settingsList.forEach(function(setting) {
            html += '<a class="setting" href="https://wiki.mozilla.org/Labs/Bespin/Settings#' +
                    setting.key +
                    '" title="View external documentation on setting: ' +
                    setting.key +
                    '" target="_blank">' +
                    setting.key +
                    '</a> = ' +
                    setting.value +
                    '<br/>';
        });
    } else {
        if (args.value === undefined) {
            html = '<strong>' + args.setting + '</strong> = ' + settings.get(args.setting);
        } else {
            html = 'Setting: <strong>' + args.setting + '</strong> = ' + args.value;
            settings.set(args.setting, args.value);
        }
    }

    request.done(html);
};

/**
 * 'unset' command
 */
exports.unsetCommand = function(args, request) {
    settings.resetValue(args.setting);
    request.done('Reset ' + args.setting + ' to default: ' + settings.get(args.setting));
};

});

bespin.tiki.module("settings:cookie",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var cookie = require('bespin:util/cookie');

/**
 * Save the settings in a cookie
 * This code has not been tested since reboot
 * @constructor
 */
exports.CookiePersister = function() {
};

exports.CookiePersister.prototype = {
    loadInitialValues: function(settings) {
        settings._loadDefaultValues().then(function() {
            var data = cookie.get('settings');
            settings._loadFromObject(JSON.parse(data));
        }.bind(this));
    },

    persistValue: function(settings, key, value) {
        try {
            // Aggregate the settings into a file
            var data = {};
            settings._getSettingNames().forEach(function(key) {
                data[key] = settings.get(key);
            });

            var stringData = JSON.stringify(data);
            cookie.set('settings', stringData);
        } catch (ex) {
            console.error('Unable to JSONify the settings! ' + ex);
            return;
        }
    }
};

});

bespin.tiki.module("settings:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * This plug-in manages settings.
 *
 * <p>Some quick terminology: A _Choice_, is something that the application
 * offers as a way to customize how it works. For each _Choice_ there will be
 * a number of _Options_ but ultimately the user will have a _Setting_ for each
 * _Choice_. This _Setting_ maybe the default for that _Choice_.
 *
 * <p>It provides an API for controlling the known settings. This allows us to
 * provide better GUI/CLI support. See setting.js
 * <p>It provides 3 implementations of a setting store:<ul>
 * <li>MemorySettings: i.e. temporary, non-persistent. Useful in textarea
 * replacement type scenarios. See memory.js
 * <li>CookieSettings: Stores the data in a cookie. Generally not practical as
 * it slows client server communication (if any). See cookie.js
 * <li>ServerSettings: Stores data on a server using the <tt>server</tt> API.
 * See server.js
 * </ul>
 * <p>It is expected that an HTML5 storage option will be developed soon. This
 * plug-in did contain a prototype Gears implementation, however this was never
 * maintained, and has been deleted due to bit-rot.
 * <p>This plug-in also provides commands to manipulate the settings from the
 * command_line and canon plug-ins.
 *
 * <p>TODO:<ul>
 * <li>Check what happens when we alter settings from the UI
 * <li>Ensure that values can be bound in a SC sense
 * <li>Convert all subscriptions to bindings.
 * <li>Implement HTML5 storage option
 * <li>Make all settings have a 'description' member and use that in set|unset
 * commands.
 * <li>When the command system is re-worked to include more GUI interaction,
 * expose data in settings to that system.
 * </ul>
 *
 * <p>For future versions of the API it might be better to decrease the
 * dependency on settings, and increase it on the system with a setting.
 * e.g. Now:
 * <pre>
 * setting.addSetting({ name:'foo', ... });
 * settings.set('foo', 'bar');
 * </pre>
 * <p>Vs the potentially better:
 * <pre>
 * var foo = setting.addSetting({ name:'foo', ... });
 * foo.value = 'bar';
 * </pre>
 * <p>Comparison:
 * <ul>
 * <li>The latter version gains by forcing access to the setting to be through
 * the plug-in providing it, so there wouldn't be any hidden dependencies.
 * <li>It's also more compact.
 * <li>It could provide access to to other methods e.g. <tt>foo.reset()</tt>
 * and <tt>foo.onChange(function(val) {...});</tt> (but see SC binding)
 * <li>On the other hand dependencies are so spread out right now that it's
 * probably hard to do this easily. We should move to this in the future.
 * </ul>
 */

var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;
var Promise = require('bespin:promise').Promise;
var groupPromises = require('bespin:promise').group;

var types = require('types:types');

/**
 * Find and configure the settings object.
 * @see MemorySettings.addSetting()
 */
exports.addSetting = function(settingExt) {
    require('settings').settings.addSetting(settingExt);
};

/**
 * Fetch an array of the currently known settings
 */
exports.getSettings = function() {
    return catalog.getExtensions('setting');
};

/**
 * Something of a hack to allow the set command to give a clearer definition
 * of the type to the command line.
 */
exports.getTypeSpecFromAssignment = function(typeSpec) {
    var assignments = typeSpec.assignments;
    var replacement = 'text';

    if (assignments) {
        // Find the assignment for 'setting' so we can get it's value
        var settingAssignment = null;
        assignments.forEach(function(assignment) {
            if (assignment.param.name === 'setting') {
                settingAssignment = assignment;
            }
        });

        if (settingAssignment) {
            var settingName = settingAssignment.value;
            if (settingName && settingName !== '') {
                var settingExt = catalog.getExtensionByKey('setting', settingName);
                if (settingExt) {
                    replacement = settingExt.type;
                }
            }
        }
    }

    return replacement;
};

/**
 * A base class for all the various methods of storing settings.
 * <p>Usage:
 * <pre>
 * // Create manually, or require 'settings' from the container.
 * // This is the manual version:
 * var settings = require('bespin:plugins').catalog.getObject('settings');
 * // Add a new setting
 * settings.addSetting({ name:'foo', ... });
 * // Display the default value
 * alert(settings.get('foo'));
 * // Alter the value, which also publishes the change etc.
 * settings.set('foo', 'bar');
 * // Reset the value to the default
 * settings.resetValue('foo');
 * </pre>
 * @class
 */
exports.MemorySettings = function() {
};

exports.MemorySettings.prototype = {
    /**
     * Storage for the setting values
     */
    _values: {},

    /**
     * Storage for deactivated values
     */
    _deactivated: {},

    /**
     * A Persister is able to store settings. It is an object that defines
     * two functions:
     * loadInitialValues(settings) and persistValue(settings, key, value).
     */
    setPersister: function(persister) {
        this._persister = persister;
        if (persister) {
            persister.loadInitialValues(this);
        }
    },

    /**
     * Read accessor
     */
    get: function(key) {
        return this._values[key];
    },

    /**
     * Override observable.set(key, value) to provide type conversion and
     * validation.
     */
    set: function(key, value) {
        var settingExt = catalog.getExtensionByKey('setting', key);
        if (!settingExt) {
            // If there is no definition for this setting, then warn the user
            // and store the setting in raw format. If the setting gets defined,
            // the addSetting() function is called which then takes up the
            // here stored setting and calls set() to convert the setting.
            console.warn('Setting not defined: ', key, value);
            this._deactivated[key] = value;
        }
        else if (typeof value == 'string' && settingExt.type == 'string') {
            // no conversion needed
            this._values[key] = value;
        }
        else {
            var inline = false;

            types.fromString(value, settingExt.type).then(function(converted) {
                inline = true;
                this._values[key] = converted;

                // Inform subscriptions of the change
                catalog.publish(this, 'settingChange', key, converted);
            }.bind(this), function(ex) {
                console.error('Error setting', key, ': ', ex);
            });

            if (!inline) {
                console.warn('About to set string version of ', key, 'delaying typed set.');
                this._values[key] = value;
            }
        }

        this._persistValue(key, value);
        return this;
    },

    /**
     * Function to add to the list of available settings.
     * <p>Example usage:
     * <pre>
     * var settings = require('bespin:plugins').catalog.getObject('settings');
     * settings.addSetting({
     *     name: 'tabsize', // For use in settings.get('X')
     *     type: 'number',  // To allow value checking.
     *     defaultValue: 4  // Default value for use when none is directly set
     * });
     * </pre>
     * @param {object} settingExt Object containing name/type/defaultValue members.
     */
    addSetting: function(settingExt) {
        if (!settingExt.name) {
            console.error('Setting.name == undefined. Ignoring.', settingExt);
            return;
        }

        if (!settingExt.defaultValue === undefined) {
            console.error('Setting.defaultValue == undefined', settingExt);
        }

        types.isValid(settingExt.defaultValue, settingExt.type).then(function(valid) {
            if (!valid) {
                console.warn('!Setting.isValid(Setting.defaultValue)', settingExt);
            }

            // The value can be
            // 1) the value of a setting that is not activated at the moment
            //       OR
            // 2) the defaultValue of the setting.
            var value = this._deactivated[settingExt.name] ||
                    settingExt.defaultValue;

            // Set the default value up.
            this.set(settingExt.name, value);
        }.bind(this), function(ex) {
            console.error('Type error ', ex, ' ignoring setting ', settingExt);
        });
    },

    /**
     * Reset the value of the <code>key</code> setting to it's default
     */
    resetValue: function(key) {
        var settingExt = catalog.getExtensionByKey('setting', key);
        if (settingExt) {
            this.set(key, settingExt.defaultValue);
        } else {
            console.log('ignore resetValue on ', key);
        }
    },

    resetAll: function() {
        this._getSettingNames().forEach(function(key) {
            this.resetValue(key);
        }.bind(this));
    },

    /**
     * Make a list of the valid type names
     */
    _getSettingNames: function() {
        var typeNames = [];
        catalog.getExtensions('setting').forEach(function(settingExt) {
            typeNames.push(settingExt.name);
        });
        return typeNames;
    },

    /**
     * Retrieve a list of the known settings and their values
     */
    _list: function() {
        var reply = [];
        this._getSettingNames().forEach(function(setting) {
            reply.push({
                'key': setting,
                'value': this.get(setting)
            });
        }.bind(this));
        return reply;
    },

    /**
     * delegates to the persister. no-op if there's no persister.
     */
    _persistValue: function(key, value) {
        var persister = this._persister;
        if (persister) {
            persister.persistValue(this, key, value);
        }
    },

    /**
     * Delegates to the persister, otherwise sets up the defaults if no
     * persister is available.
     */
    _loadInitialValues: function() {
        var persister = this._persister;
        if (persister) {
            persister.loadInitialValues(this);
        } else {
            this._loadDefaultValues();
        }
    },

    /**
     * Prime the local cache with the defaults.
     */
    _loadDefaultValues: function() {
        return this._loadFromObject(this._defaultValues());
    },

    /**
     * Utility to load settings from an object
     */
    _loadFromObject: function(data) {
        var promises = [];
        // take the promise action out of the loop to avoid closure problems
        var setterFactory = function(keyName) {
            return function(value) {
                this.set(keyName, value);
            };
        };

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var valueStr = data[key];
                var settingExt = catalog.getExtensionByKey('setting', key);
                if (settingExt) {
                    // TODO: We shouldn't just ignore values without a setting
                    var promise = types.fromString(valueStr, settingExt.type);
                    var setter = setterFactory(key);
                    promise.then(setter);
                    promises.push(promise);
                }
            }
        }

        // Promise.group (a.k.a groupPromises) gives you a list of all the data
        // in the grouped promises. We don't want that in case we change how
        // this works with ignored settings (see above).
        // So we do this to hide the list of promise resolutions.
        var replyPromise = new Promise();
        groupPromises(promises).then(function() {
            replyPromise.resolve();
        });
        return replyPromise;
    },

    /**
     * Utility to grab all the settings and export them into an object
     */
    _saveToObject: function() {
        var promises = [];
        var reply = {};

        this._getSettingNames().forEach(function(key) {
            var value = this.get(key);
            var settingExt = catalog.getExtensionByKey('setting', key);
            if (settingExt) {
                // TODO: We shouldn't just ignore values without a setting
                var promise = types.toString(value, settingExt.type);
                promise.then(function(value) {
                    reply[key] = value;
                });
                promises.push(promise);
            }
        }.bind(this));

        var replyPromise = new Promise();
        groupPromises(promises).then(function() {
            replyPromise.resolve(reply);
        });
        return replyPromise;
    },

    /**
     * The default initial settings
     */
    _defaultValues: function() {
        var defaultValues = {};
        catalog.getExtensions('setting').forEach(function(settingExt) {
            defaultValues[settingExt.name] = settingExt.defaultValue;
        });
        return defaultValues;
    }
};

exports.settings = new exports.MemorySettings();

});
;bespin.tiki.register("::appconfig", {
    name: "appconfig",
    dependencies: { "jquery": "0.0.0", "canon": "0.0.0", "settings": "0.0.0" }
});
bespin.tiki.module("appconfig:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var $ = require('jquery').$;
var settings = require('settings').settings;
var group = require("bespin:promise").group;
var Promise = require("bespin:promise").Promise;
var console = require("bespin:console").console;
var Trace = require("bespin:util/stacktrace").Trace;
var util = require('bespin:util/util');

var firstBespin = true;

/*
 * launch Bespin with the configuration provided. The configuration is
 * an object with the following properties:
 * - theme: an object with the basePlugin as string and the standardTheme as
 *          string. Both are optional. If no basePlugin is given, screen_theme
 *          is used if this exists.
 * - objects: an object with a collection of named objects that will be
 *            registered with the plugin catalog (see PluginCatalog.registerObject)
 *            This will automatically be augmented with sane defaults (for
 *            example, most Bespin users want a text editor!)
 * - gui: instructions on how to build a GUI. Specifically, the current border
 *        layout positions will be filled in. Again this provides sane defaults.
 * - container: node to attach to (optional). If not provided a node will be
 *              created. and added to the body.
 * - settings: settings to preconfigure
 */
exports.launch = function(config) {
    var launchPromise = new Promise();

    // Remove the "Loading..." hint.
    $('#_bespin_loading').remove();

    // This will hold the require function to get the catalog.
    var require;

    // Is this the fist Bespin?
    if (firstBespin) {
        // Use the global require.
        require = bespin.tiki.require;
        firstBespin = false;
    } else {
        // Otherwise create a new tiki-bespin sandbox and a new require function.
        var sandbox = new (bespin.tiki.require('bespin:sandbox').Sandbox);
        require = sandbox.createRequire({
            id: 'index',
            ownerPackage: bespin.tiki.loader.anonymousPackage
        });
    }

    // Here we go: Require the catalog that is used for this Bespin instance.
    var catalog = require('bespin:plugins').catalog;

    // Launch Bespin!
    config = config || {};
    exports.normalizeConfig(catalog, config);
    var objects = config.objects;
    for (var key in objects) {
        catalog.registerObject(key, objects[key]);
    }

    for (var setting in config.settings) {
        settings.set(setting, config.settings[setting]);
    }

    // Resolve the launchPromise and pass the env variable along.
    var resolveLaunchPromise = function() {
        var env = require("environment").env;

        var editor = env.editor;
        if (editor) {
            if (config.lineNumber) {
                editor.setLineNumber(config.lineNumber);
            }
            if (config.stealFocus) {
                editor.focus = true;
            }
            if (config.readOnly) {
                editor.readOnly = config.readOnly;
            }
            if (config.syntax) {
                editor.syntax = config.syntax;
            }
        }
        var commandLine = catalog.getObject('commandLine');
        if (commandLine) {
            env.commandLine = commandLine;
        }

        catalog.publish(this, 'appLaunched');

        launchPromise.resolve(env);
    }.bind(this);

    var themeLoadingPromise = new Promise();

    themeLoadingPromise.then(function() {
        if (objects.loginController) {
            catalog.createObject("loginController").then(
                function(loginController) {
                    var pr = loginController.showLogin();
                    pr.then(function(username) {
                        // Add the username as constructor argument.
                        config.objects.session.arguments.push(username);

                        exports.launchEditor(catalog, config).then(resolveLaunchPromise,
                                        launchPromise.reject.bind(launchPromise));
                    });
                });
        } else {
            exports.launchEditor(catalog, config).then(resolveLaunchPromise,
                                        launchPromise.reject.bind(launchPromise));
        }
    }, function(error) {
        launchPromise.reject(error);
    });

    // If the themeManager plugin is there, then check for theme configuration.
    if (catalog.plugins.theme_manager) {
        bespin.tiki.require.ensurePackage('::theme_manager', function() {
            var themeManager = require('theme_manager');
            if (config.theme.basePlugin) {
                themeManager.setBasePlugin(config.theme.basePlugin);
            }
            if (config.theme.standard) {
                themeManager.setStandardTheme(config.theme.standard);
            }
            themeManager.startParsing().then(function() {
                themeLoadingPromise.resolve();
            }, function(error) {
                themeLoadingPromise.reject(error);
            });
        });
    } else {
        themeLoadingPromise.resolve();
    }

    return launchPromise;
};

exports.normalizeConfig = function(catalog, config) {
    if (config.objects === undefined) {
        config.objects = {};
    }
    if (config.autoload === undefined) {
        config.autoload = [];
    }
    if (config.theme === undefined) {
        config.theme = {};
    }
    if (!config.theme.basePlugin && catalog.plugins.screen_theme) {
        config.theme.basePlugin = 'screen_theme';
    }
    if (!config.initialContent) {
        config.initialContent = '';
    }
    if (!config.settings) {
        config.settings = {};
    }

    if (!config.objects.notifier && catalog.plugins.notifier) {
        config.objects.notifier = {
        };
    }

    if (!config.objects.loginController && catalog.plugins.userident) {
        config.objects.loginController = {
        };
    }
    if (!config.objects.fileHistory && catalog.plugins.file_history) {
        config.objects.fileHistory = {
            factory: 'file_history',
            arguments: [
                "session"
            ],
            objects: {
                "0": "session"
            }
        };
    }
    if (!config.objects.server && catalog.plugins.bespin_server) {
        config.objects.server = {
            factory: "bespin_server"
        };
        config.objects.filesource = {
            factory: "bespin_filesource",
            arguments: [
                "server"
            ],
            objects: {
                "0": "server"
            }
        };
    }
    if (!config.objects.files && catalog.plugins.filesystem &&
        config.objects.filesource) {
        config.objects.files = {
            arguments: [
                "filesource"
            ],
            "objects": {
                "0": "filesource"
            }
        };
    }
    if (!config.objects.editor) {
        config.objects.editor = {
            factory: "text_editor",
            arguments: [
                config.initialContent
            ]
        };
    }
    if (!config.objects.session) {
        config.objects.session = {
            arguments: [
                "editor"
            ],
            "objects": {
                "0": "editor"
            }
        };
    }
    if (!config.objects.commandLine && catalog.plugins.command_line) {
        config.objects.commandLine = {
        };
    }

    if (config.gui === undefined) {
        config.gui = {};
    }

    var alreadyRegistered = {};
    for (var key in config.gui) {
        var desc = config.gui[key];
        if (desc.component) {
            alreadyRegistered[desc.component] = true;
        }
    }

    if (!config.gui.center && config.objects.editor
        && !alreadyRegistered.editor) {
        config.gui.center = { component: "editor" };
    }
    if (!config.gui.south && config.objects.commandLine
        && !alreadyRegistered.commandLine) {
        config.gui.south = { component: "commandLine" };
    }
};

exports.launchEditor = function(catalog, config) {
    var retPr = new Promise();

    if (config === null) {
        var message = 'Cannot start editor without a configuration!';
        console.error(message);
        retPr.reject(message);
        return retPr;
    }

    var pr = createAllObjects(catalog, config);
    pr.then(function() {
        generateGUI(catalog, config, retPr);
    }, function(error) {
        console.error('Error while creating objects');
        new Trace(error).log();
        retPr.reject(error);
    });

    return retPr;
};

var createAllObjects = function(catalog, config) {
    var promises = [];
    for (var objectName in config.objects) {
        promises.push(catalog.createObject(objectName));
    }
    return group(promises);
};

var generateGUI = function(catalog, config, pr) {
    var error;

    var container = document.createElement('div');
    container.setAttribute('class', 'container');

    var centerContainer = document.createElement('div');
    centerContainer.setAttribute('class', 'center-container');
    container.appendChild(centerContainer);

    var element = config.element || document.body;
    // Add the 'bespin' class to the element in case it doesn't have this already.
    util.addClass(element, 'bespin');
    element.appendChild(container);

    for (var place in config.gui) {
        var descriptor = config.gui[place];

        var component = catalog.getObject(descriptor.component);
        if (!component) {
            error = 'Cannot find object ' + descriptor.component +
                            ' to attach to the Bespin UI';
            console.error(error);
            pr.reject(error);
            return;
        }

        element = component.element;
        if (!element) {
            error = 'Component ' + descriptor.component + ' does not have' +
                          ' an "element" attribute to attach to the Bespin UI';
            console.error(error);
            pr.reject(error);
            return;
        }

        $(element).addClass(place);

        if (place == 'west' || place == 'east' || place == 'center') {
            centerContainer.appendChild(element);
        } else {
            container.appendChild(element);
        }

        // Call the elementAppended event if there is one.
        if (component.elementAppended) {
            component.elementAppended();
        }
    }

    pr.resolve();
};

});
;bespin.tiki.register("::events", {
    name: "events",
    dependencies: { "traits": "0.0.0" }
});
bespin.tiki.module("events:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

exports.Event = function() {
    var handlers = [];
    var evt = function() {
        var args = arguments;
        handlers.forEach(function(handler) { handler.func.apply(null, args); });
    };

    /**
     * Adds a new handler via
     *  a) evt.add(handlerFunc)
     *  b) evt.add(reference, handlerFunc)
     */
    evt.add = function() {
        if (arguments.length == 1) {
            handlers.push({
                ref: arguments[0],
                func: arguments[0]
            });
        } else {
            handlers.push({
                ref: arguments[0],
                func: arguments[1]
            });
        }
    };

    evt.remove = function(ref) {
        var notEqual = function(other) { return ref !== other.ref; };
        handlers = handlers.filter(notEqual);
    };

    evt.removeAll = function() {
        handlers = [];
    };

    return evt;
};


});
;bespin.tiki.register("::screen_theme", {
    name: "screen_theme",
    dependencies: { "theme_manager": "0.0.0" }
});
bespin.tiki.module("screen_theme:index",function(require,exports,module) {

});

(function() {
var $ = bespin.tiki.require("jquery").$;
$(document).ready(function() {
    bespin.tiki.require("bespin:plugins").catalog.registerMetadata({"text_editor": {"resourceURL": "resources/text_editor/", "description": "Canvas-based text editor component and many common editing commands", "dependencies": {"completion": "0.0.0", "undomanager": "0.0.0", "settings": "0.0.0", "canon": "0.0.0", "rangeutils": "0.0.0", "traits": "0.0.0", "theme_manager": "0.0.0", "keyboard": "0.0.0", "edit_session": "0.0.0", "syntax_manager": "0.0.0"}, "testmodules": ["tests/controllers/testLayoutmanager", "tests/models/testTextstorage", "tests/testScratchcanvas", "tests/utils/testRect"], "provides": [{"action": "new", "pointer": "views/editor#EditorView", "ep": "factory", "name": "text_editor"}, {"pointer": "views/editor#EditorView", "ep": "appcomponent", "name": "editor_view"}, {"predicates": {"isTextView": true}, "pointer": "commands/editing#backspace", "ep": "command", "key": "backspace", "name": "backspace"}, {"predicates": {"isTextView": true}, "pointer": "commands/editing#deleteCommand", "ep": "command", "key": "delete", "name": "delete"}, {"description": "Delete all lines currently selected", "key": "ctrl_d", "predicates": {"isTextView": true}, "pointer": "commands/editing#deleteLines", "ep": "command", "name": "deletelines"}, {"description": "Create a new, empty line below the current one", "key": "ctrl_return", "predicates": {"isTextView": true}, "pointer": "commands/editing#openLine", "ep": "command", "name": "openline"}, {"description": "Join the current line with the following", "key": "ctrl_shift_j", "predicates": {"isTextView": true}, "pointer": "commands/editing#joinLines", "ep": "command", "name": "joinline"}, {"params": [{"defaultValue": "", "type": "text", "name": "text", "description": "The text to insert"}], "pointer": "commands/editing#insertText", "ep": "command", "name": "insertText"}, {"predicates": {"completing": false, "isTextView": true}, "pointer": "commands/editing#newline", "ep": "command", "key": "return", "name": "newline"}, {"predicates": {"completing": false, "isTextView": true}, "pointer": "commands/editing#tab", "ep": "command", "key": "tab", "name": "tab"}, {"predicates": {"isTextView": true}, "pointer": "commands/editing#untab", "ep": "command", "key": "shift_tab", "name": "untab"}, {"predicates": {"isTextView": true}, "ep": "command", "name": "move"}, {"description": "Repeat the last search (forward)", "pointer": "commands/editor#findNextCommand", "ep": "command", "key": "ctrl_g", "name": "findnext"}, {"description": "Repeat the last search (backward)", "pointer": "commands/editor#findPrevCommand", "ep": "command", "key": "ctrl_shift_g", "name": "findprev"}, {"predicates": {"completing": false, "isTextView": true}, "pointer": "commands/movement#moveDown", "ep": "command", "key": "down", "name": "move down"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#moveLeft", "ep": "command", "key": "left", "name": "move left"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#moveRight", "ep": "command", "key": "right", "name": "move right"}, {"predicates": {"completing": false, "isTextView": true}, "pointer": "commands/movement#moveUp", "ep": "command", "key": "up", "name": "move up"}, {"predicates": {"isTextView": true}, "ep": "command", "name": "select"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectDown", "ep": "command", "key": "shift_down", "name": "select down"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectLeft", "ep": "command", "key": "shift_left", "name": "select left"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectRight", "ep": "command", "key": "shift_right", "name": "select right"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectUp", "ep": "command", "key": "shift_up", "name": "select up"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#moveLineEnd", "ep": "command", "key": ["end", "ctrl_right"], "name": "move lineend"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectLineEnd", "ep": "command", "key": ["shift_end", "ctrl_shift_right"], "name": "select lineend"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#moveDocEnd", "ep": "command", "key": "ctrl_down", "name": "move docend"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectDocEnd", "ep": "command", "key": "ctrl_shift_down", "name": "select docend"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#moveLineStart", "ep": "command", "key": ["home", "ctrl_left"], "name": "move linestart"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectLineStart", "ep": "command", "key": ["shift_home", "ctrl_shift_left"], "name": "select linestart"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#moveDocStart", "ep": "command", "key": "ctrl_up", "name": "move docstart"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectDocStart", "ep": "command", "key": "ctrl_shift_up", "name": "select docstart"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#moveNextWord", "ep": "command", "key": ["alt_right"], "name": "move nextword"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectNextWord", "ep": "command", "key": ["alt_shift_right"], "name": "select nextword"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#movePreviousWord", "ep": "command", "key": ["alt_left"], "name": "move prevword"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectPreviousWord", "ep": "command", "key": ["alt_shift_left"], "name": "select prevword"}, {"predicates": {"isTextView": true}, "pointer": "commands/movement#selectAll", "ep": "command", "key": ["ctrl_a", "meta_a"], "name": "select all"}, {"predicates": {"isTextView": true}, "ep": "command", "name": "scroll"}, {"predicates": {"isTextView": true}, "pointer": "commands/scrolling#scrollDocStart", "ep": "command", "key": "ctrl_home", "name": "scroll start"}, {"predicates": {"isTextView": true}, "pointer": "commands/scrolling#scrollDocEnd", "ep": "command", "key": "ctrl_end", "name": "scroll end"}, {"predicates": {"isTextView": true}, "pointer": "commands/scrolling#scrollPageDown", "ep": "command", "key": "pagedown", "name": "scroll down"}, {"predicates": {"isTextView": true}, "pointer": "commands/scrolling#scrollPageUp", "ep": "command", "key": "pageup", "name": "scroll up"}, {"pointer": "commands/editor#lcCommand", "description": "Change all selected text to lowercase", "withKey": "CMD SHIFT L", "ep": "command", "name": "lc"}, {"pointer": "commands/editor#detabCommand", "description": "Convert tabs to spaces.", "params": [{"defaultValue": null, "type": "text", "name": "tabsize", "description": "Optionally, specify a tab size. (Defaults to setting.)"}], "ep": "command", "name": "detab"}, {"pointer": "commands/editor#entabCommand", "description": "Convert spaces to tabs.", "params": [{"defaultValue": null, "type": "text", "name": "tabsize", "description": "Optionally, specify a tab size. (Defaults to setting.)"}], "ep": "command", "name": "entab"}, {"pointer": "commands/editor#trimCommand", "description": "trim trailing or leading whitespace from each line in selection", "params": [{"defaultValue": "both", "type": {"data": [{"name": "left"}, {"name": "right"}, {"name": "both"}], "name": "selection"}, "name": "side", "description": "Do we trim from the left, right or both"}], "ep": "command", "name": "trim"}, {"pointer": "commands/editor#ucCommand", "description": "Change all selected text to uppercase", "withKey": "CMD SHIFT U", "ep": "command", "name": "uc"}, {"predicates": {"isTextView": true}, "pointer": "controllers/undo#undoManagerCommand", "ep": "command", "key": ["ctrl_shift_z"], "name": "redo"}, {"predicates": {"isTextView": true}, "pointer": "controllers/undo#undoManagerCommand", "ep": "command", "key": ["ctrl_z"], "name": "undo"}, {"description": "The distance in characters between each tab", "defaultValue": 8, "type": "number", "ep": "setting", "name": "tabstop"}, {"description": "Customize the keymapping", "defaultValue": "{}", "type": "text", "ep": "setting", "name": "customKeymapping"}, {"description": "The keymapping to use", "defaultValue": "standard", "type": "text", "ep": "setting", "name": "keymapping"}, {"description": "The editor font size in pixels", "defaultValue": 14, "type": "number", "ep": "setting", "name": "fontsize"}, {"description": "The editor font face", "defaultValue": "Monaco, Lucida Console, monospace", "type": "text", "ep": "setting", "name": "fontface"}, {"defaultValue": {"color": "#e5c138", "paddingLeft": 5, "backgroundColor": "#4c4a41", "paddingRight": 10}, "ep": "themevariable", "name": "gutter"}, {"defaultValue": {"color": "#e6e6e6", "selectedTextBackgroundColor": "#526da5", "backgroundColor": "#2a211c", "cursorColor": "#879aff", "unfocusedCursorBackgroundColor": "#73171e", "unfocusedCursorColor": "#ff0033"}, "ep": "themevariable", "name": "editor"}, {"defaultValue": {"comment": "#666666", "directive": "#999999", "keyword": "#42A8ED", "plain": "#e6e6e6", "error": "#ff0000", "operator": "#88BBFF", "identifier": "#D841FF", "string": "#039A0A"}, "ep": "themevariable", "name": "highlighter"}, {"defaultValue": {"nibStrokeStyle": "rgb(150, 150, 150)", "fullAlpha": 1.0, "barFillStyle": "rgb(0, 0, 0)", "particalAlpha": 0.29999999999999999, "barFillGradientBottomStop": "rgb(44, 44, 44)", "backgroundStyle": "#2A211C", "thickness": 17, "padding": 5, "trackStrokeStyle": "rgb(150, 150, 150)", "nibArrowStyle": "rgb(255, 255, 255)", "barFillGradientBottomStart": "rgb(22, 22, 22)", "barFillGradientTopStop": "rgb(40, 40, 40)", "barFillGradientTopStart": "rgb(90, 90, 90)", "nibStyle": "rgb(100, 100, 100)", "trackFillStyle": "rgba(50, 50, 50, 0.8)"}, "ep": "themevariable", "name": "scroller"}, {"description": "Event: Notify when something within the editor changed.", "params": [{"required": true, "name": "pointer", "description": "Function that is called whenever a change happened."}], "ep": "extensionpoint", "name": "editorChange"}], "type": "plugins/supported", "name": "text_editor"}, "less": {"resourceURL": "resources/less/", "description": "Leaner CSS", "contributors": [], "author": "Alexis Sellier <self@cloudhead.net>", "url": "http://lesscss.org", "version": "1.0.11", "dependencies": {}, "testmodules": [], "provides": [], "keywords": ["css", "parser", "lesscss", "browser"], "type": "plugins/thirdparty", "name": "less"}, "theme_manager_base": {"resourceURL": "resources/theme_manager_base/", "name": "theme_manager_base", "share": true, "environments": {"main": true}, "dependencies": {}, "testmodules": [], "provides": [{"description": "(Less)files holding the CSS style information for the UI.", "params": [{"required": true, "name": "url", "description": "Name of the ThemeStylesFile - can also be an array of files."}], "ep": "extensionpoint", "name": "themestyles"}, {"description": "Event: Notify when the theme(styles) changed.", "params": [{"required": true, "name": "pointer", "description": "Function that is called whenever the theme is changed."}], "ep": "extensionpoint", "name": "themeChange"}, {"indexOn": "name", "description": "A theme is a way change the look of the application.", "params": [{"required": false, "name": "url", "description": "Name of a ThemeStylesFile that holds theme specific CSS rules - can also be an array of files."}, {"required": true, "name": "pointer", "description": "Function that returns the ThemeData"}], "ep": "extensionpoint", "name": "theme"}], "type": "plugins/supported", "description": "Defines extension points required for theming"}, "canon": {"resourceURL": "resources/canon/", "name": "canon", "environments": {"main": true, "worker": false}, "dependencies": {"environment": "0.0.0", "events": "0.0.0", "settings": "0.0.0"}, "testmodules": [], "provides": [{"indexOn": "name", "description": "A command is a bit of functionality with optional typed arguments which can do something small like moving the cursor around the screen, or large like cloning a project from VCS.", "ep": "extensionpoint", "name": "command"}, {"description": "An extension point to be called whenever a new command begins output.", "ep": "extensionpoint", "name": "addedRequestOutput"}, {"description": "A dimensionsChanged is a way to be notified of changes to the dimension of Bespin", "ep": "extensionpoint", "name": "dimensionsChanged"}, {"description": "How many typed commands do we recall for reference?", "defaultValue": 50, "type": "number", "ep": "setting", "name": "historyLength"}, {"action": "create", "pointer": "history#InMemoryHistory", "ep": "factory", "name": "history"}], "type": "plugins/supported", "description": "Manages commands"}, "traits": {"resourceURL": "resources/traits/", "description": "Traits library, traitsjs.org", "dependencies": {}, "testmodules": [], "provides": [], "type": "plugins/thirdparty", "name": "traits"}, "keyboard": {"resourceURL": "resources/keyboard/", "description": "Keyboard shortcuts", "dependencies": {"canon": "0.0", "settings": "0.0"}, "testmodules": ["tests/testKeyboard"], "provides": [{"description": "A keymapping defines how keystrokes are interpreted.", "params": [{"required": true, "name": "states", "description": "Holds the states and all the informations about the keymapping. See docs: pluginguide/keymapping"}], "ep": "extensionpoint", "name": "keymapping"}], "type": "plugins/supported", "name": "keyboard"}, "worker_manager": {"resourceURL": "resources/worker_manager/", "description": "Manages a web worker on the browser side", "dependencies": {"canon": "0.0.0", "events": "0.0.0", "underscore": "0.0.0"}, "testmodules": [], "provides": [{"description": "Low-level web worker control (for plugin development)", "ep": "command", "name": "worker"}, {"description": "Restarts all web workers (for plugin development)", "pointer": "#workerRestartCommand", "ep": "command", "name": "worker restart"}], "type": "plugins/supported", "name": "worker_manager"}, "edit_session": {"resourceURL": "resources/edit_session/", "description": "Ties together the files being edited with the views on screen", "dependencies": {"events": "0.0.0"}, "testmodules": ["tests/testSession"], "provides": [{"action": "call", "pointer": "#createSession", "ep": "factory", "name": "session"}], "type": "plugins/supported", "name": "edit_session"}, "syntax_manager": {"resourceURL": "resources/syntax_manager/", "name": "syntax_manager", "environments": {"main": true, "worker": false}, "dependencies": {"worker_manager": "0.0.0", "events": "0.0.0", "underscore": "0.0.0", "syntax_directory": "0.0.0"}, "testmodules": [], "provides": [], "type": "plugins/supported", "description": "Provides syntax highlighting services for the editor"}, "completion": {"resourceURL": "resources/completion/", "description": "Code completion support", "dependencies": {"jquery": "0.0.0", "ctags": "0.0.0", "rangeutils": "0.0.0", "canon": "0.0.0", "underscore": "0.0.0"}, "testmodules": [], "provides": [{"indexOn": "name", "description": "Code completion support for specific languages", "ep": "extensionpoint", "name": "completion"}, {"description": "Accept the chosen completion", "key": ["return", "tab"], "predicates": {"completing": true}, "pointer": "controller#completeCommand", "ep": "command", "name": "complete"}, {"description": "Abandon the completion", "key": "escape", "predicates": {"completing": true}, "pointer": "controller#completeCancelCommand", "ep": "command", "name": "complete cancel"}, {"description": "Choose the completion below", "key": "down", "predicates": {"completing": true}, "pointer": "controller#completeDownCommand", "ep": "command", "name": "complete down"}, {"description": "Choose the completion above", "key": "up", "predicates": {"completing": true}, "pointer": "controller#completeUpCommand", "ep": "command", "name": "complete up"}], "type": "plugins/supported", "name": "completion"}, "environment": {"testmodules": [], "dependencies": {"settings": "0.0.0"}, "resourceURL": "resources/environment/", "name": "environment", "type": "plugins/supported"}, "undomanager": {"resourceURL": "resources/undomanager/", "description": "Manages undoable events", "testmodules": ["tests/testUndomanager"], "provides": [{"pointer": "#undoManagerCommand", "ep": "command", "key": ["ctrl_shift_z"], "name": "redo"}, {"pointer": "#undoManagerCommand", "ep": "command", "key": ["ctrl_z"], "name": "undo"}], "type": "plugins/supported", "name": "undomanager"}, "rangeutils": {"testmodules": ["tests/test"], "type": "plugins/supported", "resourceURL": "resources/rangeutils/", "description": "Utility functions for dealing with ranges of text", "name": "rangeutils"}, "stylesheet": {"resourceURL": "resources/stylesheet/", "name": "stylesheet", "environments": {"worker": true}, "dependencies": {"standard_syntax": "0.0.0"}, "testmodules": [], "provides": [{"pointer": "#CSSSyntax", "ep": "syntax", "fileexts": ["css", "less"], "name": "css"}], "type": "plugins/supported", "description": "CSS syntax highlighter"}, "html": {"resourceURL": "resources/html/", "name": "html", "environments": {"worker": true}, "dependencies": {"standard_syntax": "0.0.0"}, "testmodules": [], "provides": [{"pointer": "#HTMLSyntax", "ep": "syntax", "fileexts": ["htm", "html"], "name": "html"}], "type": "plugins/supported", "description": "HTML syntax highlighter"}, "js_syntax": {"resourceURL": "resources/js_syntax/", "name": "js_syntax", "environments": {"worker": true}, "dependencies": {"standard_syntax": "0.0.0"}, "testmodules": [], "provides": [{"pointer": "#JSSyntax", "ep": "syntax", "fileexts": ["js", "json"], "name": "js"}], "type": "plugins/supported", "description": "JavaScript syntax highlighter"}, "ctags": {"resourceURL": "resources/ctags/", "description": "Reads and writes tag files", "dependencies": {"traits": "0.0.0", "underscore": "0.0.0"}, "testmodules": [], "type": "plugins/supported", "name": "ctags"}, "events": {"resourceURL": "resources/events/", "description": "Dead simple event implementation", "dependencies": {"traits": "0.0"}, "testmodules": ["tests/test"], "provides": [], "type": "plugins/supported", "name": "events"}, "theme_manager": {"resourceURL": "resources/theme_manager/", "name": "theme_manager", "share": true, "environments": {"main": true, "worker": false}, "dependencies": {"theme_manager_base": "0.0.0", "settings": "0.0.0", "events": "0.0.0", "less": "0.0.0"}, "testmodules": [], "provides": [{"unregister": "themestyles#unregisterThemeStyles", "register": "themestyles#registerThemeStyles", "ep": "extensionhandler", "name": "themestyles"}, {"unregister": "index#unregisterTheme", "register": "index#registerTheme", "ep": "extensionhandler", "name": "theme"}, {"defaultValue": "standard", "description": "The theme plugin's name to use. If set to 'standard' no theme will be used", "type": "text", "ep": "setting", "name": "theme"}, {"pointer": "#appLaunched", "ep": "appLaunched"}], "type": "plugins/supported", "description": "Handles colors in Bespin"}, "standard_syntax": {"resourceURL": "resources/standard_syntax/", "description": "Easy-to-use basis for syntax engines", "environments": {"worker": true}, "dependencies": {"syntax_worker": "0.0.0", "syntax_directory": "0.0.0", "underscore": "0.0.0"}, "testmodules": [], "type": "plugins/supported", "name": "standard_syntax"}, "types": {"resourceURL": "resources/types/", "description": "Defines parameter types for commands", "testmodules": ["tests/testBasic", "tests/testTypes"], "provides": [{"indexOn": "name", "description": "Commands can accept various arguments that the user enters or that are automatically supplied by the environment. Those arguments have types that define how they are supplied or completed. The pointer points to an object with methods convert(str value) and getDefault(). Both functions have `this` set to the command's `takes` parameter. If getDefault is not defined, the default on the command's `takes` is used, if there is one. The object can have a noInput property that is set to true to reflect that this type is provided directly by the system. getDefault must be defined in that case.", "ep": "extensionpoint", "name": "type"}, {"description": "Text that the user needs to enter.", "pointer": "basic#text", "ep": "type", "name": "text"}, {"description": "A JavaScript number", "pointer": "basic#number", "ep": "type", "name": "number"}, {"description": "A true/false value", "pointer": "basic#bool", "ep": "type", "name": "boolean"}, {"description": "An object that converts via JavaScript", "pointer": "basic#object", "ep": "type", "name": "object"}, {"description": "A string that is constrained to be one of a number of pre-defined values", "pointer": "basic#selection", "ep": "type", "name": "selection"}, {"description": "A type which we don't understand from the outset, but which we hope context can help us with", "ep": "type", "name": "deferred"}], "type": "plugins/supported", "name": "types"}, "jquery": {"testmodules": [], "resourceURL": "resources/jquery/", "name": "globaljquery", "type": "thirdparty"}, "embedded": {"testmodules": [], "dependencies": {"theme_manager": "0.0.0", "text_editor": "0.0.0", "appconfig": "0.0.0", "edit_session": "0.0.0", "screen_theme": "0.0.0"}, "resourceURL": "resources/embedded/", "name": "embedded", "type": "plugins/supported"}, "settings": {"resourceURL": "resources/settings/", "description": "Infrastructure and commands for managing user preferences", "share": true, "dependencies": {"types": "0.0"}, "testmodules": [], "provides": [{"description": "Storage for the customizable Bespin settings", "pointer": "index#settings", "ep": "appcomponent", "name": "settings"}, {"indexOn": "name", "description": "A setting is something that the application offers as a way to customize how it works", "register": "index#addSetting", "ep": "extensionpoint", "name": "setting"}, {"description": "A settingChange is a way to be notified of changes to a setting", "ep": "extensionpoint", "name": "settingChange"}, {"pointer": "commands#setCommand", "description": "define and show settings", "params": [{"defaultValue": null, "type": {"pointer": "settings:index#getSettings", "name": "selection"}, "name": "setting", "description": "The name of the setting to display or alter"}, {"defaultValue": null, "type": {"pointer": "settings:index#getTypeSpecFromAssignment", "name": "deferred"}, "name": "value", "description": "The new value for the chosen setting"}], "ep": "command", "name": "set"}, {"pointer": "commands#unsetCommand", "description": "unset a setting entirely", "params": [{"type": {"pointer": "settings:index#getSettings", "name": "selection"}, "name": "setting", "description": "The name of the setting to return to defaults"}], "ep": "command", "name": "unset"}], "type": "plugins/supported", "name": "settings"}, "appconfig": {"resourceURL": "resources/appconfig/", "description": "Instantiates components and displays the GUI based on configuration.", "dependencies": {"jquery": "0.0.0", "canon": "0.0.0", "settings": "0.0.0"}, "testmodules": [], "provides": [{"description": "Event: Fired when the app is completely launched.", "ep": "extensionpoint", "name": "appLaunched"}], "type": "plugins/supported", "name": "appconfig"}, "syntax_worker": {"resourceURL": "resources/syntax_worker/", "description": "Coordinates multiple syntax engines", "environments": {"worker": true}, "dependencies": {"syntax_directory": "0.0.0", "underscore": "0.0.0"}, "testmodules": [], "type": "plugins/supported", "name": "syntax_worker"}, "screen_theme": {"resourceURL": "resources/screen_theme/", "description": "Bespins standard theme basePlugin", "dependencies": {"theme_manager": "0.0.0"}, "testmodules": [], "provides": [{"url": ["theme.less"], "ep": "themestyles"}, {"defaultValue": "@global_font", "ep": "themevariable", "name": "container_font"}, {"defaultValue": "@global_font_size", "ep": "themevariable", "name": "container_font_size"}, {"defaultValue": "@global_container_background", "ep": "themevariable", "name": "container_bg"}, {"defaultValue": "@global_color", "ep": "themevariable", "name": "container_color"}, {"defaultValue": "@global_line_height", "ep": "themevariable", "name": "container_line_height"}, {"defaultValue": "@global_pane_background", "ep": "themevariable", "name": "pane_bg"}, {"defaultValue": "@global_pane_border_radius", "ep": "themevariable", "name": "pane_border_radius"}, {"defaultValue": "@global_form_font", "ep": "themevariable", "name": "form_font"}, {"defaultValue": "@global_form_font_size", "ep": "themevariable", "name": "form_font_size"}, {"defaultValue": "@global_form_line_height", "ep": "themevariable", "name": "form_line_height"}, {"defaultValue": "@global_form_color", "ep": "themevariable", "name": "form_color"}, {"defaultValue": "@global_form_text_shadow", "ep": "themevariable", "name": "form_text_shadow"}, {"defaultValue": "@global_pane_link_color", "ep": "themevariable", "name": "pane_a_color"}, {"defaultValue": "@global_font", "ep": "themevariable", "name": "pane_font"}, {"defaultValue": "@global_font_size", "ep": "themevariable", "name": "pane_font_size"}, {"defaultValue": "@global_pane_text_shadow", "ep": "themevariable", "name": "pane_text_shadow"}, {"defaultValue": "@global_pane_h1_font", "ep": "themevariable", "name": "pane_h1_font"}, {"defaultValue": "@global_pane_h1_font_size", "ep": "themevariable", "name": "pane_h1_font_size"}, {"defaultValue": "@global_pane_h1_color", "ep": "themevariable", "name": "pane_h1_color"}, {"defaultValue": "@global_font_size * 1.8", "ep": "themevariable", "name": "pane_line_height"}, {"defaultValue": "@global_pane_color", "ep": "themevariable", "name": "pane_color"}, {"defaultValue": "@global_text_shadow", "ep": "themevariable", "name": "pane_text_shadow"}, {"defaultValue": "@global_font", "ep": "themevariable", "name": "button_font"}, {"defaultValue": "@global_font_size", "ep": "themevariable", "name": "button_font_size"}, {"defaultValue": "@global_button_color", "ep": "themevariable", "name": "button_color"}, {"defaultValue": "@global_button_background", "ep": "themevariable", "name": "button_bg"}, {"defaultValue": "@button_bg - #063A27", "ep": "themevariable", "name": "button_bg2"}, {"defaultValue": "@button_bg - #194A5E", "ep": "themevariable", "name": "button_border"}, {"defaultValue": "@global_control_background", "ep": "themevariable", "name": "control_bg"}, {"defaultValue": "@global_control_color", "ep": "themevariable", "name": "control_color"}, {"defaultValue": "@global_control_border", "ep": "themevariable", "name": "control_border"}, {"defaultValue": "@global_control_border_radius", "ep": "themevariable", "name": "control_border_radius"}, {"defaultValue": "@global_control_active_background", "ep": "themevariable", "name": "control_active_bg"}, {"defaultValue": "@global_control_active_border", "ep": "themevariable", "name": "control_active_border"}, {"defaultValue": "@global_control_active_color", "ep": "themevariable", "name": "control_active_color"}, {"defaultValue": "@global_control_active_inset_color", "ep": "themevariable", "name": "control_active_inset_color"}], "type": "plugins/supported", "name": "screen_theme"}});;
});
})();
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// This script appears at the end of BespinEmbeddedMain and is responsible
// for firing up Bespin on the page.
// This module depends only on Tiki.


(function() {

var $ = bespin.tiki.require("jquery").$;
/**
 * Returns the CSS property of element.
 *   1) If the CSS property is on the style object of the element, use it, OR
 *   2) Compute the CSS property
 *
 * If the property can't get computed, is 'auto' or 'intrinsic', the former
 * calculated property is uesd (this can happen in cases where the textarea
 * is hidden and has no dimension styles).
 */
var getCSSProperty = function(element, container, property) {
    var ret = element.style[property]
                || document.defaultView.getComputedStyle(element, '').
                                        getPropertyValue(property);

    if (!ret || ret == 'auto' || ret == 'intrinsic') {
        ret = container.style[property];
    }
    return ret;
};

/**
 * Returns the sum of all passed property values. Calls internal getCSSProperty
 * to get the value of the individual peroperties.
  */
// var sumCSSProperties = function(element, container, props) {
//     var ret = document.defaultView.getComputedStyle(element, '').
//                                         getPropertyValue(props[0]);
//
//     if (!ret || ret == 'auto' || ret == 'intrinsic') {
//         return container.style[props[0]];
//     }
//
//     var sum = props.map(function(item) {
//         var cssProp = getCSSProperty(element, container, item);
//         // Remove the 'px; and parse the property to a floating point.
//         return parseFloat(cssProp.replace('px', ''));
//     }).reduce(function(a, b) {
//         return a + b;
//     });
//
//     return sum;
// };

bespin.useBespin = function(element, options) {
    var util = bespin.tiki.require('bespin:util/util');

    var baseConfig = {};
    var baseSettings = baseConfig.settings;
    options = options || {};
    for (var key in options) {
        baseConfig[key] = options[key];
    }

    // we need to separately merge the configured settings
    var configSettings = baseConfig.settings;
    if (baseSettings !== undefined) {
        for (key in baseSettings) {
            if (configSettings[key] === undefined) {
                baseConfig.settings[key] = baseSettings[key];
            }
        }
    }

    var Promise = bespin.tiki.require('bespin:promise').Promise;
    var prEnv = null;
    var pr = new Promise();

    bespin.tiki.require.ensurePackage("::appconfig", function() {
        var appconfig = bespin.tiki.require("appconfig");
        if (util.isString(element)) {
            element = document.getElementById(element);
        }

        if (util.none(baseConfig.initialContent)) {
            baseConfig.initialContent = element.value || element.innerHTML;
        }

        element.innerHTML = '';

        if (element.type == 'textarea') {
            var parentNode = element.parentNode;
            // This will hold the Bespin editor.
            var container = document.createElement('div');

            // To put Bespin in the place of the textarea, we have to copy a
            // few of the textarea's style attributes to the div container.
            //
            // The problem is, that the properties have to get computed (they
            // might be defined by a CSS file on the page - you can't access
            // such rules that apply to an element via elm.style). Computed
            // properties are converted to pixels although the dimension might
            // be given as percentage. When the window resizes, the dimensions
            // defined by percentages changes, so the properties have to get
            // recomputed to get the new/true pixels.
            var resizeEvent = function() {
                var style = 'position:relative;';
                [
                    'margin-top', 'margin-left', 'margin-right', 'margin-bottom'
                ].forEach(function(item) {
                    style += item + ':' +
                                getCSSProperty(element, container, item) + ';';
                });

                // Calculating the width/height of the textarea is somewhat
                // tricky. To do it right, you have to include the paddings
                // to the sides as well (eg. width = width + padding-left, -right).
                // This works well, as long as the width of the element is not
                // set or given in pixels. In this case and after the textarea
                // is hidden, getCSSProperty(element, container, 'width') will
                // still return pixel value. If the element has realtiv dimensions
                // (e.g. width='95<percent>') getCSSProperty(...) will return pixel values
                // only as long as the textarea is visible. After it is hidden
                // getCSSProperty will return the relativ dimensions as they
                // are set on the element (in the case of width, 95<percent>).
                // Making the sum of pixel vaules (e.g. padding) and realtive
                // values (e.g. <percent>) is not possible. As such the padding styles
                // are ignored.

                // The complete width is the width of the textarea + the padding
                // to the left and right.
                // var width = sumCSSProperties(element, container, [
                //     'width', 'padding-left', 'padding-right'
                // ]) + 'px';
                // var height = sumCSSProperties(element, container, [
                //     'height', 'padding-top', 'padding-bottom'
                // ]) + 'px';
                var width = getCSSProperty(element, container, 'width');
                var height = getCSSProperty(element, container, 'height');
                style += 'height:' + height + ';width:' + width + ';';

                // Set the display property to 'inline-block'.
                style += 'display:inline-block;';
                container.setAttribute('style', style);
            };
            window.addEventListener('resize', resizeEvent, false);

            // Call the resizeEvent once, so that the size of the container is
            // calculated.
            resizeEvent();

            // Insert the div container after the element.
            if (element.nextSibling) {
                parentNode.insertBefore(container, element.nextSibling);
            } else {
                parentNode.appendChild(container);
            }

            // Override the forms onsubmit function. Set the innerHTML and value
            // of the textarea before submitting.
            while (parentNode !== document) {
                if (parentNode.tagName.toUpperCase() === 'FORM') {
                    var oldSumit = parentNode.onsubmit;
                    // Override the onsubmit function of the form.
                    parentNode.onsubmit = function(evt) {
                        element.value = prEnv.editor.value;
                        element.innerHTML = prEnv.editor.value;
                        // If there is a onsubmit function already, then call
                        // it with the current context and pass the event.
                        if (oldSumit) {
                            oldSumit.call(this, evt);
                        }
                    }
                    break;
                }
                parentNode = parentNode.parentNode;
            }

            // Hide the element.
            element.style.display = 'none';

            // The div container is the new element that is passed to appconfig.
            baseConfig.element = container;

            // Check if the textarea has the 'readonly' flag and set it
            // on the config object so that the editor is readonly.
            if (!util.none(element.getAttribute('readonly'))) {
                baseConfig.readOnly = true;
            }
        } else {
            baseConfig.element = element;
        }

        appconfig.launch(baseConfig).then(function(env) {
            prEnv = env;
            pr.resolve(env);
        });
    });

    return pr;
};

$(document).ready(function() {
    // Holds the lauch promises of all launched Bespins.
    var launchBespinPromises = [];

    var nodes = document.querySelectorAll(".bespin");
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var options = node.getAttribute('data-bespinoptions') || '{}';
        var pr = bespin.useBespin(node, JSON.parse(options));
        pr.then(function(env) {
            node.bespin = env;
        }, function(error) {
            throw new Error('Launch failed: ' + error);
        });
        launchBespinPromises.push(pr);
    }

    // If users want a custom startup
    if (window.onBespinLoad) {
        // group-promise function.
        var group = bespin.tiki.require("bespin:promise").group;

        // Call the window.onBespinLoad() function after all launched Bespins
        // are ready or throw an error otherwise.
        group(launchBespinPromises).then(function() {
            window.onBespinLoad();
        }, function() {
            throw new Error('At least one Bespin failed to launch!');
        });
    }
});

})();

import { Editor, Plugin } from 'obsidian';

export default class InsertNewLine extends Plugin {
    async onload() {
        // helper: 判断光标是否在表格中（当前行或前后行包含 '|'）
        const isInTable = (editor: Editor, cursor: { line: number; ch: number }) => {
            if (cursor.line < 0) return false;
            const line = editor.getLine(cursor.line) || '';
            if (line.includes('|')) return true;
            const prev = editor.getLine(cursor.line - 1) || '';
            const next = editor.getLine(cursor.line + 1) || '';
            return prev.includes('|') || next.includes('|');
        };

        this.addCommand({
            id: 'new-line-above',
            name: 'Above',
            icon: 'move-up-left',
            editorCallback: (editor: Editor) => {
                const cursor = editor.getCursor();
                // 如果在表格，使用普通换行（类似 Shift+Enter），不执行插件的列表/引用逻辑
                if (isInTable(editor, cursor)) {
                    editor.replaceRange('\n', cursor);
                    editor.setCursor(cursor.line + 1, cursor.ch);
                    return;
                }

                const line = editor.getLine(cursor.line);
                const match = line.match(/^\s*(- \[[x ]\]|[+*-]|[0-9]+\.)\s+/);
                const line_prefix = match ? match[0] : '';
                editor.replaceRange(`${line_prefix}\n`, { line: cursor.line, ch: 0 });
                editor.setCursor(cursor.line, line_prefix.length);
            }
        });
        
        this.addCommand({
            id: 'new-line-below',
            name: 'Below',
            icon: 'move-down-left',
            editorCallback: (editor: Editor) => {
                const cursor = editor.getCursor();
                // 如果在表格，使用普通换行（类似 Shift+Enter），不执行插件的列表/引用逻辑
                if (isInTable(editor, cursor)) {
                    editor.replaceRange('\n', cursor);
                    editor.setCursor(cursor.line + 1, cursor.ch);
                    return;
                }

                const line = editor.getLine(cursor.line);
                const listMatch = line.match(/^\s*(- \[[x ]\]|[+*-]|[0-9]+\.)\s+/);
                const blockquoteMatch = line.match(/^\s*>/);
                const line_prefix = listMatch ? listMatch[0] : (blockquoteMatch ? '> ' : '');
                editor.replaceRange(`\n${line_prefix}`, { line: cursor.line, ch: line.length });
                editor.setCursor(cursor.line + 1, line_prefix.length);
            }
        });
    }

    onunload() {}
}
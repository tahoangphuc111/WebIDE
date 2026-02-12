function getLanguageSnippets(language) {
    const snippets = {
        python: [
            {
                label: 'for loop',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'for ${1:i} in range(${2:10}):\n    ${3:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'For loop'
            },
            {
                label: 'if statement',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'if ${1:condition}:\n    ${2:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'If statement'
            },
            {
                label: 'def function',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'def ${1:function_name}(${2:args}):\n    ${3:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Function definition'
            },
            {
                label: 'class',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'class ${1:ClassName}:\n    def __init__(self, ${2:args}):\n        ${3:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Class definition'
            }
        ],
        cpp: [
            {
                label: 'for loop',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${3}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'For loop'
            },
            {
                label: 'vector',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'std::vector<${1:int}> ${2:vec};',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Vector declaration'
            },
            {
                label: 'function',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '${1:void} ${2:function_name}(${3:params}) {\n    ${4}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Function definition'
            }
        ],
        c: [
            {
                label: 'for loop',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${3}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'For loop'
            },
            {
                label: 'function',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '${1:void} ${2:function_name}(${3:params}) {\n    ${4}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Function definition'
            }
        ],
        javascript: [
            {
                label: 'for loop',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n    ${3}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'For loop'
            },
            {
                label: 'arrow function',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'const ${1:func} = (${2:params}) => {\n    ${3}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Arrow function'
            },
            {
                label: 'async function',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'async function ${1:func}(${2:params}) {\n    ${3}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Async function'
            }
        ]
    };

    return snippets[language] || [];
}

document.addEventListener('DOMContentLoaded', () => {
    let defaultCode = {
        'python': 'print("Hello, World!")\n'
    };

    if (window.initialData && window.initialData.snippets) {
        defaultCode = window.initialData.snippets;
    }

    let editor;

    require(['vs/editor/editor.main'], function () {
        let startLang = window.initialData.language || 'python';
        let startCode = window.initialData.code || defaultCode[startLang] || '';

        // Update select box
        const langSelect = document.getElementById('language-select');
        if (langSelect) langSelect.value = startLang;

        editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
            value: startCode,
            language: startLang,
            theme: 'vs-dark',
            automaticLayout: true,

            // Font settings
            fontFamily: 'Fira Code, Consolas, Monaco, monospace',
            fontSize: 14,
            fontLigatures: true,
            lineHeight: 21,

            // Editor features
            minimap: { enabled: true, maxColumn: 80 },
            scrollBeyondLastLine: false,
            roundedSelection: true,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,

            // Code intelligence
            quickSuggestions: {
                other: true,
                comments: false,
                strings: false
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            tabCompletion: 'on',
            wordBasedSuggestions: true,

            // Code formatting
            formatOnType: true,
            formatOnPaste: true,
            autoIndent: 'full',

            // Bracket features
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoSurround: 'languageDefined',
            bracketPairColorization: { enabled: true },

            // Code folding
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'mouseover',

            // Line numbers & whitespace
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            renderControlCharacters: false,

            // Scrollbar
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
            },

            // Performance
            renderValidationDecorations: 'on',
            codeLens: false
        });

        // Add custom code snippets for better autocomplete
        const snippetsProvider = monaco.languages.registerCompletionItemProvider(startLang, {
            provideCompletionItems: (model, position) => {
                const suggestions = getLanguageSnippets(startLang);
                return { suggestions };
            }
        });
    });

    const languageSelect = document.getElementById('language-select');
    const runBtn = document.getElementById('run-btn');
    const outputArea = document.getElementById('output-area');
    const inputArea = document.getElementById('input-area');

    // Language Change
    languageSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model, lang);
        editor.setValue(defaultCode[lang]);
    });

    // CSRF Token Helper
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Run Code
    runBtn.addEventListener('click', async () => {
        outputArea.textContent = 'Running...';
        runBtn.disabled = true;

        const csrftoken = getCookie('csrftoken');
        const code = editor.getValue();
        const language = languageSelect.value;
        const input = inputArea.value;

        try {
            const response = await fetch('/run/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({ code, language, input })
            });

            const data = await response.json();

            if (data.error) {
                outputArea.textContent = `Error: ${data.error}`;
                outputArea.style.color = '#f44336';
                document.getElementById('stats-display').style.display = 'none';
            } else {
                outputArea.style.color = '#cccccc';
                let outputText = '';

                if (data.success) {
                    outputText = data.stdout || (data.stderr ? data.stderr : "No output");
                } else {
                    outputText = data.stderr || "Execution failed";
                    outputArea.style.color = '#ff9800'; // Orange for runtime errors
                }

                // Append created files if any
                if (data.files && Object.keys(data.files).length > 0) {
                    outputText += '\n\n';
                    for (const [filename, content] of Object.entries(data.files)) {
                        outputText += `\n=== ${filename} ===\n${content}\n`;
                    }
                }

                outputArea.textContent = outputText;

                // Show stats
                const statsDisplay = document.getElementById('stats-display');
                const runTime = document.getElementById('run-time');
                const runMemory = document.getElementById('run-memory');

                if (data.duration !== undefined) {
                    runTime.textContent = data.duration + 's';
                    runMemory.textContent = data.memory + 'KB';
                    statsDisplay.style.display = 'inline';
                }
            }
        } catch (error) {
            outputArea.textContent = `Network Error: ${error.message}`;
            outputArea.style.color = '#f44336';
            document.getElementById('stats-display').style.display = 'none';
        } finally {
            runBtn.disabled = false;
        }
    });

    // ===== File Upload/Download & History Features =====

    const uploadBtn = document.getElementById('upload-btn');
    const downloadBtn = document.getElementById('download-btn');
    const fileUpload = document.getElementById('file-upload');
    const historyBtn = document.getElementById('history-btn');
    const historySidebar = document.getElementById('history-sidebar');
    const closeHistoryBtn = document.getElementById('close-history');
    const historyList = document.getElementById('history-list');

    const MAX_HISTORY = 20; // Store last 20 code snippets

    // History Management
    function getHistory() {
        const history = localStorage.getItem('codeHistory');
        return history ? JSON.parse(history) : [];
    }

    function saveToHistory(code, language) {
        if (!code.trim()) return; // Don't save empty code

        const history = getHistory();
        const now = new Date().toISOString();

        const preview = code.split('\n').slice(0, 2).join('\n').substring(0, 100);

        const newItem = {
            id: Date.now(),
            code: code,
            language: language,
            preview: preview,
            timestamp: now
        };

        // Add to beginning of array
        history.unshift(newItem);

        // Keep only MAX_HISTORY items
        if (history.length > MAX_HISTORY) {
            history.splice(MAX_HISTORY);
        }

        localStorage.setItem('codeHistory', JSON.stringify(history));
        renderHistory();
    }

    function deleteHistoryItem(id) {
        let history = getHistory();
        history = history.filter(item => item.id !== id);
        localStorage.setItem('codeHistory', JSON.stringify(history));
        renderHistory();
    }

    function loadHistoryItem(id) {
        const history = getHistory();
        const item = history.find(h => h.id === id);
        if (item) {
            editor.setValue(item.code);
            languageSelect.value = item.language;
            const model = editor.getModel();
            monaco.editor.setModelLanguage(model, item.language);
            historySidebar.classList.remove('active');
        }
    }

    function formatTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    function renderHistory() {
        const history = getHistory();

        if (history.length === 0) {
            historyList.innerHTML = '<p class="history-empty">No history yet. Your code will be saved automatically.</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item" onclick="loadHistoryItem(${item.id})">
                <div class="history-item-header">
                    <span class="history-lang">${item.language}</span>
                    <span class="history-time">${formatTimeAgo(item.timestamp)}</span>
                </div>
                <div class="history-preview">${item.preview.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                <div class="history-actions" onclick="event.stopPropagation()">
                    <button onclick="loadHistoryItem(${item.id})">
                        <i class="fa-solid fa-rotate-left"></i> Restore
                    </button>
                    <button class="btn-delete" onclick="deleteHistoryItem(${item.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Make functions global for onclick handlers
    window.loadHistoryItem = loadHistoryItem;
    window.deleteHistoryItem = deleteHistoryItem;

    // File Upload
    uploadBtn.addEventListener('click', () => {
        fileUpload.click();
    });

    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            editor.setValue(event.target.result);

            // Try to detect language from file extension
            const ext = file.name.split('.').pop().toLowerCase();
            const langMap = {
                'py': 'python',
                'cpp': 'cpp',
                'c': 'c',
                'pas': 'pascal',
                'java': 'java',
                'js': 'javascript',
                'go': 'go',
                'rs': 'rust',
                'txt': 'plaintext'
            };

            const detectedLang = langMap[ext] || 'plaintext';
            if (languageSelect.querySelector(`option[value="${detectedLang}"]`)) {
                languageSelect.value = detectedLang;
                const model = editor.getModel();
                monaco.editor.setModelLanguage(model, detectedLang);
            }

            outputArea.textContent = `File loaded: ${file.name}`;
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    });

    // File Download
    downloadBtn.addEventListener('click', () => {
        const code = editor.getValue();
        const language = languageSelect.value;

        // File extensions map
        const extMap = {
            'python': 'py',
            'cpp': 'cpp',
            'c': 'c',
            'pascal': 'pas',
            'java': 'java',
            'javascript': 'js',
            'go': 'go',
            'rust': 'rs'
        };

        const ext = extMap[language] || 'txt';
        const filename = `code_${Date.now()}.${ext}`;

        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        outputArea.textContent = `Downloaded as: ${filename}`;
    });

    // History Sidebar Toggle
    historyBtn.addEventListener('click', () => {
        historySidebar.classList.toggle('active');
        renderHistory();
    });

    closeHistoryBtn.addEventListener('click', () => {
        historySidebar.classList.remove('active');
    });

    // Close history sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (historySidebar.classList.contains('active') &&
            !historySidebar.contains(e.target) &&
            e.target !== historyBtn &&
            !historyBtn.contains(e.target)) {
            historySidebar.classList.remove('active');
        }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+S or Cmd+S: Download
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadBtn.click();
        }

        // Ctrl+O or Cmd+O: Upload
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            uploadBtn.click();
        }

        // Ctrl+H or Cmd+H: Toggle History
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            historyBtn.click();
        }
    });

    // Auto-save to history after running code
    const originalRunBtnHandler = runBtn.onclick || runBtn.addEventListener;
    runBtn.addEventListener('click', () => {
        const code = editor.getValue();
        const language = languageSelect.value;
        saveToHistory(code, language);
    });

    // Initialize history on load
    renderHistory();

    // ===== SETTINGS MANAGEMENT =====

    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsBtn = document.getElementById('close-settings');

    // Settings elements
    const fontSizeSelect = document.getElementById('font-size');
    const tabSizeSelect = document.getElementById('tab-size');
    const minimapToggle = document.getElementById('minimap-toggle');
    const lineNumbersToggle = document.getElementById('line-numbers-toggle');

    // Load settings from localStorage
    function loadSettings() {
        const fontSize = localStorage.getItem('editorFontSize') || '14';
        const tabSize = localStorage.getItem('editorTabSize') || '4';
        const showMinimap = localStorage.getItem('editorMinimap') !== 'false';
        const showLineNumbers = localStorage.getItem('editorLineNumbers') !== 'false';

        return { fontSize, tabSize, showMinimap, showLineNumbers };
    }

    // Apply settings
    function applySettings(settings) {
        if (editor) {
            // Update editor options
            editor.updateOptions({
                fontSize: parseInt(settings.fontSize),
                tabSize: parseInt(settings.tabSize),
                minimap: { enabled: settings.showMinimap, maxColumn: 80 },
                lineNumbers: settings.showLineNumbers ? 'on' : 'off'
            });
        }

        // Update UI controls
        fontSizeSelect.value = settings.fontSize;
        tabSizeSelect.value = settings.tabSize;
        minimapToggle.checked = settings.showMinimap;
        lineNumbersToggle.checked = settings.showLineNumbers;
    }

    // Save settings to localStorage
    function saveSettings(key, value) {
        localStorage.setItem(key, value);
    }

    // Font size change
    fontSizeSelect.addEventListener('change', (e) => {
        saveSettings('editorFontSize', e.target.value);
        if (editor) {
            editor.updateOptions({ fontSize: parseInt(e.target.value) });
        }
    });

    // Tab size change
    tabSizeSelect.addEventListener('change', (e) => {
        saveSettings('editorTabSize', e.target.value);
        if (editor) {
            editor.updateOptions({ tabSize: parseInt(e.target.value) });
        }
    });

    // Minimap toggle
    minimapToggle.addEventListener('change', (e) => {
        saveSettings('editorMinimap', e.target.checked);
        if (editor) {
            editor.updateOptions({
                minimap: { enabled: e.target.checked, maxColumn: 80 }
            });
        }
    });

    // Line numbers toggle
    lineNumbersToggle.addEventListener('change', (e) => {
        saveSettings('editorLineNumbers', e.target.checked);
        if (editor) {
            editor.updateOptions({
                lineNumbers: e.target.checked ? 'on' : 'off'
            });
        }
    });

    // Settings panel toggle
    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('active');
        // Close history if open
        if (historySidebar.classList.contains('active')) {
            historySidebar.classList.remove('active');
        }
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('active');
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (settingsPanel.classList.contains('active') &&
            !settingsPanel.contains(e.target) &&
            e.target !== settingsBtn &&
            !settingsBtn.contains(e.target)) {
            settingsPanel.classList.remove('active');
        }
    });

    // Apply saved settings on load
    const savedSettings = loadSettings();
    applySettings(savedSettings);

    // Keyboard shortcut for settings
    document.addEventListener('keydown', (e) => {
        // Ctrl+Comma: Open settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            settingsBtn.click();
        }
    });
});

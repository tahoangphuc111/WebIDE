document.addEventListener('DOMContentLoaded', () => {
    // defaults (fallback if not provided/empty, though view typically provides python)
    let defaultCode = {
        'python': 'print("Hello, World!")\n'
    };

    if (window.initialData && window.initialData.snippets) {
        defaultCode = window.initialData.snippets;
    }

    let editor;

    // Initialize Monaco Editor
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
            fontFamily: 'Fira Code',
            fontSize: 14,
            minimap: { enabled: false }
        });
    });

    const languageSelect = document.getElementById('language-select');
    const runBtn = document.getElementById('run-btn');
    const findBtn = document.getElementById('find-btn');
    const shareBtn = document.getElementById('share-btn');
    const outputArea = document.getElementById('output-area');
    const inputArea = document.getElementById('input-area');

    // Language Change
    languageSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model, lang);
        editor.setValue(defaultCode[lang]);
    });

    // Find Button
    if (findBtn) {
        findBtn.addEventListener('click', () => {
            editor.trigger('source', 'actions.find');
        });
    }

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

    // Share Code
    shareBtn.addEventListener('click', async () => {
        shareBtn.disabled = true;
        shareBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        const csrftoken = getCookie('csrftoken');
        const code = editor.getValue();
        const language = languageSelect.value;

        try {
            const response = await fetch('/share/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({ code, language })
            });

            const data = await response.json();

            if (data.id) {
                const url = `${window.location.origin}/share/${data.id}/`;
                prompt("Copy this URL to share:", url);
            } else {
                alert('Failed to save snippet: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Network Error: ' + error.message);
        } finally {
            shareBtn.disabled = false;
            shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Share';
        }
    });
});

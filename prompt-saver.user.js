// ==UserScript==
// @name         Floating Prompt Saver
// @namespace    prompt-saver
// @version      1.0
// @description  Floating panel for saving and viewing texts on 127.0.0.1
// @author       otacoo
// @license      GPLv3; https://github.com/otacoo/prompt-saver/blob/main/LICENSE 
// @match        *://127.0.0.1:*/
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.listValues
// @grant        GM.deleteValue
// ==/UserScript==

(function () {
    'use strict';

    // --- Styles ---
    const style = document.createElement('style');
    style.textContent = `
    :root {
        --ps-bg: #fff;
        --ps-fg: #222;
        --ps-border: #ddd;
        --ps-tab-bg: #f0f0f0;
        --ps-tab-active-bg: #e0e0e0;
        --ps-tab-fg: #888;
        --ps-tab-active-fg: #333;
        --ps-btn-bg: #1976d2;
        --ps-btn-fg: #fff;
        --ps-btn-green: #43a047;
        --ps-btn-black: #111;
        --ps-btn-black-fg: #fff;
        --ps-btn-clear-bg: #444;
        --ps-btn-clear-fg: #eee;
        --ps-list-bg: #f0f0f0;
        --ps-list-del: #d32f2f;
        --ps-shadow: 0 2px 12px rgba(0,0,0,0.12);
    }
    [data-ps-theme="dark"] {
        --ps-bg: #23272e;
        --ps-fg: #f1f1f1;
        --ps-border: #444;
        --ps-tab-bg: #23272e;
        --ps-tab-active-bg: #2c313a;
        --ps-tab-fg: #aaa;
        --ps-tab-active-fg: #fff;
        --ps-btn-bg: #1976d2;
        --ps-btn-fg: #fff;
        --ps-btn-green: #43a047;
        --ps-btn-black: #111;
        --ps-btn-black-fg: #fff;
        --ps-btn-clear-bg: #eee;
        --ps-btn-clear-fg: #333;
        --ps-list-bg: #2c313a;
        --ps-list-del: #ff6b6b;
        --ps-shadow: 0 2px 12px rgba(0,0,0,0.6);
    }
    @media (prefers-color-scheme: dark) {
        :root:not([data-ps-theme]) {
            --ps-bg: #23272e;
            --ps-fg: #f1f1f1;
            --ps-border: #444;
            --ps-tab-bg: #23272e;
            --ps-tab-active-bg: #2c313a;
            --ps-tab-fg: #aaa;
            --ps-tab-active-fg: #fff;
            --ps-btn-bg: #1976d2;
            --ps-btn-fg: #fff;
            --ps-btn-green: #43a047;
            --ps-btn-black: #111;
            --ps-btn-black-fg: #fff;
            --ps-btn-clear-bg: #444;
            --ps-btn-clear-fg: #eee;
            --ps-list-bg: #2c313a;
            --ps-list-del: #ff6b6b;
            --ps-shadow: 0 2px 12px rgba(0,0,0,0.6);
        }
    }
    #ps-floating-panel {
        position: fixed;
        top: -900px;
        right: 20px;
        width: 35vw;
        min-height: 28vh;
        background: var(--ps-bg);
        color: var(--ps-fg);
        box-shadow: var(--ps-shadow);
        border-radius: 8px;
        z-index: 99999;
        transition: top 0.3s, height 0.1s;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        overflow: hidden;
        font-family: sans-serif;
        max-height: 70vh;
    }
    #ps-floating-panel.ps-visible {
        top: 20px;
    }
    #ps-tabs {
        width: 48px;
        background: var(--ps-tab-bg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        border-right: 1px solid var(--ps-border);
        padding: 16px 0 0 0;
    }
    .ps-tabs-top {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .ps-tabs-bottom {
        display: flex;
        flex-direction: column;
        margin-bottom: 0;
    }
    #ps-theme-btn {
        margin-bottom: 0;
    }
    .ps-tab-btn {
        width: 32px;
        height: 32px;
        margin-bottom: 12px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 20px;
        color: var(--ps-tab-fg);
        border-radius: 6px;
        transition: background 0.2s, color 0.2s;
    }
    .ps-tab-btn.ps-active {
        background: var(--ps-tab-active-bg);
        color: var(--ps-tab-active-fg);
    }
    #ps-theme-btn {
        width: 32px;
        height: 32px;
        margin-bottom: 25px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 20px;
        color: var(--ps-tab-fg);
        border-radius: 6px;
        transition: background 0.2s, color 0.2s;
        box-sizing: border-box;
        display: block;
    }
    #ps-tab-content {
        flex: 1 1 0; 
        min-height: 0; 
        display: flex; 
        flex-direction: column;
        padding: 18px 18px 18px 18px;
        overflow-y: auto;
    }
    #ps-input-area textarea {
        width: 100%;
        min-height: 20vh;
        height: auto;
        resize: none;
        font-size: 15px;
        padding: 6px;
        border-radius: 4px;
        border: 1px solid var(--ps-border);
        margin-bottom: 10px;
        overflow: hidden;
        box-sizing: border-box;
        transition: height 0.1s;
        background: var(--ps-bg);
        color: var(--ps-fg);
    }
    #ps-input-area button {
        padding: 6px 16px;
        font-size: 15px;
        border-radius: 4px;
        border: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        margin-bottom: 4px;
        margin-right: 4px;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        cursor: pointer;
        outline: none;
        vertical-align: middle;
        display: inline-block;
    }
    #ps-save-btn {
        background: var(--ps-btn-bg);
        color: var(--ps-btn-fg);
    }
    #ps-save-btn.ps-saved {
        background: var(--ps-btn-green) !important;
    }
    #ps-save-btn:hover, #ps-save-btn:focus {
        background: #1251a3;
    }
    #ps-save-artists-btn {
        background: var(--ps-btn-black);
        color: var(--ps-btn-black-fg);
    }
    #ps-save-artists-btn.ps-saved {
        background: var(--ps-btn-green) !important;
        color: var(--ps-btn-fg) !important;
    }
    #ps-save-artists-btn:hover, #ps-save-artists-btn:focus {
        background: #333;
    }
    #ps-copy-prompt-btn {
        background: var(--ps-btn-green);
        color: var(--ps-btn-fg);
        margin-left: 0;
    }
    #ps-copy-prompt-btn:hover, #ps-copy-prompt-btn:focus {
        background: #2e7031;
    }
    #ps-clear-btn {
        background: var(--ps-btn-clear-bg);
        color: var(--ps-btn-clear-fg);
        margin-left: 0;
    }
    #ps-clear-btn:hover, #ps-clear-btn:focus {
        background: #ccc;
    }
    #ps-list-area,
    #ps-artists-area {
        overflow-y: auto;
    }
    #ps-list-area ul,
    #ps-artists-area ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    #ps-list-area li,
    #ps-artists-area li {
        background: var(--ps-list-bg);
        margin-bottom: 8px;
        padding: 8px 10px;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
    }
    .ps-list-btns {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        margin-left: 8px;
    }
    #ps-list-area .ps-copy-btn,
    #ps-artists-area .ps-copy-btn {
        background: none;
        border: none;
        color: #1976d2;
        font-size: 16px;
        cursor: pointer;
        margin-bottom: 15px;
        padding: 3px;
        border-radius: 3px;
        transition: background 0.15s;
    }
    #ps-list-area .ps-copy-btn:hover,
    #ps-artists-area .ps-copy-btn:hover {
        background: #e3eaff;
    }
    #ps-list-area .ps-delete-btn,
    #ps-artists-area .ps-delete-btn {
        background: none;
        border: none;
        color: var(--ps-list-del);
        font-size: 16px;
        cursor: pointer;
        margin-left: 0;
        padding: 3px;
        border-radius: 3px;
        transition: background 0.15s;
    }
    #ps-list-area .ps-delete-btn:hover,
    #ps-artists-area .ps-delete-btn:hover {
        background: #ffeaea;
    }
    `;
    document.head.appendChild(style);

    // --- Panel HTML ---
    const panel = document.createElement('div');
    panel.id = 'ps-floating-panel';
    panel.innerHTML = `
      <div id="ps-tabs">
        <div class="ps-tabs-top">
          <button class="ps-tab-btn ps-active" data-tab="input" title="Input">✏️</button>
          <button class="ps-tab-btn" data-tab="list" title="Saved Prompts">📄</button>
          <button class="ps-tab-btn" data-tab="artists" title="Artists">🎨</button>
        </div>
        <div class="ps-tabs-bottom">
          <button id="ps-theme-btn" title="Toggle theme">🌙</button>
        </div>
      </div>
      <div id="ps-tab-content">
        <div id="ps-input-area">
          <textarea placeholder="Enter your text..."></textarea>
          <button id="ps-save-btn" title="Save the text">Save</button>
          <button id="ps-save-artists-btn" title="Save as Artists">Save as Artists</button>
          <button id="ps-copy-prompt-btn" title="Copy the positive prompt">Copy Prompt</button>
          <button id="ps-clear-btn" title="Clear the text area">Clear</button>
        </div>
        <div id="ps-list-area" style="display:none">
          <ul></ul>
        </div>
        <div id="ps-artists-area" style="display:none">
          <ul></ul>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    // --- Theme logic ---
    const themeBtn = panel.querySelector('#ps-theme-btn');
    async function getTheme() {
        // Prefer GM storage, fallback to attribute
        return (await GM.getValue('ps_theme', null)) || document.documentElement.getAttribute('data-ps-theme');
    }
    async function setTheme(theme) {
        if (theme) {
            document.documentElement.setAttribute('data-ps-theme', theme);
            await GM.setValue('ps_theme', theme);
        } else {
            document.documentElement.removeAttribute('data-ps-theme');
            await GM.setValue('ps_theme', '');
        }
        const isDark = (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches));
        themeBtn.textContent = isDark ? '☀️' : '🌙';
    }
    themeBtn.addEventListener('click', async () => {
        const current = await GM.getValue('ps_theme', null);
        if (current === 'dark') await setTheme('light');
        else if (current === 'light') await setTheme(null); // system
        else await setTheme('dark');
    });
    // On load, apply saved theme
    (async () => { await setTheme(await GM.getValue('ps_theme', null)); })();

    // --- Show/hide logic ---
    let panelVisible = false;
    let mouseOverPanel = false;
    let textareaFocused = false;
    let hideTimeout = null;
    function showPanel() {
        if (!panelVisible) {
            panel.classList.add('ps-visible');
            panelVisible = true;
        }
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }
    function hidePanelImmediately() {
        if (panelVisible) {
            panel.classList.remove('ps-visible');
            panelVisible = false;
        }
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }
    function scheduleHidePanel() {
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (!textareaFocused) {
                panel.classList.remove('ps-visible');
                panelVisible = false;
            }
            hideTimeout = null;
        }, 4000); // 4 seconds to hide
    }
    // Hide panel if clicking outside
    document.addEventListener('mousedown', function(e) {
        if (panelVisible && !panel.contains(e.target)) {
            hidePanelImmediately();
        }
    });
    let lastMouseX = 0, lastMouseY = 0;
    document.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (e.clientY < 40 && e.clientX > window.innerWidth - 200) {
            showPanel();
        } else if (!mouseOverPanel && !textareaFocused) {
            if (panelVisible) {
                scheduleHidePanel();
            }
        }
    });
    // Hide panel on resize/orientationchange if mouse is not in activation area
    function checkPanelHideOnResize() {
        if (panelVisible && !mouseOverPanel && !textareaFocused) {
            if (!(lastMouseY < 40 && lastMouseX > window.innerWidth - 200)) {
                panel.classList.remove('ps-visible');
                panelVisible = false;
            }
        }
    }
    window.addEventListener('resize', checkPanelHideOnResize);
    window.addEventListener('orientationchange', checkPanelHideOnResize);
    window.addEventListener('scroll', checkPanelHideOnResize);
    panel.addEventListener('mouseenter', () => {
        mouseOverPanel = true;
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    });
    panel.addEventListener('mouseleave', () => {
        mouseOverPanel = false;
        if (panelVisible && !textareaFocused) {
            scheduleHidePanel();
        }
    });

    // --- Tab logic ---
    const tabBtns = panel.querySelectorAll('.ps-tab-btn');
    const inputArea = panel.querySelector('#ps-input-area');
    const listArea = panel.querySelector('#ps-list-area');
    const artistsArea = panel.querySelector('#ps-artists-area');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('ps-active'));
            btn.classList.add('ps-active');
            if (btn.dataset.tab === 'input') {
                inputArea.style.display = '';
                listArea.style.display = 'none';
                artistsArea.style.display = 'none';
            } else if (btn.dataset.tab === 'list') {
                inputArea.style.display = 'none';
                listArea.style.display = '';
                artistsArea.style.display = 'none';
                renderList();
            } else if (btn.dataset.tab === 'artists') {
                inputArea.style.display = 'none';
                listArea.style.display = 'none';
                artistsArea.style.display = '';
                renderArtistsList();
            }
        });
    });

    // --- Storage helpers ---
    async function saveText(text) {
        let arr = await GM.getValue('ps_texts', []);
        arr.unshift({ text, time: Date.now() }); // Add to start
        await GM.setValue('ps_texts', arr);
    }
    async function getTexts() {
        return await GM.getValue('ps_texts', []);
    }
    async function deleteText(idx) {
        let arr = await GM.getValue('ps_texts', []);
        arr.splice(idx, 1);
        await GM.setValue('ps_texts', arr);
    }
    // --- Artists storage helpers ---
    async function saveArtist(text) {
        let arr = await GM.getValue('ps_artists', []);
        arr.unshift({ text, time: Date.now() });
        await GM.setValue('ps_artists', arr);
    }
    async function getArtists() {
        return await GM.getValue('ps_artists', []);
    }
    async function deleteArtist(idx) {
        let arr = await GM.getValue('ps_artists', []);
        arr.splice(idx, 1);
        await GM.setValue('ps_artists', arr);
    }

    // --- Save button ---
    const psTextarea = panel.querySelector('#ps-input-area textarea');
    // --- Prevent close when textarea focused ---
    psTextarea.addEventListener('focus', () => {
        textareaFocused = true;
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    });
    psTextarea.addEventListener('blur', () => {
        textareaFocused = false;
        if (panelVisible && !mouseOverPanel) {
            scheduleHidePanel();
        }
    });
    // --- Auto-resize textarea ---
    function autoResizeTextarea() {
        psTextarea.style.height = 'auto';
        psTextarea.style.height = (psTextarea.scrollHeight) + 'px';
        // No panel.style.height here! Let CSS handle panel height.
    }
    psTextarea.addEventListener('input', autoResizeTextarea);
    // Initial resize
    autoResizeTextarea();

    const saveBtn = panel.querySelector('#ps-save-btn');
    panel.querySelector('#ps-save-btn').addEventListener('click', async () => {
        const val = psTextarea.value.trim();
        if (val) {
            await saveText(val);
            psTextarea.value = '';
            autoResizeTextarea();
            // Visual feedback
            const originalText = saveBtn.textContent;
            const originalBg = saveBtn.style.background;
            saveBtn.textContent = 'SAVED !';
            saveBtn.style.background = 'var(--ps-btn-green)';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = originalBg;
            }, 1500);
        }
    });
    // --- Save as Artists button ---
    const saveArtistsBtn = panel.querySelector('#ps-save-artists-btn');
    saveArtistsBtn.addEventListener('click', async () => {
        const val = psTextarea.value.trim();
        if (val) {
            await saveArtist(val);
            psTextarea.value = '';
            autoResizeTextarea();
            // Visual feedback
            const originalText = saveArtistsBtn.textContent;
            const originalBg = saveArtistsBtn.style.background;
            saveArtistsBtn.textContent = 'SAVED !';
            saveArtistsBtn.style.background = 'var(--ps-btn-green)';
            saveArtistsBtn.style.color = 'var(--ps-btn-fg)';
            setTimeout(() => {
                saveArtistsBtn.textContent = originalText;
                saveArtistsBtn.style.background = originalBg;
                saveArtistsBtn.style.color = '';
            }, 1500);
        }
    });
    // --- Copy Prompt button ---
    panel.querySelector('#ps-copy-prompt-btn').addEventListener('click', () => {
        let extPrompt = document.querySelector('#txt2img_prompt textarea');
        if (!extPrompt) {
            extPrompt = document.querySelector('#txt2img_prompt [contenteditable="true"]');
        }
        if (extPrompt) {
            psTextarea.value = extPrompt.value !== undefined ? extPrompt.value : extPrompt.textContent;
            autoResizeTextarea();
        } else {
            alert('Positive prompt textarea not found!');
        }
    });
    // --- Clear button ---
    panel.querySelector('#ps-clear-btn').addEventListener('click', () => {
        psTextarea.value = '';
        autoResizeTextarea();
    });

    // --- Render list ---
    async function renderList() {
        const ul = panel.querySelector('#ps-list-area ul');
        ul.innerHTML = '';
        const arr = await getTexts();
        arr.forEach((item, idx) => {
            const li = document.createElement('li');
            // Text content
            const span = document.createElement('span');
            span.textContent = item.text;
            span.style.wordBreak = 'break-word';
            li.appendChild(span);
            // Buttons
            const btns = document.createElement('div');
            btns.className = 'ps-list-btns';
            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋';
            copyBtn.className = 'ps-copy-btn';
            copyBtn.title = 'Copy';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(item.text);
                copyBtn.textContent = '✅';
                setTimeout(() => { copyBtn.textContent = '📋'; }, 1000);
            };
            btns.appendChild(copyBtn);
            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = '🗑️';
            delBtn.className = 'ps-delete-btn';
            delBtn.title = 'Delete';
            delBtn.onclick = async () => {
                await deleteText(idx);
                renderList();
            };
            btns.appendChild(delBtn);
            li.appendChild(btns);
            ul.appendChild(li);
        });
    }
    // --- Render artists list ---
    async function renderArtistsList() {
        const ul = panel.querySelector('#ps-artists-area ul');
        ul.innerHTML = '';
        const arr = await getArtists();
        arr.forEach((item, idx) => {
            const li = document.createElement('li');
            // Text content
            const span = document.createElement('span');
            span.textContent = item.text;
            span.style.wordBreak = 'break-word';
            li.appendChild(span);
            // Buttons (identical to #ps-list-area)
            const btns = document.createElement('div');
            btns.className = 'ps-list-btns';
            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋';
            copyBtn.className = 'ps-copy-btn';
            copyBtn.title = 'Copy';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(item.text);
                copyBtn.textContent = '✅';
                setTimeout(() => { copyBtn.textContent = '📋'; }, 1000);
            };
            btns.appendChild(copyBtn);
            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = '🗑️';
            delBtn.className = 'ps-delete-btn';
            delBtn.title = 'Delete';
            delBtn.onclick = async () => {
                await deleteArtist(idx);
                renderArtistsList();
            };
            btns.appendChild(delBtn);
            li.appendChild(btns);
            ul.appendChild(li);
        });
    }

})();

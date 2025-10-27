const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadStatus = document.getElementById('uploadStatus');
const statusMessage = document.getElementById('statusMessage');
const progressFill = document.getElementById('progressFill');
const resultsSection = document.getElementById('resultsSection');
const jsonTree = document.getElementById('jsonTree');

let currentJsonData = null;

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFile(files[0]);
});

// File Input Change
fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

// Handle File Upload
async function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
    }

    // Show upload status
    uploadStatus.classList.remove('hidden');
    statusMessage.textContent = '📤 Uploading...';
    progressFill.style.width = '20%';

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);

        // Upload to API
        const response = await fetch('http://localhost:8000/upload/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        progressFill.style.width = '60%';
        statusMessage.textContent = '⚙️ Processing...';

        const data = await response.json();
        currentJsonData = data;

        progressFill.style.width = '100%';
        statusMessage.textContent = '✅ Done!';

        // Show results after 500ms
        setTimeout(() => {
            displayResults(data);
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        statusMessage.textContent = `❌ Error: ${error.message}`;
        statusMessage.style.color = '#ef4444';
    }
}

// Display Results
function displayResults(data) {
    // Try to parse the LLM response if it's a string
    let resumeData = data.resume_data || {};
    
    if (typeof data.llm_response === 'string') {
        try {
            // Clean markdown code blocks
            let cleaned = data.llm_response;
            cleaned = cleaned.replace(/```/g, '');
            cleaned = cleaned.replace(/json/g, '');
            resumeData = JSON.parse(cleaned);
        } catch (e) {
            console.warn('Could not parse LLM response as JSON');
            console.log('Raw response:', data.llm_response);
        }
    }

    // Render JSON tree
    renderJsonTree(resumeData, jsonTree);

    // Show results section
    resultsSection.classList.remove('hidden');
    uploadStatus.classList.add('hidden');
}


// Render JSON Tree (Interactive)
function renderJsonTree(data, container, depth = 0) {
    container.innerHTML = '';
    const id = Math.random().toString(36).substr(2, 9);
    
    if (Array.isArray(data)) {
        renderArray(data, container, id, depth);
    } else if (typeof data === 'object' && data !== null) {
        renderObject(data, container, id, depth);
    } else {
        container.innerHTML = formatValue(data);
    }
}

function renderObject(obj, container, parentId, depth) {
    const keys = Object.keys(obj);
    
    if (keys.length === 0) {
        container.textContent = '{}';
        return;
    }

    const toggleId = `toggle-${parentId}`;
    
    // Create collapsible header
    const header = document.createElement('div');
    header.className = 'json-item';
    header.innerHTML = `
        <span class="json-toggle" onclick="toggleNode('${toggleId}')">${depth === 0 ? '▼' : '▼'} {</span>
    `;

    container.appendChild(header);

    // Create collapsible content
    const content = document.createElement('div');
    content.id = toggleId;
    content.className = 'json-collapsed' + (depth === 0 ? '' : ' json-collapsed');

    keys.forEach((key, index) => {
        const value = obj[key];
        const item = document.createElement('div');
        item.className = 'json-item';

        if (typeof value === 'object' && value !== null && (Array.isArray(value) || Object.keys(value).length > 0)) {
            const subToggleId = `toggle-${key}-${parentId}`;
            item.innerHTML = `<span class="json-toggle" onclick="toggleNode('${subToggleId}')">${Array.isArray(value) ? '▼' : '▼'}</span><span class="json-key">"${key}"</span>: <span class="json-toggle" style="margin-left: 5px;" onclick="toggleNode('${subToggleId}')">${Array.isArray(value) ? '[' : '{'}</span>`;
            
            const subContent = document.createElement('div');
            subContent.id = subToggleId;
            subContent.className = 'json-collapsed';
            
            if (Array.isArray(value)) {
                renderArray(value, subContent, subToggleId, depth + 1);
            } else {
                renderObject(value, subContent, subToggleId, depth + 1);
            }
            
            item.appendChild(subContent);
        } else {
            item.innerHTML = `<span class="json-key">"${key}"</span>: ${formatValue(value)}${index < keys.length - 1 ? ',' : ''}`;
        }

        content.appendChild(item);
    });

    const closing = document.createElement('div');
    closing.className = 'json-item';
    closing.innerHTML = `<span>}</span>`;
    content.appendChild(closing);

    container.appendChild(content);
}

function renderArray(arr, container, parentId, depth) {
    if (arr.length === 0) {
        container.textContent = '[]';
        return;
    }

    const header = document.createElement('div');
    header.className = 'json-item';
    header.innerHTML = `<span class="json-toggle" onclick="toggleNode('array-${parentId}')">${depth === 0 ? '▼' : '▼'} [</span>`;
    container.appendChild(header);

    const content = document.createElement('div');
    content.id = `array-${parentId}`;
    content.className = 'json-collapsed' + (depth === 0 ? '' : ' json-collapsed');

    arr.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'json-item';

        if (typeof item === 'object' && item !== null) {
            const subToggleId = `item-${index}-${parentId}`;
            itemDiv.innerHTML = `<span class="json-toggle" onclick="toggleNode('${subToggleId}')">${Array.isArray(item) ? '▼' : '▼'} ${Array.isArray(item) ? '[' : '{'}</span>`;
            
            const subContent = document.createElement('div');
            subContent.id = subToggleId;
            subContent.className = 'json-collapsed';
            
            if (Array.isArray(item)) {
                renderArray(item, subContent, subToggleId, depth + 1);
            } else {
                renderObject(item, subContent, subToggleId, depth + 1);
            }
            
            itemDiv.appendChild(subContent);
        } else {
            itemDiv.innerHTML = `${formatValue(item)}${index < arr.length - 1 ? ',' : ''}`;
        }

        content.appendChild(itemDiv);
    });

    const closing = document.createElement('div');
    closing.className = 'json-item';
    closing.innerHTML = `<span>]</span>`;
    content.appendChild(closing);

    container.appendChild(content);
}

function formatValue(value) {
    if (value === null) {
        return '<span class="json-null">null</span>';
    }
    if (typeof value === 'string') {
        return `<span class="json-string">"${value}"</span>`;
    }
    if (typeof value === 'number') {
        return `<span class="json-number">${value}</span>`;
    }
    if (typeof value === 'boolean') {
        return `<span class="json-boolean">${value}</span>`;
    }
    return String(value);
}

// Toggle Collapse/Expand
function toggleNode(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle('json-collapsed');
    }
}

// Download JSON
function downloadJSON() {
    if (!currentJsonData) return;

    const dataStr = JSON.stringify(currentJsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Reset Upload
function resetUpload() {
    fileInput.value = '';
    uploadStatus.classList.add('hidden');
    resultsSection.classList.add('hidden');
    currentJsonData = null;
    dropZone.classList.remove('dragover');
}

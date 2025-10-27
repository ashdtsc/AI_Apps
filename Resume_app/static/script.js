// DOM Elements - Resume
const resumeDropZone = document.getElementById('resumeDropZone');
const resumeFileInput = document.getElementById('resumeFileInput');
const resumeUrlInput = document.getElementById('resumeUrlInput');
const resumeStatus = document.getElementById('resumeStatus');
const resumeStatusMessage = document.getElementById('resumeStatusMessage');
const resumeProgressFill = document.getElementById('resumeProgressFill');

// DOM Elements - Job Description
const jobDropZone = document.getElementById('jobDropZone');
const jobFileInput = document.getElementById('jobFileInput');
const jobUrlInput = document.getElementById('jobUrlInput');
const jobStatus = document.getElementById('jobStatus');
const jobStatusMessage = document.getElementById('jobStatusMessage');
const jobProgressFill = document.getElementById('jobProgressFill');

// DOM Elements - Analysis
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const jsonTree = document.getElementById('jsonTree');

// State
let resumeData = null;
let jobData = null;
let currentJsonData = null;

// ===== RESUME UPLOAD HANDLERS =====

// Resume Drag and Drop
resumeDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    resumeDropZone.classList.add('dragover');
});

resumeDropZone.addEventListener('dragleave', () => {
    resumeDropZone.classList.remove('dragover');
});

resumeDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    resumeDropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleResumeFile(files[0]);
});

// Resume File Input Change
resumeFileInput.addEventListener('change', (e) => {
    handleResumeFile(e.target.files[0]);
});

// Resume URL Input Change
resumeUrlInput.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
        handleResumeUrl(e.target.value.trim());
    }
});

// ===== JOB DESCRIPTION UPLOAD HANDLERS =====

// Job Drag and Drop
jobDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    jobDropZone.classList.add('dragover');
});

jobDropZone.addEventListener('dragleave', () => {
    jobDropZone.classList.remove('dragover');
});

jobDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    jobDropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleJobFile(files[0]);
});

// Job File Input Change
jobFileInput.addEventListener('change', (e) => {
    handleJobFile(e.target.files[0]);
});

// Job URL Input Change
jobUrlInput.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
        handleJobUrl(e.target.value.trim());
    }
});

// ===== FILE HANDLING FUNCTIONS =====

async function handleResumeFile(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file for the resume');
        return;
    }

    resumeStatus.classList.remove('hidden');
    resumeStatusMessage.textContent = '✅ Resume file selected';
    resumeProgressFill.style.width = '100%';

    resumeData = { type: 'file', file: file };
    resumeUrlInput.value = '';
    checkBothUploaded();
}

async function handleJobFile(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file for the job description');
        return;
    }

    jobStatus.classList.remove('hidden');
    jobStatusMessage.textContent = '✅ Job description file selected';
    jobProgressFill.style.width = '100%';

    jobData = { type: 'file', file: file };
    jobUrlInput.value = '';
    checkBothUploaded();
}

function handleResumeUrl(url) {
    // Basic URL validation
    if (!isValidUrl(url)) {
        resumeStatusMessage.textContent = '❌ Invalid URL';
        resumeStatusMessage.style.color = '#ef4444';
        return;
    }

    resumeStatus.classList.remove('hidden');
    resumeStatusMessage.textContent = '✅ Resume URL provided';
    resumeStatusMessage.style.color = '#10b981';
    resumeProgressFill.style.width = '100%';

    resumeData = { type: 'url', url: url };
    resumeFileInput.value = '';
    checkBothUploaded();
}

function handleJobUrl(url) {
    // Basic URL validation
    if (!isValidUrl(url)) {
        jobStatusMessage.textContent = '❌ Invalid URL';
        jobStatusMessage.style.color = '#ef4444';
        return;
    }

    jobStatus.classList.remove('hidden');
    jobStatusMessage.textContent = '✅ Job URL provided';
    jobStatusMessage.style.color = '#10b981';
    jobProgressFill.style.width = '100%';

    jobData = { type: 'url', url: url };
    jobFileInput.value = '';
    checkBothUploaded();
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function checkBothUploaded() {
    if (resumeData && jobData) {
        analyzeBtn.classList.remove('hidden');
    }
}

// ===== ANALYSIS FUNCTION =====

async function analyzeMatch() {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing...';

    try {
        // Create FormData
        const formData = new FormData();

        // Add resume data
        if (resumeData.type === 'file') {
            formData.append('resume_file', resumeData.file);
        } else {
            formData.append('resume_url', resumeData.url);
        }

        // Add job data
        if (jobData.type === 'file') {
            formData.append('job_file', jobData.file);
        } else {
            formData.append('job_url', jobData.url);
        }

        // Call API (update this endpoint based on your backend)
        const response = await fetch('http://localhost:8000/analyze/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Analysis failed: ${response.status}`);
        }

        const data = await response.json();
        currentJsonData = data;

        // Display results
        displayResults(data);

    } catch (error) {
        console.error('Error:', error);
        alert(`Error during analysis: ${error.message}`);
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<span>🔍 Analyze Fitment</span>';
    }
}

// ===== RESULTS DISPLAY FUNCTION =====

function displayResults(data) {
    // Parse the fitment scores from the response
    let scores = {
        overall: 0,
        skills: 0,
        experience: 0,
        education: 0,
        keywords: 0
    };

    // Try to extract scores from the response
    // This assumes your backend will return a structure with scores
    if (data.fitment_scores) {
        scores = { ...scores, ...data.fitment_scores };
    } else if (data.llm_response) {
        // Try to parse from LLM response
        try {
            let parsed = typeof data.llm_response === 'string' 
                ? JSON.parse(data.llm_response.replace(/```json|```/g, ''))
                : data.llm_response;

            if (parsed.fitment_scores) {
                scores = { ...scores, ...parsed.fitment_scores };
            }
        } catch (e) {
            console.warn('Could not parse fitment scores');
        }
    }

    // Update overall score
    updateOverallScore(scores.overall);

    // Update parameter scores
    updateParameterScore('skills', scores.skills);
    updateParameterScore('experience', scores.experience);
    updateParameterScore('education', scores.education);
    updateParameterScore('keywords', scores.keywords);

    // Render detailed JSON tree
    renderJsonTree(data, jsonTree);

    // Show results section
    resultsSection.classList.remove('hidden');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function updateOverallScore(score) {
    const scoreValue = document.getElementById('overallScoreValue');
    const scoreLabel = document.getElementById('overallScoreLabel');
    const scoreCircle = document.getElementById('overallScoreCircle');

    // Animate score
    let current = 0;
    const target = Math.round(score);
    const increment = target / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        scoreValue.textContent = Math.round(current);
    }, 20);

    // Update label based on score
    if (score >= 80) {
        scoreLabel.textContent = 'Excellent Match!';
    } else if (score >= 60) {
        scoreLabel.textContent = 'Good Match';
    } else if (score >= 40) {
        scoreLabel.textContent = 'Moderate Match';
    } else {
        scoreLabel.textContent = 'Needs Improvement';
    }
}

function updateParameterScore(parameter, score) {
    const bar = document.getElementById(`${parameter}Bar`);
    const scoreDisplay = document.getElementById(`${parameter}Score`);

    // Animate bar
    setTimeout(() => {
        bar.style.width = `${score}%`;
    }, 100);

    // Update score text
    scoreDisplay.textContent = `${Math.round(score)}%`;

    // Color based on score
    if (score >= 70) {
        bar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    } else if (score >= 40) {
        bar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
        bar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }
}

// ===== JSON TREE RENDERING (from original script) =====

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
    const header = document.createElement('div');
    header.className = 'json-item';
    header.innerHTML = `<span class="json-toggle" onclick="toggleNode('${toggleId}')">▼</span> {`;
    container.appendChild(header);

    const content = document.createElement('div');
    content.id = toggleId;
    content.className = depth === 0 ? '' : 'json-collapsed';

    keys.forEach((key, index) => {
        const value = obj[key];
        const item = document.createElement('div');
        item.className = 'json-item';

        if (typeof value === 'object' && value !== null) {
            const subToggleId = `toggle-${key}-${parentId}`;
            item.innerHTML = `<span class="json-toggle" onclick="toggleNode('${subToggleId}')">▼</span> <span class="json-key">"${key}"</span>: ${Array.isArray(value) ? '[' : '{'}`;

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
    closing.innerHTML = `}`;
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
    const toggleId = `array-${parentId}`;
    header.innerHTML = `<span class="json-toggle" onclick="toggleNode('${toggleId}')">▼</span> [`;
    container.appendChild(header);

    const content = document.createElement('div');
    content.id = toggleId;
    content.className = depth === 0 ? '' : 'json-collapsed';

    arr.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'json-item';

        if (typeof item === 'object' && item !== null) {
            const subToggleId = `item-${index}-${parentId}`;
            itemDiv.innerHTML = `<span class="json-toggle" onclick="toggleNode('${subToggleId}')">▼</span> ${Array.isArray(item) ? '[' : '{'}`;

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
    closing.innerHTML = `]`;
    content.appendChild(closing);

    container.appendChild(content);
}

function formatValue(value) {
    if (value === null) return '<span class="json-null">null</span>';
    if (typeof value === 'string') return `<span class="json-string">"${value}"</span>`;
    if (typeof value === 'number') return `<span class="json-number">${value}</span>`;
    if (typeof value === 'boolean') return `<span class="json-boolean">${value}</span>`;
    return String(value);
}

function toggleNode(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle('json-collapsed');
    }
}

// ===== UTILITY FUNCTIONS =====

function downloadJSON() {
    if (!currentJsonData) return;

    const dataStr = JSON.stringify(currentJsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitment-analysis-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function resetUpload() {
    // Clear all inputs
    resumeFileInput.value = '';
    resumeUrlInput.value = '';
    jobFileInput.value = '';
    jobUrlInput.value = '';

    // Reset states
    resumeData = null;
    jobData = null;
    currentJsonData = null;

    // Hide status and results
    resumeStatus.classList.add('hidden');
    jobStatus.classList.add('hidden');
    analyzeBtn.classList.add('hidden');
    resultsSection.classList.add('hidden');

    // Reset button
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<span>🔍 Analyze Fitment</span>';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
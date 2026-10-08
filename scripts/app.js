// Study Planner App - Main JavaScript

// Data Storage
const DATA_KEYS = {
    SESSIONS: 'studyPlanner_sessions',
    ASSIGNMENTS: 'studyPlanner_assignments'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadAndDisplayData();
    setDefaultDate();
});

// Initialize App
function initializeApp() {
    console.log('Study Planner App initialized');
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    // Forms
    document.getElementById('sessionForm').addEventListener('submit', addSession);
    document.getElementById('assignmentForm').addEventListener('submit', addAssignment);
    document.getElementById('quickAddForm').addEventListener('submit', addQuickSession);

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', filterAssignments);
    });
}

// Tab Switching
function switchTab(e) {
    const tabName = e.target.dataset.tab;
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    e.target.classList.add('active');
    
    // Refresh analytics when switching to analytics tab
    if (tabName === 'analytics') {
        displayAnalytics();
    }
}

// ===== STUDY SESSIONS =====

// Get all sessions from localStorage
function getSessions() {
    const data = localStorage.getItem(DATA_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
}

// Save sessions to localStorage
function saveSessions(sessions) {
    localStorage.setItem(DATA_KEYS.SESSIONS, JSON.stringify(sessions));
    updateDashboard();
}

// Add new session
function addSession(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const duration = parseInt(document.getElementById('duration').value);
    const date = document.getElementById('date').value;
    const notes = document.getElementById('notes').value;
    
    const session = {
        id: Date.now(),
        subject,
        duration,
        date,
        notes,
        createdAt: new Date().toISOString()
    };
    
    const sessions = getSessions();
    sessions.unshift(session);
    saveSessions(sessions);
    
    // Reset form
    document.getElementById('sessionForm').reset();
    
    // Refresh display
    displaySessions();
    showNotification('Session added successfully!', 'success');
}

// Add quick session from dashboard
function addQuickSession(e) {
    e.preventDefault();
    
    const subject = document.getElementById('quickSubject').value;
    const duration = parseInt(document.getElementById('quickDuration').value);
    const notes = document.getElementById('quickNotes').value;
    const date = new Date().toISOString().split('T')[0];
    
    const session = {
        id: Date.now(),
        subject,
        duration,
        date,
        notes,
        createdAt: new Date().toISOString()
    };
    
    const sessions = getSessions();
    sessions.unshift(session);
    saveSessions(sessions);
    
    // Reset form
    document.getElementById('quickAddForm').reset();
    
    // Refresh displays
    displaySessions();
    displayRecentSessions();
    updateDashboard();
    showNotification('Quick session added! Great job! 🎉', 'success');
}

// Display all sessions
function displaySessions() {
    const sessions = getSessions();
    const sessionsList = document.getElementById('sessionsList');
    
    if (sessions.length === 0) {
        sessionsList.innerHTML = '<p class="empty-state">No study sessions recorded yet.</p>';
        return;
    }
    
    sessionsList.innerHTML = sessions.map(session => `
        <div class="session-item">
            <div class="item-content">
                <div class="item-title">${escapeHtml(session.subject)}</div>
                <div class="item-meta">
                    <span>📅 ${formatDate(session.date)}</span>
                    <span>⏱️ ${session.duration} minutes</span>
                </div>
                ${session.notes ? `<div style="margin-top: 10px; color: var(--text-light);">${escapeHtml(session.notes)}</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteSession(${session.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Display recent sessions (dashboard)
function displayRecentSessions() {
    const sessions = getSessions().slice(0, 3);
    const recentList = document.getElementById('recentSessionsList');
    
    if (sessions.length === 0) {
        recentList.innerHTML = '<p class="empty-state">No study sessions yet. Start by adding one!</p>';
        return;
    }
    
    recentList.innerHTML = sessions.map(session => `
        <div class="session-item">
            <div class="item-content">
                <div class="item-title">${escapeHtml(session.subject)}</div>
                <div class="item-meta">
                    <span>📅 ${formatDate(session.date)}</span>
                    <span>⏱️ ${session.duration} min</span>
                </div>
            </div>
            <button class="btn btn-danger btn-small" onclick="deleteSession(${session.id})">Delete</button>
        </div>
    `).join('');
}

// Delete session
function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        const sessions = getSessions();
        const filtered = sessions.filter(s => s.id !== id);
        saveSessions(filtered);
        displaySessions();
        displayRecentSessions();
        showNotification('Session deleted', 'info');
    }
}

// ===== ASSIGNMENTS =====

// Get all assignments from localStorage
function getAssignments() {
    const data = localStorage.getItem(DATA_KEYS.ASSIGNMENTS);
    return data ? JSON.parse(data) : [];
}

// Save assignments to localStorage
function saveAssignments(assignments) {
    localStorage.setItem(DATA_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    updateDashboard();
}

// Add new assignment
function addAssignment(e) {
    e.preventDefault();
    
    const name = document.getElementById('assignmentName').value;
    const subject = document.getElementById('subject2').value;
    const deadline = document.getElementById('deadline').value;
    const description = document.getElementById('description').value;
    
    const assignment = {
        id: Date.now(),
        name,
        subject,
        deadline,
        description,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    const assignments = getAssignments();
    assignments.unshift(assignment);
    saveAssignments(assignments);
    
    // Reset form
    document.getElementById('assignmentForm').reset();
    
    // Refresh display
    displayAssignments();
    showNotification('Assignment added successfully!', 'success');
}

// Display assignments
function displayAssignments(filter = 'all') {
    const assignments = getAssignments();
    const assignmentsList = document.getElementById('assignmentsList');
    
    if (assignments.length === 0) {
        assignmentsList.innerHTML = '<p class="empty-state">No assignments added yet.</p>';
        return;
    }
    
    let filtered = assignments;
    
    if (filter === 'pending') {
        filtered = assignments.filter(a => !a.completed);
    } else if (filter === 'completed') {
        filtered = assignments.filter(a => a.completed);
    }
    
    if (filtered.length === 0) {
        assignmentsList.innerHTML = `<p class="empty-state">No ${filter} assignments.</p>`;
        return;
    }
    
    assignmentsList.innerHTML = filtered.map(assignment => {
        const status = getAssignmentStatus(assignment);
        
        return `
            <div class="assignment-item">
                <div class="item-content">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <input type="checkbox" ${assignment.completed ? 'checked' : ''} 
                               onchange="toggleAssignment(${assignment.id})" class="checkbox-large">
                        <div class="item-title">${escapeHtml(assignment.name)}</div>
                        <span class="assignment-status status-${status.type}">${status.label}</span>
                    </div>
                    <div class="item-meta">
                        <span>📚 ${escapeHtml(assignment.subject)}</span>
                        <span>📅 ${formatDate(assignment.deadline)}</span>
                    </div>
                    ${assignment.description ? `<div style="margin-top: 10px; color: var(--text-light);">${escapeHtml(assignment.description)}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" onclick="deleteAssignment(${assignment.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter assignments
function filterAssignments(e) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    const filter = e.target.dataset.filter;
    displayAssignments(filter);
}

// Toggle assignment completion
function toggleAssignment(id) {
    const assignments = getAssignments();
    const assignment = assignments.find(a => a.id === id);
    
    if (assignment) {
        assignment.completed = !assignment.completed;
        saveAssignments(assignments);
        displayAssignments();
        showNotification(assignment.completed ? 'Assignment marked as completed! 🎉' : 'Assignment marked as pending', 'success');
    }
}

// Delete assignment
function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        const assignments = getAssignments();
        const filtered = assignments.filter(a => a.id !== id);
        saveAssignments(filtered);
        displayAssignments();
        showNotification('Assignment deleted', 'info');
    }
}

// Get assignment status
function getAssignmentStatus(assignment) {
    if (assignment.completed) {
        return { type: 'completed', label: 'Completed' };
    }
    
    const deadline = new Date(assignment.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    
    if (deadline < today) {
        return { type: 'overdue', label: 'Overdue' };
    }
    
    return { type: 'pending', label: 'Pending' };
}

// Display upcoming deadlines
function displayUpcomingDeadlines() {
    const assignments = getAssignments()
        .filter(a => !a.completed)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);
    
    const upcomingList = document.getElementById('upcomingList');
    
    if (assignments.length === 0) {
        upcomingList.innerHTML = '<p class="empty-state">No pending assignments. Great job! 🎉</p>';
        return;
    }
    
    upcomingList.innerHTML = assignments.map(assignment => {
        const status = getAssignmentStatus(assignment);
        const daysLeft = getDaysUntilDeadline(assignment.deadline);
        
        return `
            <div class="deadline-item">
                <div class="item-content">
                    <div class="item-title">${escapeHtml(assignment.name)}</div>
                    <div class="item-meta">
                        <span>📚 ${escapeHtml(assignment.subject)}</span>
                        <span>📅 ${formatDate(assignment.deadline)}</span>
                        <span class="assignment-status status-${status.type}">${daysLeft < 0 ? 'Overdue' : daysLeft + ' days left'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== ANALYTICS =====

// Display analytics
function displayAnalytics() {
    displaySubjectAnalytics();
    displayStudyStatistics();
    displayAssignmentProgress();
}

// Display subject-wise study time
function displaySubjectAnalytics() {
    const sessions = getSessions();
    const subjectMap = {};
    
    sessions.forEach(session => {
        if (!subjectMap[session.subject]) {
            subjectMap[session.subject] = 0;
        }
        subjectMap[session.subject] += session.duration;
    });
    
    const subjectAnalytics = document.getElementById('subjectAnalytics');
    
    if (Object.keys(subjectMap).length === 0) {
        subjectAnalytics.innerHTML = '<p class="empty-state">No study data yet.</p>';
        return;
    }
    
    const totalMinutes = Object.values(subjectMap).reduce((a, b) => a + b, 0);
    
    subjectAnalytics.innerHTML = Object.entries(subjectMap)
        .sort((a, b) => b[1] - a[1])
        .map(([subject, minutes]) => {
            const percentage = Math.round((minutes / totalMinutes) * 100);
            return `
                <div class="subject-stat">
                    <div>
                        <div class="subject-name">${escapeHtml(subject)}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%;"></div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <strong>${minutesToHours(minutes)}</strong>
                        <br><small>${percentage}%</small>
                    </div>
                </div>
            `;
        }).join('');
}

// Display study statistics
function displayStudyStatistics() {
    const sessions = getSessions();
    
    if (sessions.length === 0) {
        const stats = document.getElementById('studyStats');
        stats.innerHTML = '<p class="empty-state">Start studying to see your statistics!</p>';
        return;
    }
    
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = Math.round(totalMinutes / totalSessions);
    
    document.getElementById('statTotalSessions').textContent = totalSessions;
    document.getElementById('statTotalTime').textContent = minutesToHours(totalMinutes);
    document.getElementById('statAvgDuration').textContent = avgDuration + ' min';
}

// Display assignment progress
function displayAssignmentProgress() {
    const assignments = getAssignments();
    
    if (assignments.length === 0) {
        document.getElementById('assignmentProgress').innerHTML = '<p class="empty-state">No assignments yet.</p>';
        return;
    }
    
    const completed = assignments.filter(a => a.completed).length;
    const total = assignments.length;
    const percentage = Math.round((completed / total) * 100);
    
    document.getElementById('assignmentProgress').innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong>Overall Progress</strong>
                <span>${completed} / ${total} completed</span>
            </div>
            <div class="progress-bar" style="height: 20px;">
                <div class="progress-fill" style="width: ${percentage}%;"></div>
            </div>
            <div style="text-align: right; margin-top: 8px; color: var(--text-light);">
                ${percentage}% Complete
            </div>
        </div>
    `;
}

// ===== DASHBOARD =====

// Update dashboard stats
function updateDashboard() {
    const sessions = getSessions();
    const assignments = getAssignments();
    
    const totalHours = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60);
    const completedAssignments = assignments.filter(a => a.completed).length;
    const pendingAssignments = assignments.filter(a => !a.completed).length;
    
    document.getElementById('totalSessions').textContent = sessions.length;
    document.getElementById('totalHours').textContent = totalHours;
    document.getElementById('completedAssignments').textContent = completedAssignments;
    document.getElementById('pendingAssignments').textContent = pendingAssignments;
    
    displayRecentSessions();
    displayUpcomingDeadlines();
}

// Load and display all data
function loadAndDisplayData() {
    displaySessions();
    displayAssignments();
    updateDashboard();
}

// ===== UTILITY FUNCTIONS =====

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get days until deadline
function getDaysUntilDeadline(deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    deadlineDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// Convert minutes to hours
function minutesToHours(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return mins + ' min';
    }
    return hours + 'h ' + mins + 'min';
}

// Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'danger' ? 'var(--danger-color)' : 'var(--primary-color)'};
        color: white;
        border-radius: 6px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('Study Planner App loaded successfully!');

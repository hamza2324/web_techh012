const projectsListEl = document.getElementById('projects-list');
const projectForm = document.getElementById('project-form');
const taskForm = document.getElementById('task-form');
const addTaskBtn = document.getElementById('add-task-btn');

const tasksProjectTitleEl = document.getElementById('tasks-project-title');
const tasksProjectSubtitleEl = document.getElementById('tasks-project-subtitle');
const tasksTeamMembersEl = document.getElementById('tasks-team-members');

const tasksTodoEl = document.getElementById('tasks-todo');
const tasksInProgressEl = document.getElementById('tasks-inprogress');
const tasksDoneEl = document.getElementById('tasks-done');

let projects = [];
let selectedProjectId = null;

/* Helper: fetch JSON with error handling */
async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json();
}

/* Load all projects from server */
async function loadProjects() {
  try {
    const data = await apiRequest('/api/projects');
    projects = data;
    renderProjectsList();
    // If selected project was deleted later (not in this simple version), reset
    if (selectedProjectId && !projects.some(p => p.id === selectedProjectId)) {
      selectedProjectId = null;
      resetTaskPanel();
    } else if (selectedProjectId) {
      const proj = projects.find(p => p.id === selectedProjectId);
      if (proj) renderTaskPanel(proj);
    }
  } catch (err) {
    console.error(err);
    projectsListEl.innerHTML = `<p style="color:#fca5a5;font-size:0.85rem;">Failed to load projects: ${err.message}</p>`;
  }
}

/* Render list of projects */
function renderProjectsList() {
  if (!projects.length) {
    projectsListEl.classList.add('empty-state');
    projectsListEl.innerHTML = '<p>No projects yet. Create one on the left!</p>';
    return;
  }

  projectsListEl.classList.remove('empty-state');
  projectsListEl.innerHTML = '';

  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    if (project.id === selectedProjectId) {
      card.classList.add('active');
    }

    const title = document.createElement('div');
    title.className = 'project-title';
    title.textContent = project.name;

    const meta = document.createElement('div');
    meta.className = 'project-meta';
    const membersText = project.members.join(', ');
    const taskCount = project.tasks.length;
    meta.textContent = `Members: ${membersText || 'N/A'} • Tasks: ${taskCount}`;

    const tag = document.createElement('div');
    tag.className = 'project-tag';
    const created = new Date(project.createdAt);
    tag.textContent = `Created ${created.toLocaleDateString()}`;

    card.appendChild(title);
    card.appendChild(tag);
    card.appendChild(meta);

    card.addEventListener('click', () => {
      selectedProjectId = project.id;
      renderProjectsList();
      renderTaskPanel(project);
    });

    projectsListEl.appendChild(card);
  });
}

/* Reset task panel when no project selected */
function resetTaskPanel() {
  tasksProjectTitleEl.textContent = 'Select a project';
  tasksProjectSubtitleEl.textContent = 'Choose a project from the list to start adding tasks.';
  tasksTeamMembersEl.innerHTML = '';
  tasksTodoEl.innerHTML = '';
  tasksInProgressEl.innerHTML = '';
  tasksDoneEl.innerHTML = '';
  addTaskBtn.disabled = true;
}

/* Render selected project info and tasks */
function renderTaskPanel(project) {
  tasksProjectTitleEl.textContent = project.name;
  tasksProjectSubtitleEl.textContent = project.description || 'No description provided.';
  addTaskBtn.disabled = false;

  // Team members
  tasksTeamMembersEl.innerHTML = '';
  project.members.forEach(member => {
    const pill = document.createElement('span');
    pill.className = 'member-pill';
    pill.textContent = member;
    tasksTeamMembersEl.appendChild(pill);
  });

  // Tasks
  tasksTodoEl.innerHTML = '';
  tasksInProgressEl.innerHTML = '';
  tasksDoneEl.innerHTML = '';

  if (!project.tasks.length) {
    tasksTodoEl.innerHTML = '<p class="task-meta">No tasks yet. Add the first task!</p>';
    return;
  }

  project.tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    const dueText = task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date';
    meta.textContent = `${task.assignee} • ${dueText}`;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const statusBadge = document.createElement('span');
    statusBadge.className = 'task-status-badge';

    if (task.status === 'To Do') {
      statusBadge.classList.add('badge-todo');
    } else if (task.status === 'In Progress') {
      statusBadge.classList.add('badge-progress');
    } else {
      statusBadge.classList.add('badge-done');
    }
    statusBadge.textContent = task.status;

    const select = document.createElement('select');
    ['To Do', 'In Progress', 'Done'].forEach(status => {
      const opt = document.createElement('option');
      opt.value = status;
      opt.textContent = status;
      if (status === task.status) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', async () => {
      try {
        const updated = await apiRequest(
          `/api/projects/${project.id}/tasks/${task.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ status: select.value })
          }
        );

        // Update local data
        const projIdx = projects.findIndex(p => p.id === project.id);
        if (projIdx !== -1) {
          const taskIdx = projects[projIdx].tasks.findIndex(t => t.id === task.id);
          if (taskIdx !== -1) {
            projects[projIdx].tasks[taskIdx] = updated;
          }
        }
        renderTaskPanel(projects.find(p => p.id === project.id));
      } catch (err) {
        alert('Failed to update task status: ' + err.message);
        select.value = task.status; // revert
      }
    });

    actions.appendChild(statusBadge);
    actions.appendChild(select);

    card.appendChild(title);
    card.appendChild(actions);
    card.appendChild(meta);

    if (task.status === 'To Do') {
      tasksTodoEl.appendChild(card);
    } else if (task.status === 'In Progress') {
      tasksInProgressEl.appendChild(card);
    } else {
      tasksDoneEl.appendChild(card);
    }
  });
}

/* Handle create project form */
projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('project-name').value.trim();
  const description = document.getElementById('project-description').value.trim();
  const members = document.getElementById('project-members').value.trim();

  if (!name || !members) {
    alert('Project name and team members are required.');
    return;
  }

  try {
    const newProject = await apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description, members })
    });

    // Reset form
    projectForm.reset();

    // Update state and UI
    projects.push(newProject);
    selectedProjectId = newProject.id;
    renderProjectsList();
    renderTaskPanel(newProject);
  } catch (err) {
    alert('Failed to create project: ' + err.message);
  }
});

/* Handle add task form */
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selectedProjectId) return;

  const title = document.getElementById('task-title').value.trim();
  const assignee = document.getElementById('task-assignee').value.trim();
  const dueDate = document.getElementById('task-due').value;

  if (!title || !assignee) {
    alert('Task title and assignee are required.');
    return;
  }

  try {
    const newTask = await apiRequest(`/api/projects/${selectedProjectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title, assignee, dueDate })
    });

    // Reset task form (but keep project selection)
    taskForm.reset();

    // Update local data
    const project = projects.find(p => p.id === selectedProjectId);
    if (project) {
      project.tasks.push(newTask);
      renderTaskPanel(project);
      renderProjectsList();
    }
  } catch (err) {
    alert('Failed to add task: ' + err.message);
  }
});

/* Initialize */
loadProjects();
resetTaskPanel();

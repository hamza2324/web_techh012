const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// In‑memory data (lost when server restarts, fine for demo)
let projects = [];
let nextProjectId = 1;
let nextTaskId = 1;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Get all projects with tasks
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// Create a new project
app.post('/api/projects', (req, res) => {
  const { name, description, members } = req.body;

  if (!name || !members) {
    return res.status(400).json({ message: 'Project name and members are required.' });
  }

  const memberList = members
    .split(',')
    .map(m => m.trim())
    .filter(Boolean);

  const newProject = {
    id: nextProjectId++,
    name,
    description: description || '',
    members: memberList,
    createdAt: new Date().toISOString(),
    tasks: []
  };

  projects.push(newProject);
  res.status(201).json(newProject);
});

// Add task to a project
app.post('/api/projects/:projectId/tasks', (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const { title, assignee, dueDate } = req.body;

  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found.' });
  }

  if (!title || !assignee) {
    return res.status(400).json({ message: 'Task title and assignee are required.' });
  }

  const newTask = {
    id: nextTaskId++,
    title,
    assignee,
    dueDate: dueDate || '',
    status: 'To Do',
    createdAt: new Date().toISOString()
  };

  project.tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task status
app.patch('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  const projectId = parseInt(req.params.projectId, 10);
  const taskId = parseInt(req.params.taskId, 10);
  const { status } = req.body;

  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found.' });
  }

  const task = project.tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  task.status = status;
  res.json(task);
});

// Fallback: send index.html for any other route (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

let projects = []
let selectedProject = null

const projectForm = document.getElementById("project-form")
const projectsList = document.getElementById("projects-list")
const taskForm = document.getElementById("task-form")
const addTaskBtn = document.getElementById("add-task-btn")

const projectTitle = document.getElementById("tasks-project-title")
const projectSubtitle = document.getElementById("tasks-project-subtitle")
const teamMembersDiv = document.getElementById("tasks-team-members")

const todoDiv = document.getElementById("tasks-todo")
const progressDiv = document.getElementById("tasks-inprogress")
const doneDiv = document.getElementById("tasks-done")

projectForm.addEventListener("submit", e => {
  e.preventDefault()

  const name = document.getElementById("project-name").value.trim()
  const desc = document.getElementById("project-description").value.trim()
  const members = document.getElementById("project-members").value.split(",").map(m => m.trim()).filter(m => m)

  if (!name || members.length === 0) return

  projects.push({
    name,
    desc,
    members,
    tasks: { todo: [], progress: [], done: [] }
  })

  projectForm.reset()
  renderProjects()
})

function renderProjects() {
  projectsList.innerHTML = ""
  projects.forEach((p, i) => {
    const div = document.createElement("div")
    div.className = "project-card"
    div.innerHTML = `<h4>${p.name}</h4><p>${p.desc || "No description"}</p>`
    div.onclick = () => selectProject(i)
    projectsList.appendChild(div)
  })
}

function selectProject(index) {
  selectedProject = index
  const p = projects[index]
  projectTitle.textContent = p.name
  projectSubtitle.textContent = "Team Members"
  teamMembersDiv.innerHTML = p.members.map(m => `<span class="member-chip">${m}</span>`).join("")
  addTaskBtn.disabled = false
  renderTasks()
}

taskForm.addEventListener("submit", e => {
  e.preventDefault()
  if (selectedProject === null) return

  const title = document.getElementById("task-title").value.trim()
  const assignee = document.getElementById("task-assignee").value.trim()
  const due = document.getElementById("task-due").value

  if (!title || !assignee) return

  projects[selectedProject].tasks.todo.push({ title, assignee, due })
  taskForm.reset()
  renderTasks()
})

function renderTasks() {
  todoDiv.innerHTML = ""
  progressDiv.innerHTML = ""
  doneDiv.innerHTML = ""

  const t = projects[selectedProject].tasks

  t.todo.forEach((task, i) => {
    const d = document.createElement("div")
    d.className = "task-item"
    d.innerHTML = `${task.title} - ${task.assignee}`
    d.onclick = () => moveTask("todo", "progress", i)
    todoDiv.appendChild(d)
  })

  t.progress.forEach((task, i) => {
    const d = document.createElement("div")
    d.className = "task-item"
    d.innerHTML = `${task.title} - ${task.assignee}`
    d.onclick = () => moveTask("progress", "done", i)
    progressDiv.appendChild(d)
  })

  t.done.forEach(task => {
    const d = document.createElement("div")
    d.className = "task-item done"
    d.textContent = `${task.title} - ${task.assignee}`
    doneDiv.appendChild(d)
  })
}

function moveTask(from, to, index) {
  const task = projects[selectedProject].tasks[from].splice(index, 1)[0]
  projects[selectedProject].tasks[to].push(task)
  renderTasks()
}

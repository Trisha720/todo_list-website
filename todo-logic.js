let currentFilter = 'all';

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  document.getElementById("addTaskBtn").addEventListener("click", addTask);
  document.querySelectorAll(".controls button[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      currentFilter = button.getAttribute("data-filter");
      renderTasks(getTasks());
    });
  });
  document.getElementById("clearCompletedBtn").addEventListener("click", clearCompleted);
  document.getElementById("toggleModeBtn").addEventListener("click", toggleDarkMode);
});

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const dueDateInput = document.getElementById("dueDateInput");
  const priority = document.getElementById("priorityInput").value;

  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!taskText) return;

  const task = {
    id: Date.now(),
    text: taskText,
    completed: false,
    dueDate,
    priority
  };

  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
  taskInput.value = "";
  dueDateInput.value = "";
  renderTasks(tasks);
}

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const filtered = tasks.filter(task => {
    if (currentFilter === "completed") return task.completed;
    if (currentFilter === "active") return !task.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = task.priority;
    if (task.completed) li.classList.add("completed");
    li.setAttribute("draggable", true);

    li.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", task.id);
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => {
      task.completed = checkbox.checked;
      saveTasks(tasks);
      renderTasks(tasks);
    };

    const span = document.createElement("span");
    span.className = "editable";
    span.contentEditable = true;
    span.textContent = task.text;
    span.onblur = () => {
      task.text = span.textContent.trim();
      saveTasks(tasks);
    };

    const due = task.dueDate ? new Date(task.dueDate).toLocaleString() : "";
    const dateSpan = document.createElement("small");
    dateSpan.textContent = due;

    li.append(checkbox, span, dateSpan);
    list.appendChild(li);
  });

  updateCounter(tasks);
}

function updateCounter(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const counter = document.getElementById("taskCounter");
  counter.textContent = `Total: ${total}, Completed: ${completed}, Pending: ${total - completed}`;
}

function clearCompleted() {
  let tasks = getTasks();
  tasks = tasks.filter(task => !task.completed);
  saveTasks(tasks);
  renderTasks(tasks);
}

function loadTasks() {
  const tasks = getTasks();
  renderTasks(tasks);

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

document.getElementById("taskList").addEventListener("dragover", e => e.preventDefault());

document.getElementById("taskList").addEventListener("drop", e => {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData("text/plain");
  const tasks = getTasks();
  const draggedIndex = tasks.findIndex(t => t.id == draggedId);
  const dropTarget = e.target.closest("li");
  if (!dropTarget) return;

  const targetIndex = [...document.getElementById("taskList").children].indexOf(dropTarget);

  if (draggedIndex >= 0 && targetIndex >= 0 && draggedIndex !== targetIndex) {
    const [movedTask] = tasks.splice(draggedIndex, 1);
    tasks.splice(targetIndex, 0, movedTask);
    saveTasks(tasks);
    renderTasks(tasks);
  }
});

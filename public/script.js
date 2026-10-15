const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');

const storageKey = 'workshop-projects-v1';
const allowedStatuses = ['Planned', 'In Progress', 'Completed'];
const projects = loadProjects();

let editingId = null;

function setMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

function createProjectId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isValidProject(project) {
  return (
    project &&
    typeof project === 'object' &&
    typeof project.id === 'string' &&
    project.id.trim() !== '' &&
    typeof project.name === 'string' &&
    project.name.trim() !== '' &&
    typeof project.status === 'string' &&
    allowedStatuses.includes(project.status)
  );
}

function isValidProjectsArray(savedProjects) {
  if (!Array.isArray(savedProjects)) {
    return false;
  }

  const ids = new Set();

  for (const project of savedProjects) {
    if (!isValidProject(project) || ids.has(project.id)) {
      return false;
    }

    ids.add(project.id);
  }

  return true;
}

function loadProjects() {
  let savedText;

  try {
    savedText = localStorage.getItem(storageKey);
  } catch (error) {
    setMessage('Saved projects could not be read. Your changes may not be saved.');
    return [];
  }

  if (savedText === null) {
    return [];
  }

  try {
    const savedProjects = JSON.parse(savedText);

    if (!isValidProjectsArray(savedProjects)) {
      setMessage(
        'Saved project data is invalid and was not changed. Add a project to create a new saved list.'
      );
      return [];
    }

    return savedProjects;
  } catch (error) {
    setMessage(
      'Saved project data could not be read and was not changed. Add a project to create a new saved list.'
    );
    return [];
  }
}

function saveProjects() {
  try {
    const projectsText = JSON.stringify(projects);
    localStorage.setItem(storageKey, projectsText);
    return true;
  } catch (error) {
    setMessage('Your changes could not be saved.');
    return false;
  }
}

function resetFormToAddMode() {
  editingId = null;
  form.reset();
  saveButton.textContent = 'Add Project';
  cancelButton.hidden = true;
}

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach(project => {
    const listItem = document.createElement('li');
    const projectName = document.createElement('h3');
    const projectStatus = document.createElement('p');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    listItem.className = 'project-item';
    projectName.textContent = project.name;
    projectStatus.textContent = `Status: ${project.status}`;

    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', () => {
      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;
      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;
      nameInput.focus();
    });

    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', () => {
      const shouldDelete = window.confirm(
        `Delete the project "${project.name}"?`
      );

      if (!shouldDelete) {
        return;
      }

      const projectIndex = projects.findIndex(
        item => item.id === project.id
      );

      if (projectIndex === -1) {
        return;
      }

      projects.splice(projectIndex, 1);

      if (editingId === project.id) {
        resetFormToAddMode();
      }

      saveProjects();
      renderProjects();
    });

    listItem.append(
      projectName,
      projectStatus,
      editButton,
      deleteButton
    );

    projectList.append(listItem);
  });

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    setMessage('Please enter a project name.');
    nameInput.focus();
    return;
  }

  if (editingId) {
    const project = projects.find(item => item.id === editingId);

    if (project) {
      project.name = name;
      project.status = status;
    }
  } else {
    projects.push({
      id: createProjectId(),
      name,
      status
    });
  }

  saveProjects();
  renderProjects();
  resetFormToAddMode();
  setMessage('');
  nameInput.focus();
});

cancelButton.addEventListener('click', () => {
  resetFormToAddMode();
  setMessage('');
  nameInput.focus();
});

renderProjects();
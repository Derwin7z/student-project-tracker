const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

const projects = [];

function createProjectId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach(project => {
    const listItem = document.createElement('li');
    const projectName = document.createElement('h3');
    const projectStatus = document.createElement('p');

    projectName.textContent = project.name;
    projectStatus.textContent = `Status: ${project.status}`;

    listItem.append(projectName, projectStatus);
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
    nameInput.focus();
    return;
  }

  projects.push({
    id: createProjectId(),
    name,
    status
  });

  renderProjects();
  form.reset();
  nameInput.focus();
});
const taskDisplayEl = $('#task-display');
const taskFormEl = $('#task-form');
const taskTitleInputEl = $('#task-title-input');
const taskDesriptionInputEl = $('#task-description-input');
const taskDateInputEl = $('#taskDueDate');

// Reads tasks from localStorage and returns array of task objects.
function readTasksFromStorage () {

    let tasks = JSON.parse(localStorage.getItem('tasks'));

    if (!tasks) {
        tasks = [];
    }

    return tasks;
}

// Function that saves array of tasks in localStorage.
function saveTasksToStorage (tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function that creates a task card.
function createTaskCard(task) {
    const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  // Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    // If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  // Gather all the elements created above and append them to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // Return the card so it can be appended to the correct lane.
  return taskCard;
}

// Function that renders the task list and make cards draggable
function renderTaskList() {
    const tasks = readTasksFromStorage();

    // Empty existing task cards out of the lanes
    const todoList = $('#todo-cards');
    todoList.empty();
  
    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();
  
    const doneList = $('#done-cards');
    doneList.empty();
  
    // Loop through tasks and create task cards for each status
    for (let task of tasks) {
      if (task.status === 'to-do') {
        todoList.append(createTaskCard(task));
      } else if (task.status === 'in-progress') {
        inProgressList.append(createTaskCard(task));
      } else if (task.status === 'done') {
        doneList.append(createTaskCard(task));
      }
    }
  
    // Use JQuery UI to make task cards draggable
    $('.draggable').draggable({
      opacity: 0.7,
      zIndex: 100,
      helper: function (e) { 
        const original = $(e.target).hasClass('ui-draggable')
          ? $(e.target)
          : $(e.target).closest('.ui-draggable');
        return original.clone().css({
          width: original.outerWidth(),
        });
      },
    });
}

// Function that adds a new task
function handleAddTask(event){
    event.preventDefault();

    const taskTitle = taskTitleInputEl.val().trim();
    const taskDescription = taskDesriptionInputEl.val().trim(); 
    const taskDate = taskDateInputEl.val();
    const Id = crypto.randomUUID();

    const newTask = {    
      id: Id,
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDate,
      status: 'to-do',
    };
  
    // Pull the tasks from localStorage and push the new task to the array
    const tasks = readTasksFromStorage();
    tasks.push(newTask);
  
    // Save the updated tasks array to localStorage
    saveTasksToStorage(tasks);
  
    // Print task data back to the screen
    renderTaskList();
  
    // Clear the form inputs
    taskTitleInputEl.val('');
    taskDesriptionInputEl.val('');
    taskDateInputEl.val('');
}

// Function to delete a task
function handleDeleteTask(event){
    const taskId = $(this).attr('data-task-id');
    let tasks = readTasksFromStorage();
  
    tasks.forEach((task) => {
      if (task.id === taskId) {
        tasks.splice(tasks.indexOf(task), 1);
      }
    });
  
    saveTasksToStorage(tasks);
  
    renderTaskList();
}

// Function that allows dropping a task into a new status lane
function handleDrop(event, ui) {

    const tasks = readTasksFromStorage();

    const taskId = ui.draggable[0].dataset.taskId;
  
    const newStatus = event.target.id;
  
    for (let task of tasks) {
      if (task.id === taskId) {
        task.status = newStatus;
      }
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTaskList();

}

taskFormEl.on('submit', handleAddTask);

taskDisplayEl.on('click', '.btn-delete-task', handleDeleteTask);

// When the page loads, render the task list, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

    renderTaskList();

  // ? Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
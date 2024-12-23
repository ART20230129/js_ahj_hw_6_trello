export default class CardCreator {
  constructor() {
    // this.addInput = this.addInput.bind(this);
    this.board = document.querySelector('.board');
    this.todoTasks = [];
    this.progressTasks = [];
    this.doneTasks = [];
    this.tasks = [this.todoTasks, this.progressTasks, this.doneTasks];
    this.saveDataLocalStorage = this.saveDataLocalStorage.bind(this);
    this.loadDataLocalStorage = this.loadDataLocalStorage.bind(this);
    this.addFormInput = this.addFormInput.bind(this);
    this.closeFormInput = this.closeFormInput.bind(this);
    this.addNewCard = this.addNewCard.bind(this);
    this.closeCardBtn = this.closeCardBtn.bind(this);
    this.deleteNewTask = this.deleteNewTask.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.dragCardMove = this.dragCardMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.insertingShadow = this.insertingShadow.bind(this);
  }

  init() {
    this.loadDataLocalStorage();// загрузка и отрисовка данных из LocalStorage

    const addList = this.board.querySelectorAll('.column__add');
    [...addList].forEach((el) => {
      el.addEventListener('click', this.addFormInput);
    });

    // запись в LocalStorage при покидании страницы
    window.addEventListener('beforeunload', this.saveDataLocalStorage);
  }

  loadDataLocalStorage() { // загрузка и отрисовка данных из LocalStorage
    const savedTasks = localStorage.getItem('tasks');

    if (savedTasks !== null) {
      this.tasks = JSON.parse(savedTasks);

      const parentsContainers = ['.todo', '.progress', '.done'];
      for (let i = 0; i < parentsContainers.length; i += 1) {
        const parentContainer = this.board.querySelector(parentsContainers[i]);
        this.tasks[i].forEach((item) => {
          const newCard = document.createElement('li');
          newCard.classList.add('tasks-list__item');
          newCard.classList.add('task');
          newCard.textContent = item;
          parentContainer.appendChild(newCard);

          if (i === 0) {
            this.todoTasks.push(item);
          }
          if (i === 1) {
            this.progressTasks.push(item);
          }
          if (i === 2) {
            this.doneTasks.push(item);
          }
        });
      }

      this.handlers();
    }
  }

  saveDataLocalStorage() {
    this.todoTasks = [];
    this.progressTasks = [];
    this.doneTasks = [];

    const todo = this.board.querySelector('.todo');
    const progress = this.board.querySelector('.progress');
    const done = this.board.querySelector('.done');

    const todoTasks = Array.from(todo.querySelectorAll('.task'));
    const progressTasks = Array.from(progress.querySelectorAll('.task'));
    const doneTasks = Array.from(done.querySelectorAll('.task'));

    todoTasks.forEach((task) => this.todoTasks.push(task.textContent));
    progressTasks.forEach((task) => this.progressTasks.push(task.textContent));
    doneTasks.forEach((task) => this.doneTasks.push(task.textContent));

    this.tasks = [this.todoTasks, this.progressTasks, this.doneTasks];

    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  addFormInput(event) {
    const newCardForm = document.createElement('form');
    newCardForm.classList.add('column__add-form');
    newCardForm.innerHTML = `
                        <textarea class="add-form__textarea" type ="text" placeholder="Enter a title for this card"></textarea>
                        <div class="add-form__form-control">
                        <button class="add-form__submit-button add-form__button">Add Card</button>
                        <button class="add-form__close-button add-form__button">\u2716</button>
                        </div>
                `;
    const closestContainer = event.target.closest('.container');
    event.target.replaceWith(newCardForm); // replaceWith - заменяет одни элементы другими

    const closeBtv = closestContainer.querySelector('.add-form__close-button');
    closeBtv.addEventListener('click', this.closeFormInput);

    const addBtn = closestContainer.querySelector('.add-form__submit-button');
    addBtn.addEventListener('click', this.addNewCard);
  }

  closeFormInput(event) {
    event.preventDefault(); // прерывание события при нажатии на кнопку обязательно!!!!

    // создаем "ссылку" для создания новой карточки задачи
    const columnAdd = document.createElement('div');
    columnAdd.classList.add('column__add');
    columnAdd.textContent = '+ Add another card';

    const parentElement = event.target.closest('.container');
    const formElement = parentElement.querySelector('.column__add-form');
    parentElement.removeChild(formElement); // удаляем поле ввода и кнопки из столбца
    parentElement.appendChild(columnAdd); // возвращаем "ссылку" для создания новой карточки задачи

    columnAdd.addEventListener('click', this.addFormInput); // запускаем обработчик нажатия кнопки на "ссылку" для создания новой карточки задачи
    // иначе при нажатии на "ссылку" результата не будет
  }

  addNewCard(event) {
    event.preventDefault(); // прерывание события при нажатии на кнопку обязательно!!!!
    const closestContainer = event.target.closest('.container');
    const valueNewCard = closestContainer.querySelector('.add-form__textarea').value.trim(); // содержимое поля ввода задачи

    if (valueNewCard) { // добавляем новую карточку задач только при наличии соедржимого
      const parentUl = closestContainer.querySelector('.items');

      const newCard = document.createElement('li');
      newCard.classList.add('tasks-list__item');
      newCard.classList.add('task');
      newCard.textContent = valueNewCard;
      parentUl.appendChild(newCard);

      // восстанавливаем "ссылку" на добавление новой карточки задач
      const columnAdd = document.createElement('div');
      columnAdd.classList.add('column__add');
      columnAdd.textContent = '+ Add another card';

      const parentElement = event.target.closest('.container');
      const formElement = parentElement.querySelector('.column__add-form');
      parentElement.removeChild(formElement); // удаляем поле ввода и кнопки из столбца
      parentElement.appendChild(columnAdd); // возвращаем "ссылку"
      // для создания новой карточки задачи

      columnAdd.addEventListener('click', this.addInput); // запускаем обработчик нажатия
    }

    this.handlers();
  }

  handlers() { // обработчики
    const tasks = this.board.querySelectorAll('.task');
    Array.from(tasks).forEach((el) => el.addEventListener('mouseover', this.closeCardBtn));

    Array.from(tasks).forEach((el) => el.addEventListener('mouseleave', this.removeCloseBtn));

    Array.from(tasks).forEach((el) => el.addEventListener('mousedown', this.mouseDown));
  }

  closeCardBtn(event) { // показываем кнопку удаления задачи при наведении на задачу
    if (event.target.classList.contains('task') && !event.target.querySelector('.close')) {
      const closeBtn = document.createElement('div');
      closeBtn.classList.add('tasks-list__close');
      closeBtn.classList.add('close');
      closeBtn.textContent = '\u2716';

      event.target.appendChild(closeBtn);
      closeBtn.addEventListener('click', this.deleteNewTask);
    }
  }

  deleteNewTask(event) { // удаление карточки при нажатии на кнопку с кратным крестиком
    const task = event.target.closest('.task');
    const parentElement = event.target.closest('.items');
    parentElement.removeChild(task);
  }

  removeCloseBtn(event) { // отключение кнопки удаления с карточки после ухода курсора с карточки
    const { target } = event;
    const closeBtn = target.querySelector('.close');
    target.removeChild(closeBtn);
  }

  mouseDown(event) { // действия при нажатии на карточку
    if (event.target.classList.contains('task')) {
      this.draggedEl = event.target;

      this.ghostElement = this.draggedEl.cloneNode(true);// создаем клон передвигаемого элемента
      const closeBtn = this.ghostElement.querySelector('.close');
      this.ghostElement.removeChild(closeBtn);
      this.ghostElement.classList.add('dragged');
      this.ghostElement.style.width = `${this.draggedEl.offsetWidth - 15}px`;
      this.ghostElement.style.height = `${this.draggedEl.offsetHeight}px`;
      document.body.appendChild(this.ghostElement);

      const { top, left } = event.target.getBoundingClientRect();

      this.top = event.pageY - top;
      this.left = event.pageX - left;
      this.ghostElement.style.top = `${top - this.draggedEl.offsetHeight}px`;
      this.ghostElement.style.left = `${left - this.board.offsetWidth}px`;

      // создаем "тень" для нового потенциальном месте карточки задания
      this.shadow = document.createElement('div');
      this.shadow.classList.add('task-list__new-place');
      this.shadow.style.width = `${this.ghostElement.offsetWidth}px`;
      this.shadow.style.height = `${this.ghostElement.offsetHeight}px`;

      this.draggedEl.style.display = 'none';
      this.board.addEventListener('mousemove', this.dragCardMove);
      document.addEventListener('mousemove', this.insertingShadow);
      document.addEventListener('mouseup', this.mouseUp);
    }
  }

  dragCardMove(event) { // передвижение клона передвигаемой карточки
    event.preventDefault();
    if (!this.draggedEl) {
      return;
    }

    this.ghostElement.style.top = `${event.pageY - this.top}px`;
    this.ghostElement.style.left = `${event.pageX - this.left}px`;
  }

  insertingShadow(event) { // вставка тени на потенциально новое место карточки
    event.preventDefault();
    if (!this.draggedEl) {
      return;
    }
    const tasksColumn = event.target.closest('.items');

    if (tasksColumn) {
      const allTasks = tasksColumn.querySelectorAll('.task');

      // возвращает координату по оси Y, то есть верхнюю позицию элемента
      const allPosition = [tasksColumn.getBoundingClientRect().top];

      if (allTasks) {
        allTasks.forEach((item) => {
          allPosition.push(item.getBoundingClientRect().top + item.offsetHeight / 2);
        });
      }

      const itemIndex = allPosition.findIndex((item) => item > event.pageY);
      if (itemIndex !== -1) {
        tasksColumn.insertBefore(this.shadow, allTasks[itemIndex - 1]);
      } else {
        tasksColumn.appendChild(this.shadow);
      }
    }
  }

  mouseUp() { // вставка элемента на новое место
    if (!this.draggedEl) {
      return;
    }

    this.shadow.replaceWith(this.draggedEl);// заменяем тень передвигаемым элементом

    this.draggedEl.style.display = 'flex';// превращаем элемент во flex-контейнер
    document.body.removeChild(document.body.querySelector('.dragged'));// вставляем/удаляем передвигаемый элемент

    this.ghostElement = null;
    this.draggedEl = null;
  }
}

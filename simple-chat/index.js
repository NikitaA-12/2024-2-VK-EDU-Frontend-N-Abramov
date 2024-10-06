// Флаг текущего пользователя (true - красный, false - желтый)
let isRedUser = true;

// Элементы интерфейса
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('send-btn');
const chatbox = document.getElementById('chatbox');
const redUserIcon = document.getElementById('red-user');
const yellowUserIcon = document.getElementById('yellow-user');
const chatHeader = document.getElementById('chatHeader');
const username = document.getElementById('username');

// Начальная высота текстового поля
const inputInitHeight = messageInput.scrollHeight;

// Функция для создания сообщения
function createMessage(text, user) {
  const message = document.createElement('li');
  message.classList.add('chat');

  // Присваиваем сообщение текущему пользователю
  if (user) {
    message.classList.add('right', 'red');
  } else {
    message.classList.add('left', 'yellow');
  }

  const messageText = document.createElement('p');
  messageText.textContent = text;

  // Создаем элемент для времени
  const messageTime = document.createElement('span');
  const time = new Date();
  messageTime.textContent = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
  messageTime.classList.add('message-time');

  message.appendChild(messageText);
  message.appendChild(messageTime);
  chatbox.appendChild(message);

  // Скролл вниз после отправки сообщения
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Функция для отправки сообщения
function sendMessage() {
  const messageText = messageInput.value.trim();

  if (messageText) {
    createMessage(messageText, isRedUser);

    // Сохраняем сообщение в локальном хранилище
    saveMessageToLocalStorage(messageText, isRedUser);

    messageInput.value = ''; // Очищаем поле ввода
    messageInput.style.height = `${inputInitHeight}px`; // Сбрасываем высоту текстового поля

    // Обновляем классы всех сообщений после отправки
    updateChatboxClasses();
  }

  // Устанавливаем фокус на поле ввода
  messageInput.focus();
}

// Функция для сохранения сообщения в localStorage
function saveMessageToLocalStorage(text, user) {
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  messages.push({ text, user, time: new Date().toISOString() });
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Функция для загрузки сообщений из localStorage
function loadMessagesFromLocalStorage() {
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  messages.forEach((msg) => createMessage(msg.text, msg.user));
}

// Функция для обновления классов сообщений
function updateChatboxClasses() {
  const messages = chatbox.querySelectorAll('.chat');

  messages.forEach((message) => {
    // Если сообщение от красного пользователя
    if (message.classList.contains('red')) {
      message.classList.toggle('right', isRedUser);
      message.classList.toggle('left', !isRedUser);
    }
    // Если сообщение от желтого пользователя
    else if (message.classList.contains('yellow')) {
      message.classList.toggle('right', !isRedUser);
      message.classList.toggle('left', isRedUser);
    }
  });
}

// Функция для обновления классов кнопки отправки
function updateSendButtonClass() {
  sendBtn.classList.toggle('red', isRedUser);
  sendBtn.classList.toggle('yellow', !isRedUser);
}

// Обработчик отправки сообщения по кнопке
sendBtn.addEventListener('click', sendMessage);

// Автоматическое изменение высоты текстового поля
messageInput.addEventListener('input', () => {
  messageInput.style.height = `${Math.max(inputInitHeight, messageInput.scrollHeight)}px`;
});

// Обработчик для отправки по Enter
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Функция для обновления цвета заголовка и имени пользователя
function updateHeaderColor() {
  if (isRedUser) {
    username.textContent = 'DEADPOOL';
    chatHeader.style.backgroundColor = '#B50919';
  } else {
    username.textContent = 'WOLVERINE';
    chatHeader.style.backgroundColor = '#FDD710';
  }
}

// Обработчики смены пользователя
redUserIcon.addEventListener('click', () => {
  if (!isRedUser) {
    isRedUser = true;
    updateHeaderColor();
    updateChatboxClasses(); // Обновляем классы всех сообщений при смене пользователя
    updateSendButtonClass(); // Обновляем классы кнопки отправки
    messageInput.focus(); // Устанавливаем фокус на поле ввода
  }
});

yellowUserIcon.addEventListener('click', () => {
  if (isRedUser) {
    isRedUser = false;
    updateHeaderColor();
    updateChatboxClasses(); // Обновляем классы всех сообщений при смене пользователя
    updateSendButtonClass(); // Обновляем классы кнопки отправки
    messageInput.focus(); // Устанавливаем фокус на поле ввода
  }
});

// Первоначальная установка цвета заголовка и имени пользователя
updateHeaderColor();
updateSendButtonClass(); // Установка классов кнопки при загрузке страницы

// Загрузка сообщений при загрузке страницы
loadMessagesFromLocalStorage();

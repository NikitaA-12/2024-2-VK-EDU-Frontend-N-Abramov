const chatInput = document.querySelector('.chat-input textarea');
const redUserIcon = document.getElementById('red-user');
const yellowUserIcon = document.getElementById('yellow-user');
const chatbox = document.getElementById('chatbox');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('messageInput');
const header = document.getElementById('chatHeader');
const username = document.getElementById('username');
let currentColor = 'red'; // По умолчанию — красный пользователь
const inputInitHeight = chatInput.scrollHeight;

// Загружаем сообщения из localStorage
let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];

// Функция для загрузки сообщений в чат
const loadMessages = () => {
  chatbox.innerHTML = ''; // Очищаем старые сообщения
  messages.forEach(({ text, time, color }) => {
    const messageElement = document.createElement('li');
    messageElement.classList.add('chat', color === 'red' ? 'outgoing' : 'incoming');

    const messageParagraph = document.createElement('p');
    messageParagraph.innerHTML = `${text} <br><span class="message-time">${time}</span>`;
    messageElement.appendChild(messageParagraph);
    chatbox.appendChild(messageElement);
  });
  chatbox.scrollTop = chatbox.scrollHeight; // Прокручиваем вниз
};

// Функция для получения текущего времени
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Функция для отправки сообщения
const sendMessage = () => {
  const messageText = messageInput.value.trim();
  if (messageText) {
    const currentTime = getCurrentTime();

    // Добавляем новое сообщение в массив
    messages.push({
      text: messageText,
      time: currentTime,
      color: currentColor,
    });

    // Сохраняем обновлённые сообщения в localStorage
    localStorage.setItem('chatMessages', JSON.stringify(messages));

    // Обновляем интерфейс
    loadMessages();

    // Очищаем поле ввода и сбрасываем его высоту
    messageInput.value = '';
    chatInput.style.height = `${inputInitHeight}px`; // Сбрасываем высоту поля ввода
  }
};

// Автоматическое изменение высоты текстового поля
chatInput.addEventListener('input', () => {
  chatInput.style.height = `${Math.max(inputInitHeight, chatInput.scrollHeight)}px`;
});

// Добавляем событие на кнопку отправки
sendBtn.addEventListener('click', sendMessage);

// Обработчик для отправки по Enter
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Устанавливаем активного пользователя
function setActiveUser(color) {
  currentColor = color;
  messageInput.focus();

  if (color === 'red') {
    username.textContent = 'DEADPOOL';
    header.style.backgroundColor = '#B50919';
  } else {
    username.textContent = 'WOLVERINE';
    header.style.backgroundColor = '#FDD710';
  }

  sendBtn.classList.remove('red', 'yellow');
  sendBtn.classList.add(color);
  messageInput.placeholder = 'Введите сообщение';
}

// Обработчики кликов по иконкам пользователей
redUserIcon.addEventListener('click', () => setActiveUser('red'));
yellowUserIcon.addEventListener('click', () => setActiveUser('yellow'));

// Инициализация активного пользователя
setActiveUser('red');

// Загружаем сообщения при загрузке страницы
loadMessages();

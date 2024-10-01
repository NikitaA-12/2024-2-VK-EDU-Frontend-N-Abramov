import './index.css';
const chatInput = document.querySelector('.chat-input textarea');
const sendChatBtn = document.querySelector('.chat-input span');
const chatbox = document.querySelector('.chatbox');

let userMessage;
const inputInitHeight = chatInput.scrollHeight;

// Функция для форматирования текущего времени (часы и минуты)
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Функция для создания элементов сообщений
const createChatLi = (message, className, time) => {
  const chatLi = document.createElement('li');
  chatLi.classList.add('chat', className);
  let chatContent = `
    <p>${message} <br><small>${time}</small></p>
  `;
  chatLi.innerHTML = chatContent;
  return chatLi;
};

// Функция для загрузки сообщений из Local Storage
const loadMessages = () => {
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];

  // Очищаем чат перед загрузкой сообщений
  chatbox.innerHTML = '';

  // Добавляем каждое сообщение из Local Storage
  messages.forEach((msg) => {
    const messageElement = createChatLi(msg.text, msg.type, msg.time);
    chatbox.appendChild(messageElement);
  });

  // Прокрутка чата вниз
  chatbox.scrollTo(0, chatbox.scrollHeight);
};

// Функция для сохранения сообщения в Local Storage
const saveMessageToLocalStorage = (message, type) => {
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  const time = getCurrentTime(); // Время отправки сообщения (часы и минуты)
  messages.push({ text: message, type: type, time: time });
  localStorage.setItem('chatMessages', JSON.stringify(messages));
};

// Основная функция обработки сообщений
const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Создаём элемент для исходящего сообщения и добавляем в чат
  const outgoingMessage = createChatLi(userMessage, 'outgoing', getCurrentTime());
  chatbox.appendChild(outgoingMessage);

  // Сохраняем сообщение в Local Storage
  saveMessageToLocalStorage(userMessage, 'outgoing');

  // Очищаем поле ввода
  chatInput.value = '';
  chatInput.style.height = `${inputInitHeight}px`;

  // Прокручиваем чат вниз
  chatbox.scrollTo(0, chatbox.scrollHeight);

  // Добавляем имитацию ответа "Thinking..." спустя 600 мс
  setTimeout(() => {
    const botResponse = 'Thinking...';
    const incomingMessage = createChatLi(botResponse, 'incoming', getCurrentTime());
    chatbox.appendChild(incomingMessage);

    // Сохраняем входящее сообщение в Local Storage
    saveMessageToLocalStorage(botResponse, 'incoming');

    // Прокручиваем чат вниз
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }, 600);
};

// Автоматическое изменение высоты текстового поля
chatInput.addEventListener('input', () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Обработчик для отправки сообщения по Enter
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

// Обработчик для отправки сообщения по кнопке
sendChatBtn.addEventListener('click', handleChat);

// Загружаем переписку из Local Storage при загрузке страницы
window.onload = loadMessages;

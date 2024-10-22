import { chatData, saveChatsToLocalStorage } from './chat-data.js';
import { currentChatId } from './chat-item.js';
import { displayChats } from '../index.js';

const messageBox = document.getElementById('messageBox'); // Элемент для сообщений
const chatBox = document.querySelector('.chatBox'); // Контейнер для сообщений
const backBtn = document.querySelector('#back'); // Кнопка "Назад"
const sendBtn = document.querySelector('#send-btn'); // Кнопка отправки
const messageInput = document.querySelector('#messageInput'); // Поле ввода сообщения
const toggleAlignmentBtn = document.getElementById('toggleAlignment'); // Кнопка для смены выравнивания

let currentUser = 'right'; // Идентификатор текущего пользователя
let isOutgoing = true; // По умолчанию сообщения исходящие

// Функция для экранирования HTML-сущностей
function escapeHTML(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Обработчик события для отправки сообщения
sendBtn.addEventListener('click', () => {
  const messageContent = messageInput.value.trim(); // Получаем текст сообщения
  if (messageContent && currentChatId !== null) {
    const escapedMessageContent = escapeHTML(messageContent); // Экранируем ввод

    // Создаем новое сообщение
    const newMessage = {
      type: currentUser === 'right' ? 'outgoing' : 'incoming',
      from: currentUser,
      content: escapedMessageContent,
      time: new Date().toISOString(),
    };

    // Находим текущий активный чат
    const chat = chatData.chats.find((c) => c.chatId === currentChatId);
    if (chat) {
      chat.messages.push(newMessage); // Добавляем сообщение в чат

      // Отображаем новое сообщение в интерфейсе
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', currentUser === 'right' ? 'outgoing' : 'incoming');
      const formattedTime = new Date(newMessage.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      messageDiv.innerHTML = `<p>${escapedMessageContent}</p><span class="time">${formattedTime}</span>`;
      messageBox.appendChild(messageDiv);

      // Прокручиваем чат вниз
      messageBox.scrollTop = messageBox.scrollHeight;

      // Очищаем поле ввода
      messageInput.value = '';
      saveChatsToLocalStorage(); // Сохраняем изменения
    }
  }
});

// Привязка кнопки "Назад" к функции скрытия чата
backBtn.addEventListener('click', () => {
  chatBox.classList.add('hide');
  displayChats(); // Обновляем список чатов
});

// Функция для смены выравнивания сообщений
function toggleMessageAlignment() {
  const messages = document.querySelectorAll('.message');
  messages.forEach((message) => {
    if (message.classList.contains('incoming')) {
      message.classList.remove('incoming');
      message.classList.add('outgoing');
      message.style.textAlign = 'right';
      message.style.marginLeft = 'auto';
      message.style.marginRight = 'unset';
    } else if (message.classList.contains('outgoing')) {
      message.classList.remove('outgoing');
      message.classList.add('incoming');
      message.style.textAlign = 'left';
      message.style.marginRight = 'auto';
      message.style.marginLeft = 'unset';
    }
  });

  // Меняем пользователя и статус для новых сообщений
  currentUser = isOutgoing ? 'left' : 'right';
  isOutgoing = !isOutgoing;
}

// Привязка функции к кнопке смены выравнивания
toggleAlignmentBtn.addEventListener('click', toggleMessageAlignment);

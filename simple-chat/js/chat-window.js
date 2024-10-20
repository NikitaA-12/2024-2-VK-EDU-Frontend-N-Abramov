import { chatData, saveChatsToLocalStorage } from './chat-data.js';
import { currentChatId } from './chat-item.js';
import { displayChats } from '../index.js';
const messageBox = document.getElementById('messageBox'); // Получаем элемент для сообщений
const chatBox = document.querySelector('.chatBox'); // Контейнер для сообщений
const backBtn = document.querySelector('#back'); // Кнопка назад
const sendBtn = document.querySelector('#send-btn'); // Кнопка отправки
const messageInput = document.querySelector('#messageInput'); // Поле ввода сообщения

let currentUser = 'right'; // Идентификатор текущего пользователя
sendBtn.addEventListener('click', () => {
  console.log('sendBtn clicked');
  const messageContent = messageInput.value.trim(); // Получаем текст из поля ввода
  console.log('messageContent', messageContent);
  if (messageContent && currentChatId !== null) {
    // Создаем новое сообщение с типом 'outgoing' или 'incoming'
    const newMessage = {
      type: currentUser === 'right' ? 'outgoing' : 'incoming', // Устанавливаем тип сообщения
      from: currentUser,
      content: messageContent,
      time: new Date().toISOString(), // Сохраняем текущее время в ISO формате
    };

    // Находим активный чат и добавляем новое сообщение
    const chat = chatData.chats.find((c) => c.chatId === currentChatId);
    if (chat) {
      chat.messages.push(newMessage); // Добавляем сообщение в массив сообщений

      // Отображаем новое сообщение в интерфейсе
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', 'outgoing');
      const formattedTime = new Date(newMessage.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      messageDiv.innerHTML = `<p>${messageContent}</p><span class="time">${formattedTime}</span>`;
      messageBox.appendChild(messageDiv);

      // Прокручиваем чат вниз, чтобы показать новое сообщение
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

const toggleAlignmentBtn = document.getElementById('toggleAlignment');
let isOutgoing = true; // По умолчанию сообщения идут как исходящие

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

  // Меняем глобальный currentUser на основании текущего состояния
  currentUser = isOutgoing ? 'left' : 'right';

  // Меняем статус для новых сообщений
  isOutgoing = !isOutgoing;
}

// Привязка функции к кнопке
toggleAlignmentBtn.addEventListener('click', toggleMessageAlignment);

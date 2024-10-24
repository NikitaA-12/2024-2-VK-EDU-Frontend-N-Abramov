import { displayChats } from './index.js';
import { chatData, saveChatsToLocalStorage } from './chat-data.js';
const chatNameInput = document.getElementById('chatNameInput'); // Поле ввода названия чата
const createChatButton = document.getElementById('createChatButton'); // Кнопка создания чата
const modal = document.getElementById('chatModal'); // Модальное окно

// Функция для добавления нового чата
function addNewChat() {
  let chatName = chatNameInput.value.trim(); // Получаем название чата

  if (chatName !== '') {
    chatName = escapeHTML(chatName); // Экранируем HTML-сущности
    const currentTime = new Date(); // Получаем текущее время
    const moscowTime = new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
    }).format(currentTime); // Получаем текущее время в московском времени

    const newChat = {
      chatId: chatData.chats.length + 1, // Новый уникальный ID
      participants: [chatName, 'right'],
      messages: [],
    };

    chatData.chats.unshift(newChat); // Добавляем новый чат в начало массива
    saveChatsToLocalStorage(); // Сохраняем изменения в localStorage

    chatNameInput.value = ''; // Очищаем поле ввода
    displayChats(); // Обновляем список чатов
    closeModal(); // Закрываем модальное окно
  }
}

// Привязка кнопки "Создать чат" к функции добавления нового чата
createChatButton.addEventListener('click', addNewChat);

const modalClose = document.getElementById('modalClose');

// Функция для открытия модального окна
function openModal() {
  modal.classList.add('active');
}

// Функция для закрытия модального окна
function closeModal() {
  chatNameInput.value = ''; // Очищаем поле ввода
  modal.classList.remove('active');
}

// Добавить обработчик события на кнопку закрытия
modalClose.addEventListener('click', closeModal);

document.getElementById('openModalButton').addEventListener('click', openModal);

// Функция для экранирования HTML-символов (защита от XSS)
function escapeHTML(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Добавляем обработчик события keypress для создания чата при нажатии Enter
chatNameInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    addNewChat(); // Создаём новый чат при нажатии Enter
  }
});

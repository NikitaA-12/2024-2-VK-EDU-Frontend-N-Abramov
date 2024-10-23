import { createChatItem } from './js/chat-item.js';
import { chatData, loadChatsFromLocalStorage, saveChatsToLocalStorage } from './js/chat-data.js';
// Функция для сортировки чатов по времени последнего сообщения
function sortChatsByLastMessage() {
  chatData.chats.sort((a, b) => {
    const lastMessageA = a.messages.length
      ? new Date(a.messages[a.messages.length - 1].time)
      : new Date(0);
    const lastMessageB = b.messages.length
      ? new Date(b.messages[b.messages.length - 1].time)
      : new Date(0);
    return lastMessageB - lastMessageA; // Сортировка по убыванию времени
  });
}

const chatList = document.querySelector('.chatlist'); // Список чатов

// Загружаем чаты из localStorage при запуске
loadChatsFromLocalStorage();
sortChatsByLastMessage();
displayChats(); // Отображаем чаты

// Функция для отображения списка чатов
export function displayChats() {
  chatList.innerHTML = ''; // Очищаем список перед заполнением

  chatData.chats.forEach((chat) => {
    const chatBlock = createChatItem(chat); // Создаем элемент чата
    chatList.appendChild(chatBlock);
  });

  // Добавляем обработчик события для иконок удаления
  const deleteButtons = document.querySelectorAll('.delete-chat');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation(); // Останавливаем всплытие события, чтобы не открывать чат
      const chatIdToDelete = parseInt(button.getAttribute('data-chat-id'));
      animateChatDeletion(chatIdToDelete); // Запускаем анимацию удаления чата
    });
  });
}

// Функция для запуска анимации удаления чата
function animateChatDeletion(chatId) {
  const chatElement = document.querySelector(`[data-chat-id="${chatId}"]`); // Находим элемент чата по data-атрибуту

  if (chatElement) {
    const blockElement = chatElement.closest('.block'); // Находим родительский элемент с классом 'block'

    if (blockElement) {
      // Добавляем класс для анимации удаления
      blockElement.classList.add('removing');

      // Ждем завершения анимации перед удалением элемента
      blockElement.addEventListener('animationend', () => {
        deleteChat(chatId); // Удаляем чат после завершения анимации
      });
    }
  }
}

// Функция для удаления чата
function deleteChat(chatId) {
  chatData.chats = chatData.chats.filter((chat) => chat.chatId !== chatId); // Удаляем чат из массива
  saveChatsToLocalStorage(); // Сохраняем изменения
  displayChats(); // Обновляем отображение чатов
}

displayChats(); // Инициализируем отображение списка чатов
saveChatsToLocalStorage(); // Сохраняем чаты в localStorage при каждом обновлении

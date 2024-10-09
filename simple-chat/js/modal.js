const createChatButton = document.getElementById('createChatButton');
const chatModal = document.getElementById('chatModal');
const closeModal = document.getElementById('closeModal');
const createChatBtn = document.getElementById('createChatBtn');
const chatList = document.getElementById('chatList'); // Получаем доступ к списку чатов

createChatButton.addEventListener('click', () => {
  chatModal.style.display = 'block'; // Показываем модальное окно
});

closeModal.addEventListener('click', () => {
  chatModal.style.display = 'none'; // Закрываем модальное окно
});

// Закрываем модальное окно при клике вне его
window.addEventListener('click', (event) => {
  if (event.target === chatModal) {
    chatModal.style.display = 'none';
  }
});

// Логика создания чата (например, отправка названия чата на сервер)
createChatBtn.addEventListener('click', () => {
  const chatName = document.getElementById('chatName').value.trim(); // Убираем лишние пробелы
  if (chatName) {
    addNewChat(chatName); // Добавляем новый чат
    chatModal.style.display = 'none'; // Закрываем модальное окно
    document.getElementById('chatName').value = ''; // Очищаем поле ввода
  } else {
    alert('Пожалуйста, введите название чата');
  }
});

// Функция для добавления нового чата в список
function addNewChat(chatName) {
  // Создаем новый элемент списка
  const chatItem = document.createElement('li');
  chatItem.className = 'chat';
  chatItem.setAttribute('data-chat-id', chatName.toLowerCase().replace(/\s+/g, '-')); // Задаем ID для чата

  // Создаем разметку для чата
  chatItem.innerHTML = `
      <div class="chat-content">
        <div class="user-icon">${getInitials(chatName)}</div> <!-- Добавляем букву -->
        <div class="chat-details">
          <h2 class="username">${chatName}</h2>
          <div class="chat-footer">
            <span class="message-time">Новое</span>
            <span class="message-status material-symbols-outlined">done_all</span>
          </div>
        </div>
      </div>
    `;

  // Добавляем новый чат в начало списка
  chatList.insertBefore(chatItem, chatList.firstChild);
}

// Функция для получения первой буквы названия чата
function getInitials(chatName) {
  return chatName.charAt(0).toUpperCase(); // Возвращаем первую букву
}

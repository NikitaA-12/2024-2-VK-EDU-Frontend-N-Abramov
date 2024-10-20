const chatBox = document.querySelector('.chatBox'); // Контейнер для сообщений
const chatHeaderImg = document.querySelector('#chatAvatar'); // Элемент для аватарки в заголовке чата
const chatHeaderName = document.querySelector('#chatName'); // Элемент для имени участника в заголовке чата
const messageBox = document.getElementById('messageBox'); // Элемент для сообщений
export let currentChatId = null; // Переменная для хранения ID активного чата

export function createChatItem(chat) {
  const chatBlock = document.createElement('div');
  chatBlock.classList.add('block');

  const firstLetter = chat.participants[0].charAt(0).toUpperCase(); // Получаем первую букву названия чата

  // Используем formatTime для форматирования времени последнего сообщения
  const lastMessageTime = chat.messages.length
    ? formatTime(chat.messages[chat.messages.length - 1].time)
    : '';

  const lastMessageContent = chat.messages.length
    ? chat.messages[chat.messages.length - 1].content
    : 'Нет сообщений';

  // Иконка прочтения будет отображаться всегда
  const readIcon =
    '<span class="material-icons read-icon" style="margin-left: 5px;">done_all</span>';

  chatBlock.innerHTML = `
      <div class="imgBx">
        <img 
          id="chatAvatar${chat.chatId}" 
          src="${chat.chatId}.png" 
          alt="Chat avatar" 
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" 
        />
        <div class="avatarLetter" style="display: none; justify-content: center; align-items: center; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; background-color: #8f9efe;">
          ${firstLetter}
        </div>
      </div>
      <div class="details">
        <div class="listHead">
          <h4>${chat.participants[0]}</h4>
          <div class="time-delete-wrapper">
            <span class="material-symbols-outlined delete-chat" data-chat-id="${chat.chatId}">delete</span> <!-- Иконка удаления -->
            <p class="time">${lastMessageTime}</p>
          </div>
        </div>
        <div class="message_p" style="display: flex; justify-content: space-between; align-items: center;">
          <p>${lastMessageContent}</p>
          ${readIcon}
        </div>
      </div>`;

  chatBlock.addEventListener('click', () => openChat(chat));

  return chatBlock;
}

export function setChatAvatar(chatId, avatarElement, nameElement) {
  const chatAvatarSrc = `${chatId}.png`;
  const firstLetter = nameElement.innerHTML.charAt(0).toUpperCase();

  avatarElement.src = chatAvatarSrc;
  avatarElement.onload = () => {
    avatarElement.style.display = 'block';
    avatarElement.nextElementSibling.style.display = 'none'; // Скрываем букву
  };
  avatarElement.onerror = () => {
    avatarElement.style.display = 'none'; // Скрываем аватарку
    const avatarLetter = avatarElement.nextElementSibling;
    avatarLetter.style.display = 'flex'; // Отображаем букву
    avatarLetter.innerHTML = firstLetter; // Устанавливаем букву
  };
}

function openChat(chat) {
  chatBox.classList.remove('hide');

  messageBox.innerHTML = '';
  currentChatId = chat.chatId; // Устанавливаем ID активного чата

  // Обновляем аватарку и имя текущего чата
  chatHeaderName.innerHTML = `${chat.participants[0]} <br /><span>online</span>`;

  // Обновляем аватарку с первой буквой, если аватарка не загрузится
  const firstLetter = chat.participants[0].charAt(0).toUpperCase();
  setChatAvatar(chat.chatId, chatHeaderImg, chatHeaderName); // Устанавливаем аватарку

  chatHeaderImg.onerror = () => {
    chatHeaderImg.nextElementSibling.style.display = 'flex'; // Отображаем букву, если аватар не загрузился
    chatHeaderImg.nextElementSibling.innerHTML = firstLetter; // Устанавливаем букву
  };

  // Отображаем сообщения текущего чата
  chat.messages.forEach((message) => {
    const messageDiv = document.createElement('div');

    // Определяем класс сообщения в зависимости от типа
    if (message.type === 'incoming') {
      messageDiv.classList.add('message', 'incoming'); // Входящее сообщение
    } else if (message.type === 'outgoing') {
      messageDiv.classList.add('message', 'outgoing'); // Исходящее сообщение
    }

    // Форматируем время
    const messageTime = formatTime(message.time);

    // Всегда отображаем иконку прочтения сообщения
    messageDiv.innerHTML = `
      <p>${message.content}</p>
      <div class="message-footer">
        <span class="time">${messageTime}</span>
        <span class="material-icons read-icon">done_all</span> <!-- Иконка прочтения -->
      </div>
    `;
    messageBox.appendChild(messageDiv);
  });
}

// Функция для форматирования времени
function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

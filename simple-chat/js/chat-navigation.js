// Привязываем обработчик события к элементам списка
const chatItems = document.querySelectorAll('#chatList .chat');
chatItems.forEach((item) => {
  item.addEventListener('click', () => {
    const chatId = item.getAttribute('data-chat-id');
    // Переход на страницу чата
    window.location.href = `chat-screen.html?chatId=${chatId}`;
  });
});

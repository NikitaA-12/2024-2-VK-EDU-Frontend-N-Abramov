document.addEventListener('DOMContentLoaded', function () {
  const searchIcon = document.getElementById('searchIcon');
  const searchInput = document.getElementById('searchInput');

  // Обработчик события для клика по иконке поиска
  searchIcon.addEventListener('click', function () {
    // Показать поле ввода и скрыть иконку поиска
    searchInput.style.display = 'block';
    searchIcon.style.display = 'none';

    // Фокусируемся на поле ввода
    searchInput.focus();
  });

  // Обработчик события для потери фокуса на поле ввода
  searchInput.addEventListener('blur', function () {
    // Скрыть поле ввода и показать иконку поиска
    searchInput.style.display = 'none';
    searchIcon.style.display = 'block';
  });

  // Обработчик события для ввода текста в поле поиска
  searchInput.addEventListener('input', function () {
    const filter = searchInput.value.toLowerCase();
    const chatList = document.getElementById('chatList');
    const chats = chatList.getElementsByClassName('chat');

    // Перебираем чаты и скрываем/показываем в зависимости от введенного текста
    for (let i = 0; i < chats.length; i++) {
      const username = chats[i].querySelector('.username').textContent.toLowerCase();
      if (username.includes(filter)) {
        chats[i].style.display = ''; // Показываем чат
      } else {
        chats[i].style.display = 'none'; // Скрываем чат
      }
    }
  });
});

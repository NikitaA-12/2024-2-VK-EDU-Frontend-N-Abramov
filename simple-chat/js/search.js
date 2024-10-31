document.addEventListener('DOMContentLoaded', () => {
  const searchIcon = document.querySelector('.material-symbols-outlined');
  const searchInput = document.querySelector('#searchInput'); // Поле ввода для поиска

  // Функция для переключения видимости иконки и поля ввода
  function toggleSearch() {
    searchIcon.classList.add('hide'); // Скрываем иконку
    searchInput.classList.add('active'); // Отображаем поле ввода
    searchInput.focus(); // Фокус на поле ввода
  }

  // Функция для обработки ввода в поле поиска
  function searchChats() {
    const searchTerm = searchInput.value.toLowerCase(); // Получаем значение поиска
    const chatBlocks = document.querySelectorAll('.chatlist .block'); // Обновляем список блоков чатов
    chatBlocks.forEach((chatBlock) => {
      const chatName = chatBlock.querySelector('.listHead h4').innerText.toLowerCase(); // Получаем имя чата
      // Проверяем, содержит ли имя чата строку поиска
      chatBlock.style.display = chatName.includes(searchTerm) ? '' : 'none'; // Показываем или скрываем блок чата
    });
  }

  // Обработчик события для клика по иконке
  searchIcon.addEventListener('click', toggleSearch);

  // Обработчик события для ввода текста в поле
  searchInput.addEventListener('input', searchChats);

  // Обработчик события для потери фокуса поля ввода
  searchInput.addEventListener('blur', () => {
    if (searchInput.value === '') {
      // Проверяем, пустое ли поле
      searchIcon.classList.remove('hide'); // Показываем иконку
      searchInput.classList.remove('active'); // Скрываем поле ввода
    }
  });

  // Обработчик события для фокуса поля ввода
  searchInput.addEventListener('focus', () => {
    searchIcon.classList.add('hide'); // Скрываем иконку при фокусе на поле ввода
  });
});

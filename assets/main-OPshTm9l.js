import"./modulepreload-polyfill-B5Qt9EMX.js";const o=document.querySelectorAll("#chatList .chat");o.forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-chat-id");window.location.href=`chat-screen.html?chatId=${e}`})});const d=document.getElementById("createChatButton"),s=document.getElementById("chatModal"),i=document.getElementById("closeModal"),r=document.getElementById("createChatBtn"),c=document.getElementById("chatList");d.addEventListener("click",()=>{s.style.display="block"});i.addEventListener("click",()=>{s.style.display="none"});window.addEventListener("click",t=>{t.target===s&&(s.style.display="none")});r.addEventListener("click",()=>{const t=document.getElementById("chatName").value.trim();t?(u(t),s.style.display="none",document.getElementById("chatName").value=""):alert("Пожалуйста, введите название чата")});function u(t){const e=document.createElement("li");e.className="chat",e.setAttribute("data-chat-id",t.toLowerCase().replace(/\s+/g,"-")),e.innerHTML=`
      <div class="chat-content">
        <div class="user-icon">${m(t)}</div> <!-- Добавляем букву -->
        <div class="chat-details">
          <h2 class="username">${t}</h2>
          <div class="chat-footer">
            <span class="message-time">Новое</span>
            <span class="message-status material-symbols-outlined">done_all</span>
          </div>
        </div>
      </div>
    `,c.insertBefore(e,c.firstChild)}function m(t){return t.charAt(0).toUpperCase()}document.addEventListener("DOMContentLoaded",function(){const t=document.getElementById("searchIcon"),e=document.getElementById("searchInput");t.addEventListener("click",function(){e.style.display="block",t.style.display="none",e.focus()}),e.addEventListener("blur",function(){e.style.display="none",t.style.display="block"}),e.addEventListener("input",function(){const l=e.value.toLowerCase(),a=document.getElementById("chatList").getElementsByClassName("chat");for(let n=0;n<a.length;n++)a[n].querySelector(".username").textContent.toLowerCase().includes(l)?a[n].style.display="":a[n].style.display="none"})});

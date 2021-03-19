console.log("hallå!");

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector('.chat-messages')

const socket = io();

//message från server
socket.on("message", (message) => {
  outputMessage(message);

  //scrolla ner när nya meddelanden läggs till
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message eventlyssnare, submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //hämtar message text från forminput
  const msg = e.target.elements.msg.value;

  //emit message till server
  socket.emit("chatMessage", msg);

  //rensa chattinputfältet
  e.target.elements.msg.value = '';
  //fokus på inputfältet
  e.target.elements.msg.focus()

});

// message till DOM

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div)
}

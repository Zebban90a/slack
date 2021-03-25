console.log("hallå!");

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector('.chat-messages')
const nameInput = document.getElementById("nameInput")


const socket = io();

//joina chatroom
socket.emit('joinRoom', {username: nameInput.value, room: room_name})



//message från server
//message funktionen blir det vi tar emot från servern
socket.on("message", message => {
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
  socket.emit("chatMessage",  {
    msg: msg,
    username: nameInput.value, 
    room: room_name
  });

  //rensa chattinputfältet
  e.target.elements.msg.value = '';
  //fokus på inputfältet
  e.target.elements.msg.focus()

});

//datum och tid för
let dt = new Date();

let DD = ("0" + dt.getDate()).slice(-2);

let MM = ("0" + (dt.getMonth() + 1)).slice(-2);

let YYYY = dt.getFullYear();

let hh = ("0" + dt.getHours()).slice(-2);

let mm = ("0" + dt.getMinutes()).slice(-2);

let ss = ("0" + dt.getSeconds()).slice(-2);

let date_string = YYYY + "-" + MM + "-" + DD + " " + hh + ":" + mm + ":" + ss;
// message till DOM

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="font-weight-bold"> <span>${date_string}</span></p>
    <p class="text">
    ${message.username}:
    ${message.msg}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div)
}



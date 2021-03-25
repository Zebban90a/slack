const users = [];

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room};

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
  }
  
  // User leaves chat
  function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
  
    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
  }
  
  // Get room users
  function getRoomUsers(room) {
    return users.filter(user => user.room === room);
  }

let dt = new Date();

let DD = ("0" + dt.getDate()).slice(-2);

let MM = ("0" + (dt.getMonth() + 1)).slice(-2);

let YYYY = dt.getFullYear();

let hh = ("0" + dt.getHours()).slice(-2);

let mm = ("0" + dt.getMinutes()).slice(-2);

let ss = ("0" + dt.getSeconds()).slice(-2);

let date_string = YYYY + "-" + MM + "-" + DD + " " + hh + ":" + mm + ":" + ss;


  module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    date_string
  };
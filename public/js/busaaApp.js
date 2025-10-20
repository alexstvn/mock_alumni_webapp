$(document).ready(() => {
    $("#modal-button").click(() => { //FOR API: EVENTS MODAL
        let apiToken = $("#apiToken").data("token");
        
        $(".modal-body").html("");
        $.get(`/api/events?apiToken=${apiToken}`, (results = {}) => {
            let data = results.data;
            if (!data || !data.events) return;
            data.events.forEach((event) => {
                $(".modal-body").append( //ADDING EACH EVENT TO MODAL
                    `<div class="event">
                        <div class="event-details">
                          <span class="event-title">
                              ${event.title}
                          </span>
                          <div class='event-description'>
                              ${event.description}
                          </div>
                        </div>
                        <button class='${event.joined ? "joined-button light-button" : "join-button dark-button"}' data-id="${
                            event._id
                        }">${event.joined ? "Joined" : "Join"}</button>
                    </div>`
                );
            });
        }).then(() => {
            $(".join-button").click((event) => { //CHANGES JOINED BUTTON BASED ON WHEN CLIKCED
                let $button = $(event.target),
                    eventId = $button.data("id");
                $.get(`/api/events/${eventId}/join?apiToken=${apiToken}`, (results = {}) => {
                  let data = results.data;
                  if (data && data.success) {
                    $button
                      .text("Joined")
                      .addClass("joined-button light-button")
                      .removeClass("join-button");
                  } else {
                    $button.text("Try again");
                  }
                });
            });
        });
    });
});

// CHAT W12
const socket = io();

$("#chatForm").submit(() => {
  let text = $("#chat-input").val(),
    userId = $("#chat-user-id").val(),
    userName = $("#chat-user-name").val();
  socket.emit("message", { content: text, userId: userId, userName: userName });

  $("#chat-input").val("");
  return false;
});

//showing notification in nav bar
socket.on("message", (message) => {
  displayMessage(message);
  for (let i = 0; i < 2; i++) {
    $(".chat-icon").fadeOut(200).fadeIn(200);
  }
});

//displaying messages
socket.on("load all messages", (data) => {
  data.forEach((message) => {
    displayMessage(message);
  });
});

//disconnecting user message
socket.on("user disconnected", () => {
  displayMessage({
    userName: "Notice",
    content: "user left the chat",
  });
});

//displays message
let displayMessage = (message) => {
  $("#chat").prepend(
    $("<li>").html(`<b>${
      message.userName
    }</b>: <span class="message ${getCurrentUserClass(message.user)}
    ">
    ${message.content}</span>`)
  );
};

//differentiating users
let getCurrentUserClass = (id) => {
  let userId = $("#chat-user-id").val();
  return userId === id ? "current-user" : "other-user";
};

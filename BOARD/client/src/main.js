import { wsInit, send } from "./ws.js";
import { Sticker } from "./sticker.js";

export let stickerPool = {};
let nameInput, colorInput;

const onClick = (event) => {
  if (nameInput.val() == "") {
    alert("Input your name first, please");
    return;
  }

  let stk = new Sticker(nameInput.val(), colorInput.val(), crypto.randomUUID());
  stk.$.prependTo($("#stickDiv")).show("slow");
  stickerPool[stk._UUID] = stk;

  ///// ----> server
  send({
    _message_type: "new sticker",
    sticker: stk.stickerData,
  });
  ///// ----> server
};

let test;

const main = () => {
  wsInit(onMessage);
  $("button").on("click", (e) => onClick(e));
  nameInput = $("#name");
  colorInput = $("#color");
};

window.onload = main;

const onMessage = (message, socket) => {
  if (message._message_type == "new sticker") {
    let stk = new Sticker(
      message.sticker.title,
      message.sticker.color,
      message.sticker._UUID,
      message.sticker.content
    );
    stickerPool[stk._UUID] = stk;
    stk.$.prependTo($("#stickDiv")).show("slow");
  } else if (message._message_type == "rem sticker") {
    let stk = stickerPool[message.sticker._UUID];
    delete stickerPool[message.sticker._UUID];
    if (stk != undefined) {
      $(stk.$.find(".closeButton")[0]).trigger("click");
    }
  } else if (message._message_type == "upd sticker") {
    if (message.update_type == "add text") {
      let stk = stickerPool[message.sticker._UUID];
      stk.appendText(message.value);
    } else if (message.update_type == "add image") {
      let stk = stickerPool[message.sticker._UUID];
      stk.appendImage(message.value);
    } else if (message.update_type == "change text") {
      let stk = stickerPool[message.sticker._UUID];
      stk.content[message.text_no].value = message.value;
      $(stk.$.find(`.text${message.text_no}`)[0]).val(message.value);
    }
  }
};

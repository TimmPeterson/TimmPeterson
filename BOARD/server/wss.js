import fs from "node:fs/promises";

let wsPool = [];
let stickerPool = {};

export const onMessage = (message, ws) => {
  console.log("message received");

  let seld_no = wsPool.indexOf(ws);

  if (message._message_type == "new sticker") {
    stickerPool[message.sticker._UUID] = message.sticker;
    for (let socket_no in wsPool) {
      if (Number(socket_no) != seld_no) {
        wsPool[socket_no].send(JSON.stringify(message));
      }
    }
  } else if (message._message_type == "rem sticker") {
    delete stickerPool[message.sticker._UUID];
    for (let socket_no in wsPool) {
      if (Number(socket_no) != seld_no) {
        wsPool[socket_no].send(JSON.stringify(message));
      }
    }
  } else if (message._message_type == "upd sticker") {
    if (message.update_type == "add text") {
      stickerPool[message.sticker._UUID].content.push({
        _type: "textBlock",
        value: message.value,
      });
    } else if (message.update_type == "add image") {
      stickerPool[message.sticker._UUID].content.push({
        _type: "image",
        value: message.value,
      });
    } else if (message.update_type == "change text") {
      stickerPool[message.sticker._UUID].content[message.text_no].value =
        message.value;
    }
    for (let socket_no in wsPool) {
      if (Number(socket_no) != seld_no) {
        wsPool[socket_no].send(JSON.stringify(message));
      }
    }
  }
};

export const onWsConnect = (ws) => {
  wsPool.push(ws);

  for (let UUID in stickerPool) {
    ws.send(
      JSON.stringify({
        _message_type: "new sticker",
        sticker: stickerPool[UUID],
      })
    );
  }
};

export const onWsClose = (ws) => {
  wsPool.splice(wsPool.indexOf(ws), 1);
};

export const saveData = async () => {
  fs.writeFile("server/data/stickers.json", JSON.stringify(stickerPool));
};

export const loadData = async () => {
  let data = await fs.readFile("server/data/stickers.json", {
    encoding: "utf8",
  });
  if (data == "") {
    stickerPool = {};
  } else {
    stickerPool = JSON.parse(data);
  }
};

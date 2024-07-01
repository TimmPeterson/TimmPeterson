import { send } from "./ws.js";
import { stickerPool } from "./main.js";

const onStickerClose = (self, event) => {
  self.hide("slow");
};

export class Sticker {
  constructor(title, color, UUID, content) {
    this._UUID = UUID;
    this.title = title;
    this.color = color;
    this.content = [];
    if (content != undefined) {
      this.content = [...content];
    }
    this.stickerData = {
      _UUID: this._UUID,
      title: this.title,
      color: this.color,
      content: this.content,
    };
    this.$ = this.jquery();
    if (content == undefined) {
      this.appendText("");
    }
  }

  appendText(text) {
    let no = this.content.length;
    let textBlock = $(
      `<textarea class="stickerText text${no}">${text}</textarea>`
    );
    $(this.$.find(".addTextBlock")[0]).before(textBlock);
    textBlock.on("change keyup paste", (event) => {
      send({
        _message_type: "upd sticker",
        update_type: "change text",
        value: textBlock.val(),
        text_no: no,
        sticker: this.stickerData,
      });
    });

    this.content.push({
      _type: "textBlock",
      value: text,
    });
  }

  appendImage(url) {
    $(this.$.find(".addImage")[0])
      .prev()
      .before(`<image class="stickerImg" src="${url}"></image>`);

    this.content.push({
      _type: "image",
      value: url,
    });
  }

  html() {
    return `
    <div class="sticker">
        <button class="closeButton" type="button">x</button>
        <p class="stickerHead" style="color: ${this.color}"><b>${this.title}</b></p>
        <div class="stickerContent">
          <button class="addTextBlock" type="button">add text block</button>
          <button class="addImage" type="button">add image</button>
        </div>
    </div>`;
  }

  jquery() {
    let $obj = $(this.html());
    let divContent = $($obj.find(".stickerContent")[0]);

    for (let block_no in this.content) {
      let index = this.content.length - block_no - 1;
      let block = this.content[index];
      if (block._type == "textBlock") {
        let textBlock = $(
          `<textarea class="stickerText text${index}">${block.value}</textarea>`
        );
        textBlock.on("change keyup paste", (event) => {
          send({
            _message_type: "upd sticker",
            update_type: "change text",
            value: textBlock.val(),
            text_no: index,
            sticker: this.stickerData,
          });
        });
        divContent.prepend(textBlock);
      } else if (block._type == "image") {
        let image = $(
          `<image class="stickerImg" src="${block.value}"></image>`
        );
        divContent.prepend(image);
      }
    }

    $obj.find(".closeButton")[0].onclick = (event) => {
      onStickerClose($obj, event);
      send({ _message_type: "rem sticker", sticker: this.stickerData });
      delete stickerPool[this._UUID];
    };
    $obj.find(".addTextBlock")[0].onclick = (event) => {
      this.appendText("");
      send({
        _message_type: "upd sticker",
        update_type: "add text",
        value: "",
        sticker: this.stickerData,
      });
    };
    $obj.find(".addImage")[0].onclick = (event) => {
      let result = prompt("Input image url");
      if (result == null) return;
      this.appendImage(result);
      send({
        _message_type: "upd sticker",
        update_type: "add image",
        value: result,
        sticker: this.stickerData,
      });
    };
    $obj.hide();
    return $obj;
  }
}

var msg_exmpl = {
  _UUID: "  ",
  title: "  ",
  content: [
    {
      _type: "textBlock",
      value: "some text",
    },
    {
      _type: "image",
      value: "URL",
    },
  ],
};

var msgs = [
  {
    _message_type: "new sticker",
    sticker: {},
    //      server:
    //        [+] push sticker by UUID
    //        [+] send sticker to all clients
    //
    //      client:
    //        [+] get sticker from server, inits, push it to lockal sticker stock
    //
    //
  },
  {
    _message_type: "rem sticker",
    sticker: {},
  },
  {
    _message_type: "upd sticker",
    update_type: "add text",
    value: "",
    sticker: {},
    //      server:
    //        [+] push value to related sticker in pool
    //        [+] resend message to each client
    //
    //      client:
    //        [+] add text to realted sticker object
    //        [+] ???
  },
  {
    _message_type: "upd sticker",
    update_type: "add image",
    value: "",
    sticker: {},
  },
  {
    _message_type: "upd sticker",
    update_type: "change text",
    value: "",
    text_no: 1,
    sticker: {},
  },
];

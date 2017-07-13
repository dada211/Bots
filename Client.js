"use strict";

const Client = {
  split: new Buffer([17]),
  eject: new Buffer([21]),

  init: function (origin) {
    var buf = new Buffer(5);
    buf.writeUInt8(254, 0);
    buf.writeUInt32LE(5, 1);
    var buf = new Buffer(5);
    buf.writeUInt8(255, 0);
    buf.writeUInt32LE(154669603, 1);
    return buf;
  },

  spawn: function (name) {
    var buf = new Buffer(1 + 2 * name.length);
    buf.writeUInt32LE(0, 0);
    buf.write(name, 1, "ucs2");
    return buf;
  },

  chat: function (chatMsg) {
    let buf = new Buffer(2 + 2 * chatMsg.length);
    let pos = 0;
    buf.writeUInt8(99, pos++);
    buf.writeUInt8(0, pos++);
    for (let i = 0; i < chatMsg.length; i++) {
      buf.writeUInt16LE(chatMsg.charCodeAt(i), pos);
      pos += 2;
    }
    return buf;
  },

  move: function (x, y, byteLength) {
    if (byteLength == 21) {
      var buf = new Buffer(21);
      buf.writeUInt8(16, 0);
      buf.writeDoubleLE(x, 1);
      buf.writeDoubleLE(y, 9);
      buf.writeUInt32LE(0, 17);
    } else {
      if (byteLength == 13) {
        var buf = new Buffer(13);
        buf.writeUInt8(16, 0);
        buf.writeInt32LE(x, 1);
        buf.writeInt32LE(y, 5);
        buf.writeUInt32LE(0, 9);
      } else {
        if (byteLength == 5) {
          buf.writeUInt8(16, 0);
          buf.writeInt16LE(x, 1);
          buf.writeInt16LE(y, 3);
        } else {
          if (byteLength == 9) {
            buf.writeUInt8(16, 0);
            buf.writeInt16LE(x, 1);
            buf.writeInt16LE(y, 3);
            buf.writeInt32LE(0, 5);
          }
        }
      }
    }
    return buf;
  },
};


module.exports = Client;
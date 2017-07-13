/**
 * TODO:
 * Tidy Up Code
 */



"use strict";
const c = require("./config.json");
const io = require("socket.io")(c.port);
const Client = require("./Client.js");
const WebSocket = require("ws");
const Socks = require("socks");
const fs = require("fs");
const figlet = require("figlet");
const log = require("log-dot-js");
const readline = require('readline');
const Plugin = require("./Plugin.js");
let proxies = fs.readFileSync("proxies.txt", "utf8").split("\n"),
  serverIP = null,
  playerPosX, playerPosY = 7000,
  byteLength = null,
  botCount = 0,
  bots = [],
  currentSocket = "",
  origin = "",
  opt = {
    headers: {
      'Origin': origin,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.89 Safari/537.35',

    }
  };



figlet.text('Bots', {
  font: 'Mini',
  horizontalLayout: 'default',
  verticalLayout: 'default'
}, function(err, data) {
  if (err) {
    console.log('Something went wrong...');
    console.dir(err);
    return;
  }
  console.log(data);
});


/**
 * Main bot functions
 */

function Bot(id) {
  this.ws = null;
  this.id = id;
  this.init();
}

Bot.prototype = {
  init: function() {
    this.connect();
  },

  connect: function() {
    this.agent = createAgent(this.id);
    this.ws = new WebSocket(serverIP, null, opt);
    this.ws.binaryType = "nodebuffer";
    this.ws.onopen = this.onopen.bind(this);
    this.ws.onclose = this.onclose.bind(this);
    this.ws.onerror = this.onerror.bind(this);
  },

  spawn: function() {
    setInterval(function() {
      this.send(Client.beforeSpawn);
      this.send(Client.spawn(c.botNick + " [" + this.id + "]"));
    }.bind(this), 50);

    setInterval(function() {
      if (c.chatSpam) this.send(Client.chat(c.chatMsg));
    }.bind(this), 2000);

  },

  send: function(buf) {
    if (this.ws && this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(buf);
  },

  split: function() {
    this.send(Client.split);
  },

  eject: function() {
    this.send(Client.eject);
  },

  onopen: function() {
    var buf = new Buffer(5);
    buf.writeUInt8(254, 0);
    buf.writeUInt32LE(5, 1);
    this.send(buf);
    var buf = new Buffer(5);
    buf.writeUInt8(255, 0);
    buf.writeUInt32LE(154669603, 1);
    this.send(buf);
    this.spawn();
    this.startSendPos();
    botCount++;
  },

  startSendPos: function() {
    setInterval(function() {
      this.send(Client.move(playerPosX, playerPosY, byteLength));
    }.bind(this), 10);
  },

  onclose: function() {
    botCount--;
  },

  onerror: function() {
    botCount++;
    setTimeout(this.connect.bind(this), 500);
  },

};

/**
 * Side functions
 */

// Returns bot status
function getBotStatus() {
  if (botCount === 0) {
    return "Idle";
  } else if (botCount > 0) {
    return "Running";
  }
}

// Returns chat spam status
function getSpamStatus() {
  if (c.chatSpam === false) {
    return "Idle";
  } else if (c.chatSpam == true) {
    return "Spamming";
  }
}

// Creates proxy agent
function createAgent(botID) {
  var proxy = proxies[Math.floor(botID / c.botsPerIP)].split(":");
  return new Socks.Agent({
    proxy: {
      ipaddress: proxy[0],
      port: parseInt(proxy[1]),
      type: parseInt(proxy[2]) || 5
    }
  });
}

// Start bots and push to "bots" array
function startBots() {
  for (let i = 0; i < c.maxBots; i++)
    bots.push(new Bot(i));
}



/**
 * Socket.io
 */

// Handle socket connections
io.on("connection", function(socket) {
  currentSocket = socket.id.substr(0, 5)
  log.success(currentSocket + " connected!")
  socket.on("server", function(data) {
    serverIP = data.ip;
    origin = data.origin;
    startBots();
    log.info("Bots requested on " + serverIP);
  });

  socket.on("split", function() {
    for (var i = 0; i < bots.length; i++)
      bots[i].split();

  });
  socket.on("eject", function() {
    for (var i = 0; i < bots.length; i++)
      bots[i].eject();
  });

  socket.on("n", function(data) {
      if (data.name.length === 0) {
        log.err("Name cannot be blank!");
        return;
      } else {
        c.botNick = data.name;
      }
    }),

    socket.on("spam", function(data) {
      if (data.msg.length === 0) {
        log.err("Spam message length cannot be blank!");
        return;
      } else if (c.chatSpam === false) {
        c.chatSpam = true;
        c.chatMsg = data.msg;
      };
    }),

    socket.on("pos", function(data) {
      playerPosX = data.x;
      playerPosY = data.y;
      byteLength = data.byteLength
    });

  socket.on("requestBotCount", function() {
    socket.emit("count", {
      "data": botCount,
    });

    socket.emit(botCount);
  });

});


/**
 * Commands
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
});
rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'help':
      log.info("Current commands (case sensitive):");
      log.info("stats - Server stats (botCount , etc)");
      log.info("plugin - Allows you to install plugins for your server");
      log.info("exit - Stop all processes")
      break;

    case 'stats':
      log.info("Bot Count: " + botCount);
      log.info("Bot Name: " + c.botNick);
      log.info("Bots Per IP: " + c.botsPerIP);
      log.info("Max Bots: " + c.maxBots);
      log.info("Current Socket connected: " + currentSocket);
      if (serverIP === null) {
        log.info("Bots connected to: " + "Not connected yet");
      } else {
        log.info("Bots connected to: " + serverIP);
      }
      log.info("Bot status: " + getBotStatus())
      log.info("Chat spam status: " + getSpamStatus())
      if (c.chatMsg.length === 0) {
        log.info("Chat message: Not specified")
      } else {
        log.info("Chat message: " + c.chatMsg);
      }
      log.info("Connected to client: " + origin)
      log.info("Bots Array: " + bots)
      log.info("Server memory usage: " + Math.round(process.memoryUsage().heapUsed /
        1048576 * 10) / 10 + "/" + Math.round(process.memoryUsage().heapTotal /
        1048576 * 10) / 10 + " mb");
      log.info("Current Uptime: " + Math.floor(process.uptime() / 60) +
        " minutes");
      break;
    case "plugin":
      rl.question(
        'Which plugin would you like to execute?\nChoose:\n\nExample - An example plugin that explains the plugin API\n\n(Case sensitive)\n\n', (
          answer) => {
          Plugin.download(`${answer}`);
          Plugin._execute(`${answer}`);
        });
      break;
    case "exit":
      log.warn("Stopped all processes");
      process.exit();
      break;
    default:
      log.warn("Invalid command please try again!");
      break;
  }
  rl.prompt();
})

setTimeout(function() {
  log.info("Awaiting user connection...")
}, 1000);


module.exports = Bot;
module.exports = c;

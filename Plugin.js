const download = require("download");
const fs = require("fs");
let load = "";
let pluginUrl = "http://fantasyisbae.esy.es/";
let pluginDir = "BotPlugins/"
const Plugin = {
    download: function (name) {
        download(pluginUrl + pluginDir + name + ".js").then(data => {
            if (!fs.existsSync("./Plugins")) {
            fs.mkdirSync("./Plugins")
            }
            fs.writeFileSync("./Plugins/" + name + ".js", data)
        });
    },
    _execute: function (name) {
        setTimeout(function () {
            let Plugin = require("./Plugins/" + name +".js");
            Plugin._execute();
        }, 1000);
    },
}

module.exports = Plugin;

// ==UserScript==
// @name         Bots
// @namespace    Bots
// @version      Fuck Off
// @description  Shit
// @author       Bots
// @match       *.cellcraft.io/*
// @match       *.agarios.com/*
// @match       *.mgar.io/*
// @match       *.agario.bz/*
// @match       *.agariogame.club/*
// @match       *.old.ogarul.io/*
// @match       *.agarly.com/*
// @match       *.bubble.am/*
// @match       *.petridish.pw/*
// @match       *.agariohub.net/*
// @match       *.agarserv.com/*
// @match       *.agarioservers.ga/*
// @match       *.alis.io/*
// @match       *.agarioplay.org/*
// @match       *.ultr.io/*
// @match       *.germs.io/*
// @match       *.agarioforums.io/*
// @match       *.agariofun.com/*
// @match       *.agar.pro/*
// @match       *.agarabi.com/*
// @match       *.warball.co/*
// @match       *.agariom.net/*
// @match       *.agar.re/*
// @match       *.agarpx.com/*
// @match       *.easyagario.com/*
// @match       *.playagario.org/*
// @match       *.agariofr.com/*
// @match       *.agario.xyz/*
// @match       *.agarios.org/*
// @match       *.agariowun.com/*
// @match       *.usagar.com/*
// @match       *.agarioplay.com/*
// @match       *.privateagario.net/*
// @match       *.agariorage.com/*
// @match       *.blong.io/*
// @match       *.agar.blue/*
// @match       *.agar.bio/*
// @match       *.agario.se/*
// @match       *.nbkio.com/*
// @match       *.agariohit.com/*
// @match       *.agariomultiplayer.com/*
// @match       *.agariogameplay.com/*
// @match       *.agariowow.com/*
// @match       *.bestagario.net/*
// @match       *.tytio.com/*
// @match       *.kralagario.com/*
// @match       *.agario.zafer2.com/*
// @match       *.agarprivateserver.net/*
// @match       *.agarca.com/*
// @match       *.agarioplay.mobi/*
// @match       *.agario.mobi*
// @match       *.abs0rb.me/*
// @match       *.agario.us/*
// @match       *.agariojoy.com/*
// @match       *.agario.ch/*
// @match       *.ioagar.us/*
// @match       *.play.agario0.com/*
// @match       *.agario.run/*
// @match       *.agarpvp.us/*
// @match       *.agario.pw/*
// @match       *.ogario.net/*
// @match       *.ogario.net/*
// @match       *.nbk.io/*
// @match       *.agario.info/*
// @match       *.inciagario.com/*
// @match       *.agar.io.biz.tr/*
// @match       *.agariown.com/*
// @match       *.agario.dk/*
// @match       *.agario.lol/*
// @match       *.agario.gen.tr/*
// @match       *.agarioprivateserver.us/*
// @match       *.agariot.com/*
// @match       *.agarw.com/*
// @match       *.agario.city/*
// @match       *.agario.ovh/*
// @match       *.feedy.io/*
// @match       *.agar.zircon.at/*
// @match       *.xn--80aaiv4ak.xn--p1ai/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

// Install this shit

setTimeout(function () {
    var socket = io.connect('ws://localhost:300');
    window.__WebSocket = window.WebSocket;
    window.fakeWebSocket = function () {
        return {
            readyState: 0
        }
    };
    window._WebSocket = window.WebSocket = function (ip) {
        return new window.fakeWebSocket(ip);
    };
    window.Bots = {};
    window.Bots.mx = 0;
    window.Bots.my = 0;
    window.Bots.byteLength = 0;
    window.Bots.x = 0;
    window.Bots.y = 0;
    window.Bots.s = null;
    window.Bots.socketaddr = null;
    window.addEventListener("load", function () {
        if (!window.OldSocket)
            OldSocket = window.__WebSocket;
        window._WebSocket = window.WebSocket = window.fakeWebSocket = function (ip) {
            var ws = new OldSocket(ip);
            ws.binaryType = "arraybuffer"
            var fakeWS = {};
            for (var i in ws)
                fakeWS[i] = ws[i];
        fakeWS.send = function () {
          var msg = new DataView(arguments[0]);
          switch (msg.byteLength) {
            case 21:
              window.Client.mx = msg.getFloat64(1, true);
              window.Client.my = msg.getFloat64(9, true);
              window.Client.byteLength = msg.byteLength;
              break;
            case 13:
              window.Client.mx = msg.getInt32(1, true);
              window.Client.my = msg.getInt32(5, true);
              window.Client.byteLength = msg.byteLength;
              break;
            case 4:
              window.Client.mx = msg.getInt16(1, true);
              window.Client.my = msg.getInt16(3, true);
              window.Client.byteLength = msg.byteLength;
              break;

            default:
              break;
          }

          return ws.send.apply(ws, arguments);
        };
            ws.onmessage = function () {
                var msg = new DataView(arguments[0].data);
                if (msg.byteLength > 16) {
                    if (msg.getUint8(0, true) == 64) {
                        window.Bots.x = msg.getFloat64(1, true);
                        window.Bots.y = msg.getFloat64(9, true);
                    }
                }
                fakeWS.onmessage && fakeWS.onmessage.apply(ws, arguments);
            };
            ws.onopen = function () {
                window.Bots.socketaddr = ws.url;
                fakeWS.readyState = 1;
                fakeWS.onopen.apply(ws, arguments);
            };
            ws.onclose = function () {
                fakeWS.onclose.apply(ws, arguments);
            };
            return fakeWS;
        }
    });

    function emitPosition() {
            socket.emit("pos", {
                "x": window.Bots.mx - window.Bots.x,
                "y": window.Bots.my - window.Bots.y,
                "byteLength": window.Bots.byteLength,
            });
    }


    function emitSplit() {
        socket.emit("split");
    }

    function emitMassEject() {
        socket.emit("eject");
    }


    interval_id = setInterval(function () {
        emitPosition();
    }, 100);
    document.addEventListener('keydown', function (e) {
        var key = e.keyCode || e.which;
        switch (key) {
            case 83:
                SendIp();
                break;
            case 69:
                emitSplit();
                break;
            case 82:
                emitMassEject();
                break;
            case 77:
                Spam();
                break;
        }
    });

    function SendIp() {
        socket.emit("server", {
            "ip": window.Bots.socketaddr,
            "origin": location.origin,
            "byteLength":location.origin.length
        });
    }



    function Spam() {
        var message = prompt("Change spam message");
        socket.emit("spam", {
            "msg": message,
        });
    }

}, 100);
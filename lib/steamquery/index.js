var dgram = require('dgram');
var extend = require('extend');
var ResponseBuffer = require('./responsebuffer');

function parseInfoResponse(message) {
    var response = new ResponseBuffer(message);
    response.move(6);
    var info = {};
    info.serverName = response.getString();
    info.mapName = response.getString();
    info.gameDir = response.getString();
    info.gameDesc = response.getString();
    response.move(2);
    info.numberOfPlayers = response.getByte();
    info.maxPlayers = response.getByte();
    response.move(3);
    info.passwordProtected = response.getByte() == 1;
    response.move(1);
    info.gameVersion = response.getString();

    var edf = response.getByte();
    if (edf & 0x80) {
        info.serverPort = response.getShort();
    }
    if (edf & 0x10) {
        var serverId = response.getUnsignedLong() | response.getUnsignedLong() << 32;
    }
    if (edf & 0x20) {
        var servertags = response.getString().split(',');
        for (var i in servertags) {
            var d = servertags[i];
            switch (d[0]) {
                case 'b':
                    info.battleEye = (d[1] == 't');
                    break;
                case 'n':
                    info.requiredBuildNo = d[1];
                    break;
                case 'r':
                    info.requiredVersion = d.slice(1);
                    break;
                case 'i':
                    info.difficulty = d[1];
                    break;
                case 'l':
                    info.lock = (d[1] == 't');
                    break;
                case 'v':
                    info.verifySignatures = (d[1] == 't');
                    break;
            }
        }
    }
    if (edf & 0x01) {
        var gameid = response.getUnsignedLong() | response.getUnsignedLong() << 32;
    }
    return info;
}

function query(host, complete) {
    var client = dgram.createSocket('udp4');
    var hostArr = host.split(':');
    var data = {};
    var finish = function (err, data) {
        clearTimeout(timeout);
        client.removeAllListeners('message');
        client.close(function () {
            complete(err, data);
        });
    };
    var timeout;
    var startTimer = function () {
        if (timeout) 
            clearTimeout(timeout);
        timeout = setTimeout(function () {finish('timeout');}, 1000);
    };
    startTimer();
    client.on('message', function (message, remote) {
        startTimer();
        switch (message[4]) {
            case 0x49:
                data = extend(data, parseInfoResponse(message));
                var challenge = new Buffer([0xff, 0xff, 0xff, 0xff, 0x56, 0xff, 0xff, 0xff, 0xff]);
                client.send(challenge, 0, challenge.length, hostArr[1], hostArr[0]);
                finish(null, data);
            break;
        }
    });
    var request = new Buffer([0xFF, 0xFF, 0xFF, 0xFF, 0x54, 0x53, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x20, 0x45, 0x6E, 0x67, 0x69, 0x6E, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, 0x00]);
    client.send(request, 0, request.length, hostArr[1], hostArr[0]);
}

module.exports = query;
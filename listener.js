var Client = require('node-rest-client').Client;
var WebSocket = require('ws');
var cookie = require('cookie');
var Table = require('cli-table');
var client = new Client();

var server = ""
var token = ""

client.get("http://" + server + "/api/session?token=" + token, function (data, response) {
    var ws = new WebSocket(
        "http://" + server + "/api/socket",
        [],
        {
            'headers': {
                'Cookie': cookie.serialize(response.headers["set-cookie"])
            }
        }
    );

    ws.on('open', function open() {
        console.log('Connected to server ' + server);
      });
      
      ws.on('message', function incoming(data) {
        var obj = JSON.parse(data);

        if(obj.positions){
            var table = new Table({
                head: ['ID', 'PROTOCOL', 'LATITUDE', 'LONGITUDE', 'TIME']
            , colWidths: [20, 10,30,30,30]
            });

            rangePositions(obj.positions, table, function(){
                console.log(table.toString());
            });
        }
        if(obj.events){
            var table = new Table({
                head: ['ID', 'DEVICEID', 'TYPE', 'TIME']
            , colWidths: [20,20,20,30]
            });
            rangeEvents(obj.events, table, function(){
                console.log(table.toString());
            });
        }
      });

      ws.on('error', function(error){
          console.log(error);
      })
});

function rangePositions(positions, table, cb){
    for(p in positions) {
        pushPosition(positions[p], table);
    }
    cb();
    
}

function pushPosition(position, table){
    table.push([position.id, position.protocol, position.latitude, position.longitude, position.fixTime]);
}

function rangeEvents(events, table, cb){
    for(e in events) {
        pushEvent(events[p], table);
    }
    cb();
}

function pushEvent(event, table){
    table.push([event.id, event.deviceId, event.type, event.serverTime]);
}

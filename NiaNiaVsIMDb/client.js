var http = require('http');
var url = require('url');

function makeUrlRequest(key, data) {
    var options = {
        port:3000,
        hostname: 'localhost',
        path: '/url=' + key,
        method: 'GET',
        headers:{
            'Content-Length' : Buffer.byteLength(data)
        }
    };

    var req = http.request(options, function (res) {

        console.log('HTTP headers:', res.headers);

        res.on('data', function(data) {
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);
        });
    });

    req.write(data);
    req.end();
}

function makeNameRequest(name, surname, data) {
    var options = {
        port:3000,
        hostname: 'localhost',
        path: '/actor=' + name + '_' + surname,
        method: 'GET',
        headers:{
            'Content-Length' : Buffer.byteLength(data)
        }
    };

    var req = http.request(options, function (res) {

        console.log('HTTP headers:', res.headers);

        res.on('data', function(data) {
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);
        });
    });

    req.write(data);
    req.end();
}

function makeCompareRequest(name_1, surname_1, name_2, surname_2, data) {
    var options = {
        port:3000,
        hostname: 'localhost',
        path: '/compare=' + name_1 + '_' + surname_1 + '_' + name_2 + '_' + surname_2,
        method: 'GET',
        headers:{
            'Content-Length' : Buffer.byteLength(data)
        }
    };

    var req = http.request(options, function (res) {

        console.log('HTTP headers:', res.headers);

        res.on('data', function(data) {
            console.log('Body:', data.toString());
            console.log(http.STATUS_CODES[res.statusCode]);
        });
    });

    req.write(data);
    req.end();
}

//makeUrlRequest("http://www.imdb.com/title/tt3682448/?ref_=nm_flmg_act_9", 'wut');
//makeNameRequest("Tom", "Hanks", "wut");
//makeCompareRequest('Emma', 'Watson', 'Robin', 'Williams', 'wut');

var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('');
rl.prompt();

rl.on('line', function(line) {
    if (line === "exit") rl.close();
    rl.prompt();
    names = line.split(' ');

    if (names.length == 4){
        console.log('makeCompareRequest');
        makeCompareRequest(names[0], names[1], names[2], names[3], 'wut');
    }
    else if (names.length == 2){
        console.log('makeNameRequest');
        makeNameRequest(names[0], names[1], 'wut');
    }
    else if (names.length == 1){
        console.log('url');
        makeUrlRequest(names[0], 'wut');
    }
}).on('close',function(){
    process.exit(0);
});
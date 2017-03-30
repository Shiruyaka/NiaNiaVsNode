/**
 * Created by Ola on 2017-03-28.
 */

var http = require('http');
var url = require('url');
var crypto = require('crypto');
const PORT = 3000;

persons = { person:[] };

function generateId(data){
    const hash = crypto.createHash('sha256');
          hash.update(data);

    return hash.digest('hex');
}

answer = {};

function postHandler(request, response){

    var uniqueId;

    request.on('data', function (data) {
        uniqueId = generateId(data);
        data = JSON.parse(data);
        persons["person"].push({ id : uniqueId, name : data["name"] });

        response.write(JSON.stringify({ id : uniqueId }));
        response.end();
    });

}

function getHandler(request, response) {

    var key = request.url.split('/')[2];
    var searchedVal = request.url.split('/')[3];
    var found = false;
    var record;
    request.on('data', function (data) {

        for (var i in persons["person"]){

            if(persons["person"][i][key] === searchedVal)
            {
                record = persons["person"][i];
                found = true;
                break;
            }
        }
        if(found === false)
            response.write("User not found");
        else
            response.write(JSON.stringify(record));

        response.end();
    });

}

function handleRequest(request, response){

        switch(request.method){
            case 'POST':
                postHandler(request, response);
                break;

            case 'GET':
                //console.log(persons);
                getHandler(request, response);
                break;
        }
}

function runServer() {

    var server = http.createServer(handleRequest);

    server.listen(PORT, function () {
        console.log("Slucham....");
    });
}

runServer();
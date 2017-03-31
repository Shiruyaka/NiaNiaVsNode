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
          hash.update(data + new Date().toUTCString());

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

function putHandler(request, response) {
    var key = request.url.split('/')[2];
    var searchedVal = request.url.split('/')[3];
    var found = false;

    request.on('data', function (data){

        data = JSON.parse(data);

        for (var i in persons["person"]){

            if(persons["person"][i][key] === searchedVal)
            {
                persons["person"].splice(i, 1);
                found = true;
                break;
            }
        }

        persons["person"].push(data);

        if(found === true)
            response.write(JSON.stringify({respons: "The object was overrided"}));
        else
            response.write(JSON.stringify({respons: "The object was created"}));

        response.end();

        console.log(persons);
    });
}

function deleteHandler(request, response) { //copyied from put - have to be changed of obviously
    var key = request.url.split('/')[2];
    var searchedVal = request.url.split('/')[3];

    var found = false;

    request.on('data', function (data){

        data = JSON.parse(data);

        for (var i in persons["person"]){
            console.log(persons["person"][i][key]);
            if(persons["person"][i][key] === searchedVal)
            {
                persons["person"].splice(i, 1);
                found = true;
                break;
            }
        }

        if(found === true)
            response.write(JSON.stringify({respons: "The object existed"}));
        else
            response.write(JSON.stringify({respons: "The object didn't exist"}));

        response.end();

        console.log(persons);
    });
}

function patchHandler(request, response) {
    var key = request.url.split('/')[2];
    var searchedVal = request.url.split('/')[3];
    var found = false;



    //console.log(key, searchedVal);

    request.on('data', function (data){
        data = JSON.parse(data);


        for (var i in persons["person"]){
            if(persons["person"][i][key] === searchedVal)
            {
                var prev = persons["person"][i];

                for(var jsKey in prev){
                    data[jsKey] = prev[jsKey];
                }
                console.log(data);
                persons['person'][i] = data;
                found = true;
                break;
            }
        }

        if(found == false)
            persons["person"].push(data);

        if(found === true)
            response.write(JSON.stringify({respons: "The object have new attributes"}));
        else
            response.write(JSON.stringify({respons: "The object was created"}));

        response.end();

        console.log(persons);
    });
}



function handleRequest(request, response){

        switch(request.method){
            case 'POST':
                postHandler(request, response);
                break;

            case 'GET':
                getHandler(request, response);
                break;

            case 'PUT':
                putHandler(request, response);
                break;

            case 'DELETE':
                deleteHandler(request, response);
                break;

            case 'PATCH':
                patchHandler(request, response);
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
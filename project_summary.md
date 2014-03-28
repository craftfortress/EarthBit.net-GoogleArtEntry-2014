# Project Title
earthBit

## Author
- Christopher Gomez Ridley, Craftfortress

## Description
I want to clearly illustrate the real-time propagation of the worlds first major cryptocurrency.

## Link to Prototype
[www.earthBit.net](http://www.earthbit.net)

## Example Code
```
function updateData() {

    //Grab the latest transactions from the BlockChain API via the Heroku tunnel
    $.getJSON('http://immense-reaches-7758.herokuapp.com/blockchain.info/unconfirmed-transactions?cors=true&format=json', function (data) {

        var value1 = 0;
        var value2 = 0;
        var i = 0;

        for(items in data.txs) {
        
            var ip = data.txs[i].relayed_by;
            var latitude = i;
            var longitude = i;
        
            if (data.txs[i].out[0] != undefined)
                value1 = data.txs[i].out[0].value;

            if (data.txs[i].out[1] != undefined)
                value2 = data.txs[i].out[1].value;

            var totalspend = (value1 + value2) * 0.00000001;

            if (!iniplist(ip + totalspend)) {

                //Tunnel & Get Coordinates from the IP address
                $.getJSON('http://immense-reaches-7758.herokuapp.com/freegeoip.net/json/' + ip, function (data) {

                    longitude = data.longitude;
                    latitude = data.latitude;

                    data = [latitude, longitude, totalspend];

                    if (longitude != 0 && latitude != 0) {

                        //Randomise timing of placement within a 10 second range to avoid spamming the viewer
                        setTimeout(function () {
                            build(data);
                        }, Math.floor(Math.random() * 10000));

                    }

                });
 
            }

            i++;
        }

    });
}
```

## Links to External Libraries
[Webgl Globe](https://github.com/dataarts/webgl-globe "Webgl Globe")
[Webgl Fireball](http://alteredqualia.com/three/examples/webgl_shader_fireball.html "Webgl FireBall")
[NASA Earth at Night - used as the planet texture](http://www.nasa.gov/mission_pages/NPP/news/earth-at-night.html)
[CORS-Anywhere by RobW](https://github.com/Rob--W/cors-anywhere)


## Images & Videos


![Virgin Earth - no transactions showing](https://raw.githubusercontent.com/craftfortress/devart-template/master/project_images/Capture0.jpg)

![earthBit showing nodes handling Bitcoin transactions](https://raw.githubusercontent.com/craftfortress/devart-template/master/project_images/Capture1.JPG)

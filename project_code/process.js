var mute = false;

//  GUI
$("#info").hover(
function () { $(this).addClass("Hover"); },
function () { $(this).removeClass("Hover"); }
);
$('#mutesounds').click(function () {
    mute = true; $('#mutesounds').attr("disabled", "disabled");
});
$('#info').click(function () {
    $('#myModal').reveal({
        animation: 'fadeAndPop',                   //fade, fadeAndPop, none
        animationspeed: 300,                       //how fast animtions are
        closeonbackgroundclick: true,              //if you click background will modal close?
        dismissmodalclass: 'close-reveal-modal'    //the class of a button or element that will close an open modal
    });
});


var tempData;
var count = 10;
var newQuakes = 0;
var interval;
var iplist = [];
function updateData() {

    $.getJSON('http://immense-reaches-7758.herokuapp.com/blockchain.info/unconfirmed-transactions?cors=true&format=json', function (data) {

        var value1 = 0;
        var value2 = 0;
        var i = 0;

        while (i < 10) {

            var ip = data.txs[i].relayed_by;
            var latitude = i;
            var longitude = i;


            console.log("CURRENT  IP " + ip);

            if (data.txs[i].out[0] != undefined)
                value1 = data.txs[i].out[0].value;

            if (data.txs[i].out[1] != undefined)
                value2 = data.txs[i].out[1].value;

            var totalspend = (value1 + value2) * 0.00000001;


            if (!iniplist(ip + totalspend)) {

                $.getJSON('http://immense-reaches-7758.herokuapp.com/freegeoip.net/json/' + ip, function (data) {

                    longitude = data.longitude;
                    latitude = data.latitude;

                    data = [latitude, longitude, totalspend];

                    if (longitude != 0 && latitude != 0) {

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

function iniplist(ip) {

    if (in_array(ip, iplist)) {

        return true;

    }
    else {
        iplist.push(ip);

        return false;
    }

}

function build(data) {

    /*  $.getJSON('http://www.corsproxy.com/labs.gmtaz.com/quake/json.php?count=22', function (data) {

         data = [
          "-21.3976",
          "68.5866",
          "4.5",
          "61.7727",
          "-150.9199",
          "1.8"
          ];

          */


    // alert(data["txs"]["double_spend"][0]);



    if (tempData != null) {
        var td = [];
        for (var i = 0; i < data.length ; i += 3) {
            var td0 = data[i];
            var td1 = data[i + 1];
            var td2 = data[i + 2];
            var add = true;
            for (var x = 0; x < tempData.length; x += 3) {
                add = true;
                if (td0 == tempData[x] &&
                    td1 == tempData[x + 1] &&
                    td2 == tempData[x + 2]) {
                    add = false;
                    break;
                }
            }
            if (add) {
                newQuakes++;
                $('#newQuakes').text(newQuakes).css({ color: '#66FFFF' })
                 .animate({
                     color: '#FFF'
                 }, 1200);
                tempData.push(td0, td1, td2);
                td.push(td0, td1, td2);
                globe.addData(td, { format: 'magnitude' });
                globe.createPoints();
            }
        }
    }
    else {
        tempData = data;
        globe.addData(tempData, { format: 'magnitude' });
        globe.createPoints();
    }


}
if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
} else {
    var container = document.getElementById('container');
    var xhr;
    $('.active').removeClass('active');
    $('#count20').addClass('active');
    count = 20;
    tempData = null;
    newQuakes = count;
    $('#newQuakes').text(newQuakes);
    globe = new DAT.Globe(container);
    globe.animate();
    updateData();
    if (interval)
        clearInterval(interval);
    interval = setInterval(function () {
        updateData();
    }, 10000);// 3000000);
}


function in_array(needle, haystack) {
    for (var key in haystack) {
        if (needle === haystack[key]) {
            return true;
        }
    }

    return false;
}

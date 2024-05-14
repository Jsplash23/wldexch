var pageOpen = new Date().getTime();
var elapsedTime = 0;

$(document).on('click', '.js-sendevent', function () {
    var x = {};

    var allData = $(this).data();
    $.each(allData, function (index) {
        if (index == "event") return;
        x[index] = allData[index];
        if (index == "opentime") {
            x[index] = pageOpen;
        }
        console.log(x);
    });
    sendEvent($(this).data('event'), x);
});

function sendEvent(eventName, hash) {
    hash.mode = 'ibEvent';
    hash.event = eventName;
    $.post('/service', hash, function (res) {
        //console.log(res);
    });
}

/*
function pageTimeSpended() {
    var closePage = new Date();
    var spentTime = closePage.getTime() - pageOpen.getTime();
    elapsedTime += spentTime;
    return elapsedTime / 1000;
}*/
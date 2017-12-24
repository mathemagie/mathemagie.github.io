var devices = [];

var dev;

var init = function() {
  var connectBtn = document.getElementById('connect');
  connectBtn.addEventListener('click', function(event) {
    findDevice().then(d => {
      dev = new LovesenseWebBluetooth(d);
      dev.open();
      devices.push(dev);
    });
  });

  var slider = document.getElementById('speed');
  slider.addEventListener('input', function(event) {
   // console.log(devices);
    devices.forEach(dev => {
      dev.vibrate(parseInt(slider.value,10));
    });
  });


// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('77379ee80f6901a0f5fa', {
  cluster: 'eu',
  encrypted: true
});

var channel = pusher.subscribe('my-channel');
channel.bind('my-event', function(data) {
  console.log(data.message);
  //dev.vibrate(parseInt(10,10));
   devices.forEach(dev => {
      dev.vibrate(parseInt(10,10));
    });
});

};



var formatTime = function (seconds) {
  var mins = ("0" + Math.floor(seconds/60)).slice(-2);
  var secs = ("0" + seconds % 60).slice(-2);
  return mins + ":" + secs;
};

var onEnterOrClick = function(enterTarget, clickTarget, callback) {
  var args = Array.prototype.slice.call(arguments, 3);
  enterTarget.on('keyUp', function (e) {
    if (e.keyCode == 13) {
      callback.apply(this, args);
    }
  });
  clickTarget.click(function() {
    callback.apply(this, args);
  });
};

var renderLanding = function() {
  var source = $("#landing_template").html();
  var template = Handlebars.compile(source);
  $('header').hide();
  $('#container').html(template());
  $('button').click(function() {
    $('header').show();
    renderHowToPlay();
  });
};

var renderHowToPlay = function() {
  var source = $("#howToPlay_template").html();
  var template = Handlebars.compile(source);
  $('#container').html(template());
  $('button').click(function() {
    $.get("/getCurrentItem?gender=" + (Math.random() < 0.5 ? "male" : "female"), renderHunt);
  });
};

var renderHunt = function(data) {
  data.time = 10;
  var source = $("#hunt_template").html();
  var template = Handlebars.compile(source);

  var target = targets[Math.floor(Math.random()*5)];
  var time = 5;

  var j_input = $('input');
  var j_button = $('button');
  var j_error = $('#error');
  var j_time = $('#time');

  $('#container').html(template(data));

  j_error.hide();
  j_time.text(formatTime(time));

  onEnterOrClick(j_input, j_button, function(guess, error) {
    $.post('/guess', {guess: j_input.val()}, function (correct) {

    });
    j_input.val('');
  });

  var countdown = setInterval(function() {
    time--;
    if (time === 0) {
      clearInterval(countdown);
      renderResult(false);
    } else {
      j_time.text(formatTime(time));
    }
  }, 1000);
};

var renderResult = function(win) {
  var source = $("#result_template").html();
  var template = Handlebars.compile(source);

  var time = 5;

  $('#container').html(template({
    winner: 'James Bond',
    place: 6,
    total_players:392,
    code: 'XLZ4KF'
  }));

  $('#time').text(formatTime(time));

  if (win) {
    $('.defeat').hide();
  } else {
    $('.victory').hide();
  }

  $('button').click(function() {
    clearInterval(countdown);
    renderHunt();
  });

  var countdown = setInterval(function() {
    time--;
    if (time === 0) {
      clearInterval(countdown);
      $.get("/getCurrentItem?gender=" + (Math.random() < 0.5 ? "male" : "female"), renderHunt);
    } else {
      $('#time').text(formatTime(time));
    }
  }, 1000);
};

$(document).on('ready', function(){
  renderLanding();
});
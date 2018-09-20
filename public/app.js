/* eslint-disable */
$(function(){
  var dates = document.getElementsByClassName("longdate");
  for(var i = 0; i < dates.length; i++) {
    var elem = dates.item(i).textContent;
    var date = moment(Number(elem)).fromNow();
    dates.item(i).innerHTML = date;
  }

  if($("#content").length) {
    new SimpleMDE({ element: $("#content")[0] });
  }
  if($("#new-comment").length) {
    new SimpleMDE({ element: $("#new-comment")[0] });
  }

  // https://stackoverflow.com/questions/948172/password-strength-meter
  function scorePassword(pass) {
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = new Object();
    for (var i=0; i<pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);
  }


  function checkPassStrength(pass) {
    var score = scorePassword($("#password").val());
    $("#password-strength-meter").width(Math.min(score, 100)+"%");
    if(score > 80) {
      $("#password-strength-meter").css("background-color", "green");
      $("#password-strength-text").css("color", "green");
      $("#password-strength-text").text("Strong");
    } else
    if(score > 60) {
      $("#password-strength-meter").css("background-color", "#ff9000");
      $("#password-strength-text").css("color", "#ff9000");
      $("#password-strength-text").text("Kind of okay");
    } else
    if(score >= 30) {
      $("#password-strength-meter").css("background-color", "red");
      $("#password-strength-text").css("color", "red");
      $("#password-strength-text").text("Weaksauce");
    }
  }

  $("#password").on('keyup paste', checkPassStrength)

});
/* eslint-enable */

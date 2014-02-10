// Generated by CoffeeScript 1.4.0

jQuery(function() {
  var counter, firstTime, updateCount, votesCount;
  counter = null;
  firstTime = true;
  votesCount = 0;
  updateCount = function() {
    var _this = this;
    return $.ajax({
      url: '/stats/votes-count',
      type: 'GET',
      success: function(data) {
        var response;
        response = JSON.parse(data);
        votesCount = response['votes_count'];
        if (counter !== null) {
          if (firstTime) {
            counter.add(Math.floor(votesCount / 100) * 100);
            firstTime = false;
          }
          return counter.incrementTo(votesCount);
        }
      }
    });
  };
  updateCount();
  counter = new flipCounter('flip-counter', {
    value: 0,
    inc: 1,
    pace: 100,
    auto: true
  });
  setInterval(updateCount, 10000);
  return counter.incrementTo(votesCount);
});
(function() {
  var InformationForm, endDate, endTime, startDate, startTime;

  startDate = null;

  endDate = null;

  startTime = null;

  endTime = null;

  jQuery(function() {
    var informationForm;
    informationForm = new InformationForm();
    return $.ajax({
      url: '/admin/organization/election/information',
      type: 'POST',
      success: function(data) {
        var response;
        response = JSON.parse(data);
        if (response['status'] === 'ERROR') {
          console.log('User not authorized');
          return;
        }
        if (response['election']) {
          console.log(response['election']);
          informationForm.setFromJson(response['election']);
          return informationForm.resetSubmitBtn();
        }
      },
      error: function(data) {
        return console.log('Unknown Error');
      }
    });
  });

  InformationForm = function() {
    var item, picker, self, _i, _j, _len, _len2, _ref, _ref2,
      _this = this;
    self = this;
    this.id = "";
    this.name = $('#name');
    this.startDate = $('#startDate').datepicker().on('changeDate', function(ev) {
      var newDate;
      if (ev.date.valueOf() > _this.endDate.date.valueOf()) {
        newDate = new Date(ev.date);
        _this.endDate.setValue(newDate);
      }
      _this.startDate.hide();
      _this.resetSubmitBtn;
      return _this.endDate.show();
    }).data('datepicker');
    startDate = this.startDate;
    this.endDate = $('#endDate').datepicker().on('changeDate', function(ev) {
      _this.endDate.hide();
      return _this.resetSubmitBtn;
    }).data('datepicker');
    endDate = this.endDate;
    $('#startTime, #endTime').timepicker({
      minuteStep: 5,
      defaultTime: 'current',
      template: 'dropdown'
    });
    this.startTime = $('#startTime');
    startTime = this.startTime;
    this.endTime = $('#endTime');
    endTime = this.endTime;
    this.resultDelay = $('#result-delay');
    this.universal = $('#universal-election');
    this.submitBtn = $('#election-submit');
    this.submitBtn.click(function() {
      var postData;
      if (self.submitBtn.hasClass('disabled')) return false;
      postData = self.toJson();
      if (!postData) return false;
      self.submitBtn.addClass('disabled');
      $.ajax({
        url: '/admin/organization/election/information/update',
        type: 'POST',
        data: {
          'formData': JSON.stringify(postData)
        },
        success: function(data) {
          var response;
          response = JSON.parse(data);
          self.setFromJson(response['election']);
          self.setSubmitBtn('btn-success', response['msg']);
          return self.submitBtn.addClass('disabled');
        },
        error: function(data) {
          return self.setSubmitBtn('btn-danger', 'Error');
        }
      });
      return true;
    });
    InformationForm.prototype.toJson = function() {
      var json, key, value;
      json = {
        'name': this.getName(),
        'times': this.getTimes(),
        'result_delay': this.getResultDelay(),
        'universal': this.isUniversal()
      };
      for (key in json) {
        value = json[key];
        if (value === null) return null;
      }
      return json;
    };
    InformationForm.prototype.setFromJson = function(json) {
      var delay, end, now, start;
      if (!json) return;
      this.id = json['id'];
      this.name.val(json['name']);
      start = new Date(json['times']['start'] + ' UTC');
      end = new Date(json['times']['end'] + ' UTC');
      now = new Date();
      startTime = start.toLocaleTimeString();
      endTime = end.toLocaleTimeString();
      this.startDate.setValue(start);
      if (now.valueOf() > start.valueOf()) {
        this.startDate.onRender = function(date) {
          return 'disabled';
        };
      }
      this.startDate.update();
      this.endDate.setValue(end);
      if (now.valueOf() > end.valueOf()) {
        this.endDate.onRender = function(date) {
          return 'disabled';
        };
      }
      this.endDate.update();
      this.startTime.timepicker('setTime', startTime);
      this.endTime.timepicker('setTime', endTime);
      delay = json['result_delay'];
      if (!$("#result-delay option[value=" + delay + "]")) {
        this.resultDelay.append("<option id='custom' value='" + delay + "'>" + delay + "</option>");
      }
      this.resultDelay.val(delay).change();
      return this.universal.attr('checked', json['universal'] === true);
    };
    InformationForm.prototype.resetSubmitBtn = function() {
      var text;
      text = 'Create Election';
      if (self.id) text = 'Update Election';
      self.setSubmitBtn('btn-primary', text);
      return self.submitBtn.removeClass('disabled');
    };
    InformationForm.prototype.setSubmitBtn = function(type, text) {
      self.restoreDefaultButtonState();
      this.submitBtn.addClass(type);
      return this.submitBtn.text(text);
    };
    InformationForm.prototype.restoreDefaultButtonState = function() {
      this.submitBtn.removeClass('btn-success');
      this.submitBtn.removeClass('btn-danger');
      return this.submitBtn.removeClass('btn-primary');
    };
    InformationForm.prototype.getName = function() {
      var nameContainer;
      nameContainer = this.name.parent().parent();
      nameContainer.removeClass('error');
      $('.errorMsgName').remove();
      if (!this.name.val()) {
        nameContainer.addClass('error');
        $("<span class='help-inline errorMsgName'>Please enter election " + "name.</span>").insertAfter(this.name);
        return null;
      }
      return this.name.val();
    };
    InformationForm.prototype.getTimes = function() {
      var end, endDateInput, errorMsg, field, start, startDateInput, timeContainer, _i, _len, _ref;
      timeContainer = $('#startDate').parent().parent();
      startDateInput = this.startDate.element.children().filter('input');
      endDateInput = this.endDate.element.children().filter('input');
      errorMsg = '';
      _ref = [startDateInput, endDateInput, this.startTime, this.endTime];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        if (!field.val()) errorMsg = 'Missing information.';
      }
      if (!errorMsg) {
        start = new Date("" + (startDateInput.val()) + " " + (this.startTime.val())).valueOf();
        end = new Date("" + (endDateInput.val()) + " " + (this.endTime.val())).valueOf();
        start /= 1000;
        end /= 1000;
        console.log('Start time ' + start + '/ End time: ' + end);
        if (start > end) errorMsg = 'Start time is later than end time.';
        if (start === end) errorMsg = 'Start time is the same as end time.';
        if (!this.id && (new Date()).valueOf() / 1000 > start) {
          errorMsg = 'Start time is in the past.';
        }
      }
      if (errorMsg) {
        timeContainer.addClass('error');
        $('.errorMsgTime').remove();
        this.startDate.element.parent().append("<span class='help-inline " + ("errorMsgTime'>" + errorMsg + "</span>"));
        return null;
      } else {
        timeContainer.removeClass('error');
        $('.errorMsgTime').remove();
        return {
          'start': start,
          'end': end
        };
      }
    };
    InformationForm.prototype.getResultDelay = function() {
      return parseInt(this.resultDelay.val());
    };
    InformationForm.prototype.isUniversal = function() {
      return this.universal.attr('checked') === 'checked';
    };
    _ref = [this.name, this.resultDelay, this.universal];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      item.change(this.resetSubmitBtn);
    }
    _ref2 = [this.startTime, this.endTime];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      picker = _ref2[_j];
      picker.timepicker().on('changeTime.timepicker', this.resetSubmitBtn);
    }
  };

}).call(this);

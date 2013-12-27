/**
 * Created by mk
 * Date: 8/15/13
 * Time: 10:45 AM
 */
var TaskViewModel = function (d, root) {
  var self = this,
    //OutDateFormat = "DD/MMM/YYYY (HH:mm)",
    OutDateFormat = "MM/DD/YYYY",
    data = d || {},
    full_day_len = 24,
    work_day_len = 8,
    free_day_part = 8,
    work_day_start_at = 8,
    convertToHours = function (val) {
      var
        calendar = root.getCalendar(),
        match_d = val.match(/\d+/gi),
        match_c = val.match(/[hd]/gi),//[hdm]
        unit = match_c[0],
        duration = parseInt(match_d[0], 10),
        reminder,
        int_val,
        res = 0,
        weekendCounter = 0,
        reminderCalculate = function (duration) {
          reminder = self._start().hours() + duration - work_day_start_at - work_day_len;
          if (reminder > 0) {
            return free_day_part + work_day_start_at + duration;
          } else {
            return duration;
          }
        };

      switch (unit) {
        case 'd':
          res = reminderCalculate(work_day_len)+(duration - 1) * full_day_len;
          break;
        case 'm'://Depricated!!!
          res = duration * full_day_len * 28;//TODO calculate month
          break;
        case 'h':
          if (duration <= work_day_len) {
            res = reminderCalculate(duration);
          } else {
            reminder = duration % work_day_len;
            int_val = duration / work_day_len | 0;
            res = int_val * full_day_len;
            res += reminderCalculate(reminder)
          }
          break;
        default :
          return duration;
      }
      for (var i = 1, j = res / 24 | 0; i <= j; i++) {
        if (self._start().clone().add('days', i).weekday() == 6) weekendCounter += 2;
      }
      return res + weekendCounter * full_day_len;
    },
    calculateDuration = function (start, finish) {
      var calendar = root.getCalendar(),
        st = start || self._start(),
        fh = finish || self._finish(),
        s = st.dayOfYear(),
        f = fh.dayOfYear(),
        ds = st.hours() - work_day_start_at,
        df = work_day_start_at + work_day_len - fh.hours(),
        res = 0;
      for (; s <= f; s++) {
        res = calendar[s].weekend ? res : res + 1;
      }

      if (ds || df) {
        if ((res * 8 - ds - df) % 8 == 0) {

        } else {

        }
      }
      return ds || df
        ? (res * 8 - ds - df) % 8 == 0
        ? (res * 8 - ds - df) / 8 + 'd'
        : res * 8 - ds - df > 0
        ? res * 8 - ds - df + 'h'
        : res * 8 - ds - df + 8 + 'h'
        : res + 'd';
    };
  this.id = data.id || '';
  this.parentId = data.parentId || '';

  this.note = ko.observable(data.note || '');
  this.name = ko.observable(data.name || '');

  this.paper = null;

  this.level = ko.observable(data.level || 0);
  this.hasChild = ko.observable(data.hasChild || false);
  this.isCollapsed = ko.observable(false);
  this.isHidden = ko.observable(false);

  this.isFlow = ko.observable(false);
  this.isMilestone = ko.observable(false);

  this._predecessor = data.predecessor || [];
  this.predecessor = ko.observableArray(data.predecessor || []);
  this.predecessorTasks = ko.observableArray();
  this.successor = [];

  this.resources = ko.observableArray(data.resources || '');

//view
  this.isDirty = ko.observable(data.duration || data.note || data.name || data.resources || data.predecessor);
  this.selected = ko.observable(false);


  this.duration = ko.observable(data.duration || '');
  this._start = ko.observable(data._start ? moment(data._start):'');
  this._finish = ko.observable(data._finish ? moment(data._finish):'');

  this.initPredecessors = function(){
    var redraw = false;
    if(this.predecessor().length){
      $.each(self.predecessor(),function(k,taskIds){
        self.predecessorTasks.push(root.tasks()[taskIds-1]);
      });
      redraw = true;
    }

    if(data.successor && data.successor.length){
      $.each(data.successor,function(k,taskIds){
        self.successor.push(root.tasks()[taskIds-1]);
      });
      redraw = true;
    }
    if(redraw)  self.callRedraw();
  };


  this.predecessorIds = ko.computed(function(){
    var res = [];
    $.each(self.predecessorTasks(),function(k,task){
      res.push(task.id);
    });
    return res.join(', ');
  },this);

  this.start = ko.computed({
    read:function () {
      return self._start().format
        ? self._start().format(OutDateFormat)
        : '';
    },
    write:function (val) {
      if(!val){
        val = moment().hours(work_day_start_at).minutes(0);
      }
      if (val.hours() >= work_day_start_at + work_day_len) {
        val.add('hours', free_day_part + work_day_start_at);
      }
      if (val.weekday() == 6) {
        val.add('days', 2);
      }
      if (val.weekday() == 0) {
        val.add('days', 1);
      }

      if (self.hasChild()) {
        $.each(root.tasks(), function (k, task) {
          if (task.parentId == self.id && task.predecessorTasks().length == 0) {
            task.start(val);
          }
        });
      } else {
        self._start(val);
        self._finish(val.clone().add('hours', convertToHours(self.duration())));
      }

      self.callRedraw();
    },
    owner:this
  });

  this.finish = ko.computed({
    read:function () {
      return self._finish().format
        ? self._finish().format(OutDateFormat)
        : '';
    },
    write:function (val) {
      self._finish(val);
      self.callRedraw();
    },
    owner:this
  });

  this.duration.subscribe(function (val) {
    if ((/^\d+[hd]$/gi).test(val)) {//[hdm]
      if (!self._start()) {
        //set start NOW and finish == NOW + duration
        self.start((new moment()).hours(work_day_start_at).minutes(0));
      } else {
        self.start(self._start());
      }
    } else {
      var match_d = val.match(/\d+/gi);
      self.duration(match_d ? match_d[0] + 'd' : '1d');
    }
    self.callRedraw();
  });

  this.getStartInHours = function () {
    var calendar = root.getCalendar();
    return self._start().dayOfYear ? calendar[self._start().dayOfYear()].dayOnGrid * full_day_len + self._start().hours() : 0;
  };
  this.getFinishInHours = function () {
    var calendar = root.getCalendar();
    return self._finish().dayOfYear ? calendar[self._finish().dayOfYear()].dayOnGrid * full_day_len + self._finish().hours() : 0;
  };

  this.childChanged = function (val) {
    self.hasChild(val);

    if (self.predecessorTasks().length) {
      $.each(self.predecessorTasks(), function (k, task) {
        task.removeSuccesor(self);
        self.removePredecessor(task);
      });
    }
    if (self.successor.length) {
      $.each(self.successor, function (k, task) {
        self.removeSuccesor(task);
        task.removePredecessor(self);
      });
    }

    var
      maxDate,
      minDate;
    $.each(root.tasks(), function (idx, task) {
      if (task.parentId == self.id) {
        if (!maxDate)maxDate = task._finish();
        if (!minDate)minDate = task._start();
        maxDate = task._finish() > maxDate ? task._finish() : maxDate;
        minDate = task._start() < minDate ? task._start() : minDate;
      }
    });
    if(minDate && maxDate){
      self._start(minDate.clone());
      self._finish(maxDate.clone()); /// it's fix problem when children call repaint parent
      self.duration(calculateDuration(minDate, maxDate));
    }
    self.callRedraw();
  };

  this.savePredecessor = function(){
    //TODO test recursion (task1 ---> task2 ---> task3 -x-> task1);
    //TODO parent can't be predecessor
    var predTask;
    self._predecessor = self.predecessor();
    $.each(self.predecessorTasks(), function(k,task){
      task.removeSuccesor(self);
    });
    self.predecessorTasks.removeAll();
    $.each(self._predecessor, function(k,taskId){
      predTask = root.tasks()[taskId-1];
      self.predecessorTasks.push(predTask);
      predTask.addSuccesor(self);
      self.start(predTask._finish().clone());
    });
    self.callRedraw();
  };

  this.resetPredecessor = function(){
    self.predecessor(self._predecessor);
    self.callRedraw();
  };


  this.addSuccesor = function(task){
    var taskIdx = -1;
    $.each(self.successor, function(k,_task){
      if(task.id == _task.id){
        taskIdx = k;
      }
    });
    if(taskIdx ==- 1){
      self.successor.push(task);
    }
  };

  this.removeSuccesor = function(task){
    var taskIdx = -1;
    $.each(self.successor, function(k,_task){
      if(task.id == _task.id){
        taskIdx = k;
      }
    });
    if(taskIdx > -1){
      self.successor.splice(taskIdx,1);
    }
  };

  this.removePredecessor = function(task){
    var _pred = [];
    self.predecessorTasks.remove(task);
    $.each(self.predecessorTasks(),function(k,task){
      _pred.push(task.id);
    });
    self._predecessor = _pred;
    self.predecessor(_pred);
  };

  this.predecessorTasks.subscribe(function(val){
    if(val.length == 0){
      self.start(null);
    }
  });

  this.note.subscribe(function (val) {
    if (val) self.isDirty(true);
  });
  this.name.subscribe(function (val) {
    if (val) self.isDirty(true);
  });
  this.resources.subscribe(function (val) {
    if (val) {
      self.isDirty(true);
      self.callRedraw();
    }
  });
  this.isDirty.subscribe(function (val) {
    if (val) {
      root.markPrev(self);
      self.callRedraw();
    }
  });

  this.createPaper = function(){
    self.paper = new DiagramElement(self.id-1, self, root.canvas, root);
  };

  this.callRedraw = function () {
    if (self.timeId)clearTimeout(self.timeId);
    self.timeId = setTimeout(function () {
      if(!self.paper){
        self.createPaper();
      }

      if(self.parentId){
        root.tasks()[self.parentId-1].childChanged(true);
      }
      if (self.successor.length) {
        $.each(self.successor,function(i,_task){
          _task.start(self._finish().clone());
        });
      }
      if (self._start() && self._finish()) {
        self.paper.redraw(self.id - 1, self);
      }
    }, 30);
  }
};

TaskViewModel.prototype = {
  levelUp:function () {
    this.level(this.level() + 1);
  },
  levelDown:function () {
    if (this.level() > 0)this.level(this.level() - 1);
  },
  outResources:function () {
    var self = this;
    //console.log(arguments);
    return '';
  },
  toJSON:function () {
    return {
      id:ko.utils.unwrapObservable(this.id),
      parentId:ko.utils.unwrapObservable(this.parentId),
      hasChild:ko.utils.unwrapObservable(this.hasChild),
      level:ko.utils.unwrapObservable(this.level),

      note:ko.utils.unwrapObservable(this.note),
      name:ko.utils.unwrapObservable(this.name),
      duration:ko.utils.unwrapObservable(this.duration),
      _start:ko.utils.unwrapObservable(this._start).format(),
      _finish:ko.utils.unwrapObservable(this._finish).format(),

      predecessor:ko.utils.unwrapObservable(function(pred){
        var a = [];$.each(pred,function(k,v){a.push(v.id)});return a;
      }(this.predecessorTasks())),
      successor:ko.utils.unwrapObservable(function(succ){
        var a = [];$.each(succ,function(k,v){a.push(v.id)});return a;
      }(this.successor)),
      resources:ko.utils.unwrapObservable(this.resources)
    };
  }
};



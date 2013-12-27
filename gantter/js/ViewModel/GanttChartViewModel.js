/**
 * Created by mk
 * Date: 8/6/13
 * Time: 12:00 PM
 */
var GanttChartViewModel = function (data, app) {
  var
    self = this,
    tasks = [],
    //min range 42 days
    minTaskDate = moment().startOf('week').clone().subtract('w',1),
    maxTaskDate = minTaskDate.clone().add('w',6).endOf('week'),//TODO add 18 week
    resources = [],
    selectedIds = [],
    calendarHeaders = [],
    calendar = {},
    i,j, k, l, startWithTheDayOfTheYear,
    _createTask = function(data){
      return new TaskViewModel(data || {},self);
    },
    _inserTask = function(data){
      var new_task = _createTask(data);
      self.tasks.splice(data.id-1,0,new_task);
      self.recalculateTasks();
    },
    _clearSelection = function () {
      ko.utils.arrayForEach(self.tasks(), function (item) {
        item.selected(false);
      });
      selectedIds = [];
    };

  //console.log(maxTaskDate.format(),' if 2013 -> 2014 Error');

  if (data && data.tasks && data.tasks.length) {
    for (i = 0, j = data.tasks.length > 40 ? data.tasks.length : 40; i < j; i++) {
      if(data.tasks[i]){
        var
          start,finish, tempFinish;
        start = new moment(data.tasks[i].start);
        finish = new moment(data.tasks[i].finish);

        minTaskDate =  minTaskDate > start ? start : minTaskDate;
        minTaskDate.startOf('week');
        tempFinish = minTaskDate.clone().add('w',6).endOf('week');
        maxTaskDate = tempFinish < finish ? finish : tempFinish;
      }
      tasks.push(_createTask(data.tasks[i] || {id:i + 1}));
    }
  } else {
    for (i = 0, j = 40; i < j; i++) {
      tasks.push(_createTask({id:i + 1}));
    }
  }

  for(i = startWithTheDayOfTheYear = minTaskDate.dayOfYear(), j = maxTaskDate.dayOfYear(); i<=j;i++ ){
    k = moment().dayOfYear(i);
    var dayOfWeek = k.format('e');
    calendar[i] = {
      weekend: dayOfWeek == 0 || dayOfWeek == 6,
      dayofweek: dayOfWeek,
      dayOnGrid: i - startWithTheDayOfTheYear
    };
    if(dayOfWeek == 0){
      l = k.format('MMM')+' '+k.format('D')+' - ';
    }
    if(dayOfWeek == 6){
      l += k.format('MMM')+' '+k.format('D')+"'"+k.format('YY');
      calendarHeaders.push(l);
    }
  }

  this.currentTab = '';
  this.tasks = ko.observableArray(tasks);
  this.resources = ko.observableArray(resources);
  this.selectedTask = ko.observable(null);
  this.calendarHeaders = calendarHeaders;

  this.getCalendar = function(){
    return calendar;
  };

  self.canvas = Raphael("sidebar_grid_svg", calendarHeaders.length*168, self.tasks().length*23);
  self.canvas
    .path('M '+(moment().startOf('day').dayOfYear()-startWithTheDayOfTheYear*24)+' 0 V'+self.tasks().length*23)
    .attr({fill:"none",stroke:"#00ff00"}).toFront();

  if(self.tasks().length){
    $.each(self.tasks(),function(k,task){
      task.createPaper();
    });
    $.each(self.tasks(),function(k,task){
      task.initPredecessors();
    });
  }


  this.showSettings = function () {
    self.currentTab = '';
    self.openSettings();
  };

  this.taskCollapse = function (task) {
    var isCollapsed = task.isCollapsed(),
      taskParent;
    for(var i= task.id|0,j=self.tasks().length;i<j;i+=1){
      if(self.tasks()[i].level() > task.level()){
        taskParent = self.tasks()[self.tasks()[i].parentId-1];
        if(!taskParent.isCollapsed() || taskParent == task){
          self.tasks()[i].isHidden(!isCollapsed);
        }
      }else{
        break;
      }
    }
    task.isCollapsed(!isCollapsed);
  };

  this.showPredecessorSettings = function (task, event) {
    if (event.shiftKey || event.ctrlKey) {
      return true;
    } else {
      self.selectRow(task, event);
      self.currentTab = SETTINGS_TABS[2];
      self.openSettings();
      return false;
    }

  };

  this.showResourcesSettings = function (task, event) {
    if (event.shiftKey || event.ctrlKey) {
      return true;
    } else {
      self.selectRow(task, event);
      self.currentTab = SETTINGS_TABS[1];
      self.openSettings();
      return false;
    }

  };

  this.openSettings = function () {
    if (selectedIds.length == 1) {
      var task = self.tasks()[selectedIds[0]];
      self.selectedTask(ko.utils.unwrapObservable(task.isDirty) ? task : null);
    }
  };

  this.rowKeyPress = function (root, e) {
    if (selectedIds.length == 0) return true;
    var
      taskIdx = selectedIds[0],
      task = self.tasks()[taskIdx],
      _selectTask = function (idx) {
        var task = self.tasks()[idx];
        _clearSelection();
        task.selected(true);
        selectedIds.push(idx);
        if (selectedIds.length == 1 && task.isDirty()) {
          app.toolbar.settingsButton.button("option", "disabled", false);
          app.toolbar.udtButton.button("option", "disabled", false);
          app.toolbar.idtButton.button("option", "disabled", false);
        } else {
          app.toolbar.settingsButton.button("option", "disabled", true);
          app.toolbar.udtButton.button("option", "disabled", true);
          app.toolbar.idtButton.button("option", "disabled", true);
        }
      },
      jQel = e.keyCode ? $(e.target) : null,
      canvas = $('#canvas');
    /*
     * 13 - Enter (down)
     * 37 - left (scroll left)
     * 38 - up
     * 39 - right (scroll right)
     * 40 - down
     * */
    switch (e.keyCode) {
      case 13:
      case 40:
        if (task.id != self.tasks().length) {
          _selectTask(taskIdx + 1);
          jQel.closest('tr').next().find('input.text:eq(' + jQel.data('npp') + ')').focus();
        }
        if (!task.duration() && task.name())task.duration('1d');
        canvas.trigger("synchronizeColumns");
        return false;
      case 38:
        if (taskIdx) {
          _selectTask(taskIdx - 1);
          jQel.closest('tr').prev().find('input.text:eq(' + jQel.data('npp') + ')').focus();
        }
        if (!task.duration() && task.name())task.duration('1d');
        canvas.trigger("synchronizeColumns");
        return false;
      default :
        if (selectedIds.length > 1) {
          _selectTask(taskIdx);
        }
        return true;
    }
  };
  this.focusOutRow = function(task, event){
    setTimeout(function(){
      if (!task.duration() && task.name() && $.inArray(task.id-1, selectedIds)== -1){
        console.log("task.duration('1d');");
        task.duration('1d');
      }
    },100);

  };

  this.focusRow = function (task, event) {
    /*if(event.shiftKey || event.ctrlKey){

    }else{
      if(selectedIds.length && $.inArray(task.id-1, selectedIds) == -1){
        self.selectRow(task,event);
      }
    }*/
    return true;
  };

  this.selectRow = function (task, event) {

    var taskIdx = self.tasks.indexOf(task);

    if (event.shiftKey && selectedIds.length) {
      var
        minIdx = Math.min.apply(Math, selectedIds),
        min = minIdx < taskIdx ? minIdx : taskIdx,
        max = minIdx > taskIdx ? minIdx : taskIdx;

      selectedIds = [];

      $.each(self.tasks(), function (i, item) {
        if (i >= min && i <= max) {
          item.selected(true);
          selectedIds.push(i);
        } else {
          item.selected(false);
        }
      });
    } else {
      if (!event.ctrlKey) {
        _clearSelection();
        selectedIds.push(taskIdx);
        task.selected(true);
      } else {
        task.selected(!task.selected());
        if (task.selected()) {
          selectedIds.push(taskIdx);
        } else {
          selectedIds.splice($.inArray(taskIdx, selectedIds), 1);
        }
      }

    }
    app.toolbar.deleteButton.button("option", "disabled", selectedIds.length == 0);
    app.toolbar.insertAvButton.button("option", "disabled", selectedIds.length == 0);
    app.toolbar.insertBwButton.button("option", "disabled", selectedIds.length == 0);
    app.toolbar.deleteButton.button("option", "disabled", selectedIds.length == 0);

    app.toolbar.settingsButton.button("option", "disabled", true);
    app.toolbar.udtButton.button("option", "disabled", !task.isDirty());
    app.toolbar.idtButton.button("option", "disabled", !task.isDirty());
    if (selectedIds.length == 1 && task.isDirty()) {
      app.toolbar.settingsButton.button("option", "disabled", false);
      app.toolbar.udtButton.button("option", "disabled", false);
      app.toolbar.idtButton.button("option", "disabled", false);
    }

    return true;
  };

  this.deleteSelected = function () {
    app.dialog.msgbox(
      MSGBOX_TYPE_.YES_NO,
      MSGBOX_MESSAGES['deleteRow'].title,
      MSGBOX_MESSAGES['deleteRow'].text,
      function (r) {
        if (r == 1) {//YES
          var
            i = 0,
            deletedLen = selectedIds.length,
            dellArr = [],
            newArr = [];

          ko.utils.arrayForEach(selectedIds, function (id) {
            dellArr.push(self.tasks()[id]);
          });
          ko.utils.arrayForEach(dellArr, function (task) {
            var removed = 0;
            if(task.successor.length){
              $.each(task.successor, function(k,_task){
                _task.predecessorTasks.remove(task);
              });
            }
            if(task.predecessorTasks().length){
              $.each(task.predecessorTasks(), function(k,_task){
                _task.removeSuccesor(task);
              });
            }
            task.paper.remove();
            self.tasks.remove(task);
            newArr.push(_createTask());
          });
          self.recalculateTasks();
          self.tasks.pushAll(newArr);
        }
      });
  };

  this.recalculateTasks = function(){
    $.each(self.tasks(),function(key,task){
      if(task.isDirty()){
        if(task.predecessorTasks().length == 0){
          task.start(null);
        }
        task.id = key+1;
      }
    });
    $.each(self.tasks(),function(key,task){
      if(task.isDirty()){
        var pred = [];
        task.predecessorTasks.valueHasMutated();

        $.each(task.predecessorTasks(),function(k,_task){
          pred.push(_task.id+'');
        });
        task._predecessor = pred;
        task.predecessor(pred);
        task.callRedraw();
      }
    });
  };

  this.unindentTasks = function () {
    $.each(selectedIds, function (k, idx) {
      self.levelDownTask(idx);
    });
  }

  this.indentTasks = function () {
    var
      parent;
    $.each(selectedIds, function (k, idx) {
      if (idx > 0) {
        for (var i = idx - 1; i >= 0; i -= 1) {
          if (self.tasks()[idx].level() > 0 && self.tasks()[i].level() < self.tasks()[idx].level()
            || self.tasks()[i].level() == self.tasks()[idx].level()) {
            parent = self.tasks()[i];
            break;
          }
        }
        self.levelUpTask(idx, parent);
      }
    });
  };

  this.levelUpTask = function (idx, par) {
    var parent = par ? par : self.tasks()[idx - 1];
    var task = self.tasks()[idx];
    task.level(parent.level() + 1);
    task.parentId = parent.id;
    parent.childChanged(true);
    if (task.hasChild()) {
      for (var i = 0, j = self.tasks().length; i < j; i += 1) {
        if(self.tasks()[i].parentId == task.id){
          self.levelUpTask(i, task);
        }
      }
    }
  };
  this.levelDownTask = function (idx) {
    var
      prev = idx > 0 ? self.tasks()[idx - 1] : null,
      task = self.tasks()[idx],
      next = self.tasks()[idx+1]?self.tasks()[idx+1] : null,
      parentIdx = task.parentId ? task.parentId-1:null,
      parent = parentIdx !== undefined ? self.tasks()[parentIdx] : null;
    var
      i = 0,
      j = j = self.tasks().length;

    if (task.hasChild()) {
      task.levelDown();
      task.parentId = parent ? parent.parentId : null;
      for (i = 0; i < j; i += 1) {
        if (self.tasks()[i].parentId == task.id && $.inArray(i,selectedIds) == -1) {
          self.levelUpTask(i, task);
        }
      }
    } else {
      task.levelDown();
      if (next && next.level() > task.level()){
        for (i = idx+1; i < j; i += 1) {
          if (self.tasks()[i].parentId == task.parentId && $.inArray(i,selectedIds) == -1) {
            self.tasks()[i].parentId = task.id;
            task.childChanged(true);
          }else{
            break;
          }
        }
      }
      task.parentId = parent ? parent.parentId : null;
    }

    if(prev && prev.level() == task.level()){
      for (i = 0; i < j; i += 1) {
        if (self.tasks()[i].parentId == prev.id) {
          console.log(self.tasks()[i].name(), 'OIIACHOCTE!!!');//<-- will newer happen
        }
      }
      prev.childChanged(false);
    }
    parent && parent.childChanged(parent.hasChild());
  };

  this.insertAbove = function(){
    if(selectedIds.length){
      var
        selected_task_idx = selectedIds[0],
        selected_task = self.tasks()[selected_task_idx],
        new_task_data = {
          id:selected_task_idx+1,
          duration:'1d',
          parentId:selected_task.parentId,
          level: selected_task.level()
        };
      if(selected_task.hasChild()){
        $.each(self.tasks(),function(k,task){
          if(task.parentId == selected_task.id){
            task.parentId +=1;
          }
        });
      }
      _inserTask(new_task_data);
    }
  };

  this.insertBelow = function(){
    if(selectedIds.length){
      var
        selected_task_idx = selectedIds[0],
        selected_task = self.tasks()[selected_task_idx],
        new_task_data = {
          id:selected_task_idx+2,
          duration:'1d',
          parentId:selected_task.parentId,
          level: selected_task.level()
        };
        if(selected_task.hasChild()){
          new_task_data.parentId = selected_task.id;
          new_task_data.level +=1;
        }
        _inserTask(new_task_data);
    }
  };

  this.markPrev = function (task) {
    var idx = task.id - 2;
    //if(!task.paper.x)task.paper = new DiagramElement(idx+1,task,app.canvas,self);
    if (idx > -1 && !self.tasks()[idx].isDirty())self.tasks()[idx].isDirty(true);
  };

  this.getDirtyTasks = function () {
    var tasks = [];
    ko.utils.arrayForEach(this.tasks(), function (task) {
      if (task.isDirty()) tasks.push(task)
    });

    return tasks;
  };
};

GanttChartViewModel.prototype.toJSON = function () {
  var tasks = [];
  ko.utils.arrayForEach(this.tasks(), function (task) {
    if (task.isDirty() && task.id) tasks.push(task.toJSON());
  });
  return {
    tasks:tasks
  };
};
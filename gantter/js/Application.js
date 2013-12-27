/*
 * TODO - shift+up; shift+down - select/deselect rows
 * TODO - UIdialog title; UIdialog top position
 * TODO - Recalculate parent Childs after DELETING
 * */
var GanttChartApp = {};

GanttChartApp.Application = Class.extend({
  NAME:"GanttChartApp.Application",
  init:function () {
    var self = this;

    this.rootModel = {};

    // layout FIRST the body
    this.appLayout = $('#content').layout({
      default:{
        paneSelector:".ui-west-content"
      },
      north:{
        resizable:false,
        closable:false,
        paneSelector:'#miniheader',
        //size: 119
        size:38
      },
      east:{
        resizable:true,
        closable:false,
        resizeWhileDragging:true,
        paneSelector:"#sidebar",
        slidable:true,
        collapsable:true,
        tooglerable:true,
        /*initClosed:true,*/
        size:400
      },
      center:{
        resizable:false,
        closable:true,
        resizeWhileDragging:true,
        paneSelector:"#canvas",
        onresize_end:function () {
          self.onResize();
        }
      }
    });

    this.toolbar = new GanttChartApp.Toolbar("toolbar", this);
    this.dialog = new GanttChartApp.DialogController();
  },

  layout:function () {
    this.appLayout.resizeAll();
  },

  onResize:function () {

  },


  load:function (preload, postload) {
    var
      self = this,
      __getDataFunction = function(callback){
        var data = localStorage.getItem('ganttChart');
        if(data)data = JSON.parse(data);
        callback(data);
      };

    preload && preload();

    __getDataFunction(function(data){
      self.rootModel = new GanttChartViewModel({}, self);
      ko.applyBindings(self.rootModel);
      postload && postload();
    });

  },

  save:function () {
    var  json = JSON.stringify(this.rootModel.toJSON());
    localStorage.setItem('ganttChart',json);
  },
  close:function () {

  },
  redo:function () {

  },
  undo:function () {

  },
  delete:function () {
    this.rootModel.deleteSelected();
  },
  showSettings:function () {
    this.rootModel.showSettings();
  },
  unindentTasks:function () {
    this.rootModel.unindentTasks();
  },
  indentTasks:function () {
    this.rootModel.indentTasks();
  },
  insertAbove:function () {
    this.rootModel.insertAbove();
  },
  insertBelow:function () {
    this.rootModel.insertBelow();
  }

});

(function (window, document, $, undefined) {
  var app,
    sidebar,
    canvasHolder,
    headerHeight;

  $(document).ready(function () {

    app = new GanttChartApp.Application();
    window.$__app = app;

    app.load(function () {
      sidebar = $("#sidebar_grid");
      canvasHolder = $("<div id='sidebar_grid_svg'></div>").appendTo(sidebar);

      $("#sidebar").on('scroll', function (e) {
        $("#canvas").scrollTop(e.target.scrollTop);
      });

      $("#canvas").on("synchronizeColumns", function (e) {
        $("#sidebar").scrollTop(e.target.scrollTop);
      });

      var elem = document.getElementById('canvas');
      if (elem.addEventListener) {
        if ('onwheel' in document) {
          // IE9+, FF17+
          elem.addEventListener("wheel", onWheel, false);
        } else if ('onmousewheel' in document) {
          // устаревший вариант события
          elem.addEventListener("mousewheel", onWheel, false);
        } else {
          // 3.5 <= Firefox < 17, более старое событие DOMMouseScroll пропустим
          elem.addEventListener("MozMousePixelScroll", onWheel, false);
        }
      } else { // IE<9
        elem.attachEvent("onmousewheel", onWheel);
      }

      function onWheel(e) {
        e = e || window.event;

        // wheelDelta не дает возможность узнать количество пикселей
        var delta = e.deltaY || e.detail || e.wheelDelta;
        $("#canvas").scrollTop($("#canvas").scrollTop() + delta * 5);
        $("#sidebar").scrollTop($("#canvas").scrollTop());
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
      }
    }, function(){
      headerHeight = sidebar.find('thead').outerHeight();
      canvasHolder.css({
        position:'absolute',
        left:0,
        top:headerHeight
      });
    });
  });
})(window, document, jQuery, undefined);
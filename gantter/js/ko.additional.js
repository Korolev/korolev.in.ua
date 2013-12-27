/**
 * Created by mk
 * Date: 8/12/13
 * Time: 11:57 AM
 */

ko.observableArray.fn.pushAll = function (valuesToPush) {
  var underlyingArray = this();
  this.valueWillMutate();
  ko.utils.arrayPushAll(underlyingArray, valuesToPush);
  this.valueHasMutated();
  return this;
};


//UI

ko.bindingHandlers.jqDialog = {
  init:function (element, valueAccessor, parsedBindingsAccessor, root) {
    var options = ko.utils.unwrapObservable(valueAccessor()) || {};
    options.close = function(/*event, ui*/) {
      root.selectedTask().resetPredecessor();
    };
    options.buttons = {
      "Save":function(){
        root.selectedTask().savePredecessor();
        $(element).dialog("close");
      },
      "Close" :function(){
        $(element).dialog("close");
      }
    };

    if (options.tabsId) options.open = function (/*event, ui*/) {
      var current = 0,
        tabSelector = $("#" + options.tabsId);
      if (root.currentTab) {
        current = $.inArray(root.currentTab, SETTINGS_TABS);
      }
      tabSelector.tabs({
        selected:current
      });

    };
    $(element).dialog(options);
  }
};

ko.bindingHandlers.openDialog = {
  update:function (element, valueAccessor) {
    var value = ko.utils.unwrapObservable(valueAccessor());
    if (value) {
      $(element).dialog("open");
    } else {
      $(element).dialog("close");
    }
  }
};
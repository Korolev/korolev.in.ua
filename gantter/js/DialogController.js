/**
 * Created by mk
 * Date: 8/12/13
 * Time: 12:17 PM
 */
GanttChartApp.DialogController = Class.extend({
  NAME:'GanttChartApp.DialogController',
  HOLDER_ID:'dialog-content',
  MSGBOX_ID:'msgbox-content',

  init:function () {
    this.dialogHolderHeight = null;
    $("body").append($("<div></div>").attr("id", this.MSGBOX_ID));
  },

  msgbox:function (type, title, txt, callbackFn, scope) {
    var self = this,
      textNode,
      doCallback;

    callbackObj = {
      count:0,
      call:function (result) {
        if (this.count == 0) {
          this.count++;
          if (typeof callbackFn == 'function') {
            callbackFn.call(scope || window, result);
          }
        }
      }
    };

    textNode = $('<span id="msgbox-text" class="msgbox-text">' + txt + '</span>');
    $('#' + this.MSGBOX_ID).append(textNode);
    $('#' + this.MSGBOX_ID).dialog({
      modal:true,
      closeOnEscape:false,
      title:title,
      position:'center',
      resizable:'false',
      width:'450px',
      buttons:this.getMsgboxButtons(type || MSGBOX_TYPE_.OK, callbackObj),
      close:function () {
        $('#msgbox-text').remove();
        $('#' + self.MSGBOX_ID).dialog('destroy');
        callbackObj.call(-1);
      }
    });
  },

  getMsgboxButtons:function (type, callbackObj) {
    var buttons = [];

    if (type === MSGBOX_TYPE_.OK) {
      buttons.push({
        text:'Ok',
        click:function () {
          callbackObj.call(1);
          $(this).dialog('close');
        }
      });
    }
    else if (type === MSGBOX_TYPE_.OK_CANCEL) {
      buttons.push({
        text:'Ok',
        click:function () {
          callbackObj.call(1);
          $(this).dialog('close');
        }
      });

      buttons.push({
        text:'Cancel',
        click:function () {
          $(this).dialog('close');
        }
      });
    }
    else if (type === MSGBOX_TYPE_.YES_NO) {
      buttons.push({
        text:'Yes',
        click:function () {
          callbackObj.call(1);
          $(this).dialog('close');
        }
      });

      buttons.push({
        text:'No',
        click:function () {
          callbackObj.call(0);
          $(this).dialog('close');
        }
      });
    }
    else if (type === MSGBOX_TYPE_.YES_NO_CANCEL) {
      buttons.push({
        text:'Yes',
        click:function () {
          callbackObj.call(1);
          $(this).dialog('close');
        }
      });

      buttons.push({
        text:'No',
        click:function () {
          callbackObj.call(0);
          $(this).dialog('close');
        }
      });

      buttons.push({
        text:'Cancel',
        click:function () {
          $(this).dialog('close');
        }
      });
    }

    return buttons;
  }
});
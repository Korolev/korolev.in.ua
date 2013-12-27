/**
 * Created by mk
 * Date: 1/29/13
 * Time: 2:48 PM
 */

var UserNotificationManager = Class.extend({
  defaultHideTime: 3000,
  types: {
    INFO: 0,
    WARNING: 1,
    CRITICAL: 2
  },
  errorStackWidget : (function(){
    var self,
      btn = jQuery("<button></button>"),
      widgetDiv = jQuery("<div></div>").addClass('error_stack_widget'),
      widgetDivListHolder = jQuery("<div></div>").addClass('error_stack_widget_list_holder'),
      widgetDivList = jQuery("<ul></ul>").addClass('error_stack_widget_list'),
      listItemCreator = (function(){
        return {
          create: function(item_idx, config){
            var title = jQuery("<h3></h3>").text(config.title),
              text =  jQuery("<span></span>").html(config.text),
              cursorClass = config.clickCallback !== undefined ? ' cursorPointer ' : '';
            return jQuery("<li></li>").attr("id","error_item_"+item_idx).addClass('eswi_type_'+config.type + ' error_stack_widget_list_item'+cursorClass).append(title).append(text);
          }
        }
      }()),
      errorStack = {
        //implement .length() for this object
        length: 0,
        push: function(idx,error){
          this[idx] = error;
          this.lengthRecount();

          //Create HTML, insert to DOM
          this[idx].item = listItemCreator.create(idx,error);
          if(error.clickCallback !== undefined){
            this[idx].item.bind("click", error.clickCallback);
          }
          widgetDivList.prepend(this[idx].item);
        },
        remove: function(idx){
          try{
            this[idx].item.remove();
            delete this[idx];
            this.lengthRecount();
          }catch(e){
            console.log(e);
          }
        },
        lengthRecount: function(){
          var counter = 0;
          for(var prop in this) {
            if (this[prop].type !== undefined ) counter +=1;
          }
          this.length = counter;
        },
        totalCount: function(){
          return this.length;
        }
      };

    function writeCssToHead(){
      var style = jQuery("<style></style>"),
        css = ".iconAlert{ " +
              "background-image: url('"+self.images[2]+"') !important; " +
              "background-size: contain; " +
              "margin: -1px 5px 0 5px!important" +
          "}" +
          "#wr_toolbar .error_stack_widget .ui-button," +
          "#wr_toolbar .error_stack_widget .ui-button:active," +
          "#wr_toolbar .error_stack_widget .ui-button:hover{background-image:none; border-width: 1px 0 0 0; box-shadow:none}" +
          ".error_stack_widget{" +
              "float: right;" +
              "position:relative;" +
              "display: none;" +
          "}" +
              ".error_stack_widget .ui-button-text{" +
              "color: red;" +
              "color: rgba(236, 34, 59, 0.8);" +
              "text-decoration: underline" +
          "}" +
              ".error_stack_widget .ui-button{" +
              "padding: 0 10px !important;"+
          "}" +
          ".error_stack_widget_list_holder{" +
              "background: #fff;" +
              "border:3px solid #32679e;" +
              "-moz-box-shadow: 5px 10px 14px #9a9a9a;"+
              "-webkit-box-shadow: 5px 10px 14px #9a9a9a;" +
              "box-shadow: 5px 10px 10px #9a9a9a;" +
              "border-radius: 6px;" +
              "position:absolute;" +
              "z-index: 5;" +
              "right:0px;" +
              "display: none;" +
              "margin:3px;" +
              "width:300px;" +
              "padding:0 5px;" +
          "}"+
          ".error_stack_widget_list{" +
              "list-style: none;" +
              "display: block;" +
              "overflow-y: auto;" +
              "padding: 0" +
          "}"+
          ".error_stack_widget_list_item{" +
              "border-bottom:1px solid #ccc;" +
              "border-left:3px solid #fff;" +
              "display: block;" +
              "margin:5px 3px;" +
              "padding:5px;" +
              "color:#333;" +
          "}"+
          ".error_stack_widget_list_item.cursorPointer{" +
              "cursor:pointer;" +
          "}"+
          ".error_stack_widget_list_item.eswi_type_1 h3{" +
              "color: #fc0;" +
          "}"+
          ".error_stack_widget_list_item.eswi_type_2 h3{" +
              "color: red;" +
              "color: rgba(236, 34, 59, 0.8);;" +
          "}"+
          ".error_stack_widget_list_item h3{" +
              "display:block;" +
              "margin: 0 0 3px 0;" +
              "font-size: 1.1em;" +
              "color:#000;" +
          "}"+
          ".error_stack_widget_list_item span{" +
              "font-size: 1.05em;" +
              "line-height: 1.15em;" +
          "}" +
          ".error_stack_widget_list_holder:before{" +
          "top:-9px;" +
          "right:16px;" +
          "background-color: #ffffff;" +
          "width:12px;" +
          "height:12px;" +
          "-webkit-transform:rotate(-45deg);"+
          "-moz-transform:rotate(-45deg);"+
          "-ms-transform:rotate(-45deg);"+
          "-o-transform:rotate(-45deg);"+
          "transform:rotate(-45deg);"+
          "border:3px solid #32679e;" +
          "content:'';" +
          "z-index:-2;" +
          "position:absolute" +
          "}" +
          ".error_stack_widget_list_holder:after{" +
          "content:'';" +
          "background-color:#ffffff;" +
          "height:15px;" +
          "width:30px;" +
          "right:10px;" +
          "top:0px;" +
          "position:absolute;" +
          "z-index:-1;" +
          "}";
      style.prependTo(jQuery("head")).attr("type","text/css").text(css);
    }

    function build($){
      try{
        //TODO if !toolbar ?
        var HeaderHeight = $("#miniheader").height() + $(".bPageHeader").height() + 2;
        //TODO app.toolbar.html
        if($("#wr_toolbar").length){
          $("#wr_toolbar").append(widgetDiv);
          widgetDiv.append(btn);
          widgetDivListHolder.appendTo($("body")).append(widgetDivList).css({"top":HeaderHeight+"px"});
          widgetDivList.css({"max-height":window.innerHeight - HeaderHeight - 100/*hardCode padding+margin*/ +"px"});
        }        
      }catch (e){
        console.log(e);
      }
    }

    function bindButtons(){
      btn.button({icons:{primary:'iconAlert'}, text: false})
        .button("option", "disabled", true)
        .click(jQuery.proxy(function () {
        this.toggleErrorBox();
      }, self.errorStackWidget));
      //click on doc
      jQuery(document).click(jQuery.proxy(function (e){
          var target  = e.target,
              close = true;
          while(target && target != document){
            if(jQuery(target).hasClass("error_stack_widget_list_holder")){
              close = false;
            }
            if(jQuery(target).hasClass("error_stack_widget")){
              close = false;
            }
            target = target.parentNode;
          }
          if(close){
            this.hideList();
          }
      }, self.errorStackWidget));  
    }

    return {
      init: function(context){
        self = context;
        writeCssToHead();
        build(jQuery);
        bindButtons();
      },
      push: function(stick_id, error){
        errorStack.push(stick_id,error);
        this.updateButtonView();
      },
      remove: function(stick_id){
        errorStack.remove(stick_id);
        this.updateButtonView();
      },
      updateButtonView: function(){
      //Button View
        btn.button("option", "disabled", !errorStack.length);
        if(errorStack.length){
          btn.button("option","text", errorStack.length);
          btn.button("option","label", errorStack.length);
          widgetDiv.show();
        }else{
          widgetDiv.hide();
          btn.button("option","text",false);
        }
      },
      toggleErrorBox: function(){
        jQuery.gritter.removeAll();
        if(errorStack.length){
          widgetDivListHolder.toggle();
        }else{
          widgetDivListHolder.hide();
          btn.button("option", "disabled", !errorStack.length);
        }
      },
      hideList: function(){
        widgetDivListHolder.hide();
      },
      totalCount: function(){
        return errorStack.totalCount();
      }
    }
  }()),
  init: function(path){
    var path = path ? path : ROOT_FOLDER + 'ext_lib/swimlanes/css';
    this.images = {
      0: path + '/messagebox_info.png',
      1: path + '/messagebox_warning.png',
      2: path + '/messagebox_critical.png'
    };
    this.errorStackWidget.init(this);
  },
  showNotification: function(notification){
    this.errorStackWidget.hideList();
    var unique_id = jQuery.gritter.add({
      title: notification.title,
      text: (notification.text || '&nbsp;'),
      image: this.images[notification.type],
      sticky: false,
      time: notification.delay || (this.defaultHideTime * (notification.type + 1))
    });
    if(notification.useStack){
      this.errorStackWidget.push(unique_id,notification);
    }
    return unique_id;
  },
  showError: function(error){
    error.type = this.types.CRITICAL;
    error.delay = error.delay || 1500;
    error.useStack = true;
    return this.showNotification(error);
  },
  showWarning: function(error){
    error.type = this.types.WARNING;
    error.delay = error.delay || 1500;
    error.useStack = true;
    return this.showNotification(error);
  },
  clearError: function(idx){
    this.errorStackWidget.remove(idx);
  },
  updateErrorInfo: function(idx,error){
    this.clearError(idx);
    return this.showError(error);
  },
  getErrorCount: function(){
    return this.errorStackWidget.totalCount();
  }
});

/**
 * Created by mk
 * Date: 8/5/13
 * Time: 5:55 PM
 */

GanttChartApp.Toolbar = Class.extend({
  NAME:"GanttChartApp.Toolbar",
  init:function (elementId, app){
    this.html = $("#" + elementId);
    this.app = app;


    //Declare buttons
    this.delimiter = function(){ return $("<span class='toolbar_delimiter'>&nbsp;</span>")};
    this.saveButton = $("<button>Save</button>");
    this.closeButton = $("<button>Close</button>");
    this.udtButton = $("<button>Unindent tasks</button>");
    this.idtButton = $("<button>Indent tasks</button>");

    this.insertAvButton = $("<button>Insert above</button>");
    this.insertBwButton = $("<button>Insert below</button>");
    this.deleteButton = $("<button>Delete</button>");

    this.settingsButton = $("<button>Settings</button>");

    //append buttons, build HTML
    this.html.append(this.saveButton);
    this.html.append(this.closeButton);

    this.html.append(this.delimiter());

    this.html.append(this.udtButton);
    this.html.append(this.idtButton);

    this.html.append(this.delimiter());

    this.html.append(this.insertAvButton);
    this.html.append(this.insertBwButton);
    this.html.append(this.deleteButton);

    this.html.append(this.delimiter());

    this.html.append(this.settingsButton);

    //bind buttons
    this.saveButton.button({icons:{primary:'saveIcon'}}).click($.proxy(function () {
      this.app.save();
    }, this)).button("option", "disabled", false);
    this.closeButton.button({icons:{primary:'closeIcon'}}).click($.proxy(function () {
      this.app.close();
    }, this));
    this.udtButton.button({ icons:{primary:'unindentIcon'},text:false}).click($.proxy(function () {
      this.app.unindentTasks();
    }, this)).button("option", "disabled", true);
    this.idtButton.button({ icons:{primary:'indentIcon'},text:false}).click($.proxy(function () {
      this.app.indentTasks();
    }, this)).button("option", "disabled", true);

    this.insertAvButton.button({ icons:{primary:'aboveIcon'}, text:false}).click($.proxy(function () {
      this.app.insertAbove();
    }, this)).button("option", "disabled", true);
    this.insertBwButton.button({ icons:{primary:'belowIcon'}, text:false}).click($.proxy(function () {
      this.app.insertBelow();
    }, this)).button("option", "disabled", true);
    this.deleteButton.button({ icons:{primary:'deleteIcon'}, text:false}).click($.proxy(function () {
      this.app.delete();
    }, this)).button("option", "disabled", true);
    this.settingsButton.button({ icons:{primary:'settingsIcon'}, text:false}).click($.proxy(function () {
      this.app.showSettings();
    }, this)).button("option", "disabled", true);
  }
});
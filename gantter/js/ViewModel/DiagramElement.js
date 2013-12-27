/**
 * Created by mk
 * Date: 8/27/13
 * Time: 2:48 PM
 */
(function (window, document, $, undefined) {
  window.DiagramElement = function (key, task, canvas, root) {
    var
      self = this,
      path = '',
      fill = {
        'group':'#7733ee',
        'task':'#ffcc55'
      },
      gradient = {
        'group':'90-#526c7a-#64a0c1',
        'task':'90-#ffcc55-#ffcc99'
      };

    this.type = task.hasChild() ? 'group' : 'task';
    this.height = 15;
    this.connectors = [];
    this.paper = canvas.path(path).attr({stroke:"none"});

    this.redraw = function (_key, task) {
      this.type = task.hasChild() ? 'group' : 'task';
      this.x = task.getStartInHours();
      this.width = task.getFinishInHours() - this.x;
      this.y = _key * 23 + 3;
      this.isVisible = true;

      if (this.type == 'group') {
        path = 'M ' + this.x + ' ' + this.y +
          ' h ' + this.width +
          ' v ' + this.height / 4 * 3 +
          ' l -3 -5' +
          ' h ' + (this.width - 6) * -1 +
          ' l -3 5' +
          ' Z';

      } else {
        path = 'M ' + this.x + ' ' + this.y + ' h ' + this.width + ' v ' + this.height + ' h ' + this.width * -1 + ' Z';
      }
      this.paper.attr({"path":path, gradient:gradient[this.type]});
      this.redrawConnector(task);
    };
    this.removeConnectors = function () {
      $.each(this.connectors,function(i,connector){
        connector.attr('path', '');
      });
    };
    this.redrawConnector = function (task) {

      self.removeConnectors();
      if (task.predecessorTasks().length) {
        $.each(task.predecessorTasks(),function(i,_task){
          var pred = _task.paper;

          var dx = self.x - (pred.x + pred.width);
          path =
            'M ' + (pred.x + pred.width) + ' ' + (pred.y + (_task.hasChild() ? 4 : 8)) +
              ' h ' + (dx / 2 > 4 ? dx / 2 : 4) +
              ( dx < 4 ? ' v '+ (pred.y>self.y?'-11':'11') + ' H ' + (self.x - 7) : '') +
              ' V' + (self.y + 8) +
              ' H ' + self.x +
              ' l -3 -3 v 6 l 3 -3 l -2 -2 v 4 l 2 -2 l -1 -1 v 2 l 1 -1' +
              '';//' Z';

          if(task.paper.connectors[i]){
            task.paper.connectors[i].attr("path", path).toFront();
          }else{
            task.paper.connectors[i] = canvas.path(path).attr({stroke:"#cc0000", fill:"none"}).toFront();
          }
        });
      }
    };

    this.redraw(key, task);

    this.remove = function(){
      this.paper.attr('path','');
      self.removeConnectors();
    }
  }
})(window, document, jQuery, undefined);
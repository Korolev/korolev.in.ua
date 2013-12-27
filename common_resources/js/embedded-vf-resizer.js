var embeddedVFresiser = {
  registerEventListener: function (evtName, callbackFn) {
    if(window.addEventListener) {
      window.addEventListener(evtName, callbackFn, false);
    }
    else if (window.attachEvent) { //IE workaround
      window.attachEvent(evtName, callbackFn, false);
    }
  },

  onResize: function() {
    var h, bodyTag;

    if (window.parent && window.postMessage) {

      bodyTag = document.getElementsByTagName('body')[0];
      bodyTag.style.height = 'auto';

      //have to use a plain string: IE9 does not support objects as parameter (IE10 does)
      h = document.body.offsetHeight;
      if (h > 0) {
        window.parent.postMessage('action=resizeIFrame;iframeHeight=' + h + ';scrolling=no', '*');
      }
    }
  }
};

embeddedVFresiser.registerEventListener('load', embeddedVFresiser.onResize);
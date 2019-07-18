hljs.initHighlightingOnLoad();

function showOverlay(overlay, time) {
  overlay.classList.add('active');
  overlay.timeout = setTimeout(function(){ hideOverlay(overlay); }, time);
}

function hideOverlay(overlay) {
  clearTimeout(overlay.timeout);
  overlay.classList.remove('active');
}

window.addEventListener('load', function() {
  var copyConfirm = document.getElementById('copy-confirm');

  new ClipboardJS('pre[copy] code', {
      text: function(trigger) {
        showOverlay(copyConfirm, 2000);
        return trigger.textContent;
      }
  });

  document.querySelectorAll('.overlay').forEach(function(node) {
    console.log(node);
    node.addEventListener('click', function(){hideOverlay(node)});
  });
});

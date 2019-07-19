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
    node.addEventListener('click', function(){hideOverlay(node)});
  });

  document.querySelectorAll('code.typescript').forEach(function(node) {
    let lines = node.innerHTML.split('\n');
    node.innerHTML = '';
    for (var i = 0; i < lines.length; i++)
      if (lines[i].trim().length > 0)
        node.innerHTML += '<div class="line">' + lines[i] + '</div>';
      else node.innerHTML += '<br>';
  });

  new ClipboardJS('code .line', {
      text: function(trigger) {
        showOverlay(copyConfirm, 2000);
        return trigger.textContent;
      }
  });
});

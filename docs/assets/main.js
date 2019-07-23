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

  //
  // copy whole code (like install instructions)
  //
  new ClipboardJS('pre[copy] code', {
      text: function(trigger) {
        showOverlay(copyConfirm, 2000);
        return trigger.textContent;
      }
  });

  document.querySelectorAll('.overlay').forEach(function(node) {
    node.addEventListener('click', function(){hideOverlay(node)});
  });


  //
  // break javascript code into distinct lines
  // make each line copiable
  //
  document.querySelectorAll('code.javascript').forEach(function(node) {
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

  //
  // make the links of titles copiable
  //
  new ClipboardJS('h1[id], h2[id], h3[id]', {
    text: function(trigger) {
      showOverlay(copyConfirm, 2000);
      return location.protocol+'//'+location.host+location.pathname+'#'+trigger.getAttribute('id');
    }
  });

  //
  // make the toc
  //
  var div = document.createElement('div');
  var titles = document.querySelectorAll('h1[id], h2[id], h3[id]');
  var tocels = {};
  titles.forEach(function(node) {
    var a = document.createElement('a');
    a.setAttribute('href', location.protocol+'//'+location.host+location.pathname+'#'+node.getAttribute('id'));
    a.textContent = node.textContent;
    a.classList.add(node.tagName.toLowerCase());
    tocels[node.getAttribute('id')] = a;
    div.appendChild(a);
    div.appendChild(document.createElement('br'));
  });
  document.getElementById('toc').appendChild(div);
  window.addEventListener('scroll', function() {
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    var current = undefined;
    titles.forEach(function(node) { if (node.offsetTop <= scrollTop + window.innerHeight) current = node; });
    titles.forEach(function(node) {
      var tocel = tocels[node.getAttribute('id')];
      if ((node.offsetTop >= scrollTop &&
        node.offsetTop <= scrollTop + window.innerHeight) || node == current)
        tocel.classList.add('visible');
      else
        tocel.classList.remove('visible');
    });
  });
});

// Animate newly rendered editorial sections once, at the moment they enter view.
// Visibility never depends on JS: failed observers cannot leave content hidden.
(() => {
  if (!window.IntersectionObserver || !Element.prototype.animate) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const content = document.getElementById('content');
  const selector = '.letter > div,.intentions article,.team-sign,.card,.steps article,.salonnote';
  let observer, changes;
  const running = new Set();
  function reset() {
    observer?.disconnect(); changes?.disconnect();
    running.forEach(a => a.cancel()); running.clear();
    content.classList.remove('scroll-reveals');
    if (preference.matches) return;
    content.classList.add('scroll-reveals');
    observer = new IntersectionObserver(entries => {
      let delay = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const animation = entry.target.animate([
          {opacity:.18, transform:'translateY(22px)'},
          {opacity:1, transform:'translateY(0)'}
        ], {duration:540, delay, fill:'backwards', easing:'cubic-bezier(.16,1,.3,1)'});
        running.add(animation);
        animation.onfinish = animation.oncancel = () => running.delete(animation);
        delay = Math.min(delay + 65, 195);
      }
    }, {threshold:0.04});
    function track(node, observe) {
      if (node.nodeType !== 1) return;
      if(node.matches(selector)) observer[observe](node);
      node.querySelectorAll(selector).forEach(el=>observer[observe](el));
    }
    track(content,'observe');
    changes = new MutationObserver(records => {
      for(const record of records){
        record.removedNodes.forEach(n=>track(n,'unobserve'));
        record.addedNodes.forEach(n=>track(n,'observe'));
      }
    });
    changes.observe(content,{childList:true,subtree:true});
  }
  reset();
  preference.addEventListener?.('change',reset);
})();

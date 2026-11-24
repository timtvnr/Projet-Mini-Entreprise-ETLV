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

// Real, persistent frame states: the dissolve does not depend on catching a
// one-off entry animation. Pause outside the viewport and between routes.
(() => {
  const root = document.getElementById('content');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let cleanup = () => {};
  function mount() {
    cleanup();
    const panel = root.querySelector('.portrait');
    if (!panel) return;
    const slides = [...panel.querySelectorAll('img')];
    const play = panel.querySelector('[data-play]');
    let index = 0, playing = !reduced.matches, visible = true, timer;
    function schedule() {
      clearTimeout(timer);
      play.textContent = playing ? 'Ⅱ' : '▶';
      play.setAttribute('aria-label',playing?'Mettre le diaporama en pause':'Lire le diaporama');
      if (playing && visible && !document.hidden) timer=setTimeout(next,4200);
    }
    function next() {
      index=(index+1)%slides.length;
      slides.forEach((img,i)=>{img.classList.toggle('shown',i===index);img.setAttribute('aria-hidden',String(i!==index));});
      panel.querySelector('[data-caption]').textContent=`0${index+1} / 03 · ${slides[index].alt}`;
      schedule();
    }
    play.onclick=()=>{playing=!playing;if(playing)next();else schedule();};
    panel.querySelector('[data-next]').onclick=()=>{playing=false;next();};
    const onPreference=()=>{playing=!reduced.matches;schedule();};
    const visibility = window.IntersectionObserver && new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();});
    visibility?.observe(panel);
    document.addEventListener('visibilitychange',schedule);
    reduced.addEventListener?.('change',onPreference);
    schedule();
    cleanup=()=>{clearTimeout(timer);visibility?.disconnect();document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener?.('change',onPreference);};
  }
  root.addEventListener('nh:page', mount);mount();
})();

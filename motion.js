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
    let index = 0, playing = !reduced.matches, timer;
    function schedule() {
      clearTimeout(timer);
      play.textContent = playing ? 'Ⅱ' : '▶';
      play.setAttribute('aria-label',playing?'Mettre le diaporama en pause':'Lire le diaporama');
            panel.classList.remove('cycling');
      if (playing && !document.hidden) {
        void panel.offsetWidth; // restart the visible countdown for this portrait
        panel.classList.add('cycling');
        timer=setTimeout(next,3200);
      }
    }
    function next() {
      index=(index+1)%slides.length;
      slides.forEach((img,i)=>{img.classList.toggle('shown',i===index);img.setAttribute('aria-hidden',String(i!==index));});
      panel.querySelector('[data-caption]').textContent=`0${index+1} / 03 · ${slides[index].alt}`;
      schedule();
    }
    play.onclick=()=>{playing=!playing;if(playing)next();else schedule();};
    panel.querySelector('[data-next]').onclick=next;
    const onPreference=()=>{playing=!reduced.matches;schedule();};
    document.addEventListener('visibilitychange',schedule);
    reduced.addEventListener?.('change',onPreference);
    schedule();
    cleanup=()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener?.('change',onPreference);};
  }
  root.addEventListener('nh:page', mount);mount();
})();

// Capture activation before the app replaces a menu, card or quiz button.
// A separate ring outlives the control without delaying the actual action.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click', event => {
    const control = event.target.closest?.('button:not(:disabled), a[href], .option, summary');
    if (!control || reduced.matches || !Element.prototype.animate) return;
    // A label also generates a synthetic click on its radio: draw just once.
    if (control.matches('.option') && !event.target.matches('input')) return;
    const rect = control.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = event.detail && event.clientX ? event.clientX : rect.left + rect.width / 2;
    const y = event.detail && event.clientY ? event.clientY : rect.top + rect.height / 2;
    const ring = document.createElement('i');
    ring.className = 'tap-wave'; ring.setAttribute('aria-hidden','true');
    ring.style.left = `${x}px`; ring.style.top = `${y}px`;
    // An open dialog is in the browser's top layer, above ordinary overlays.
    const attach = () => (document.querySelector('dialog[open]') || document.body).append(ring);
    attach();
    requestAnimationFrame(() => {if (ring.parentElement !== (document.querySelector('dialog[open]') || document.body)) attach();});
    const wave = ring.animate([{transform:'translate(-50%,-50%) scale(.3)',opacity:1},{transform:'translate(-50%,-50%) scale(2.1)',opacity:0}],{duration:490,easing:'ease-out'});
    wave.onfinish = wave.oncancel = () => ring.remove();
    control.animate([{scale:'.92'},{scale:'1.035',offset:.6},{scale:'1'}],{duration:330,easing:'ease-out'});
  },true);
})();

(() => {
  const Lingua = {
    ora: 'it',
    applica(l) {
      this.ora = l === 'en' ? 'en' : 'it';
      document.documentElement.lang = this.ora;
      for (const el of document.querySelectorAll('[data-en]')) {
        if (el.dataset.it === undefined) el.dataset.it = el.innerHTML;
        el.innerHTML = this.ora === 'en' ? el.dataset.en : el.dataset.it;
      }
      for (const el of document.querySelectorAll('[data-en-label]')) {
        if (el.dataset.itLabel === undefined) el.dataset.itLabel = el.getAttribute('aria-label') || '';
        el.setAttribute('aria-label', this.ora === 'en' ? el.dataset.enLabel : el.dataset.itLabel);
      }
      for (const b of document.querySelectorAll('[data-lingua]')) b.setAttribute('aria-pressed', String(b.dataset.lingua === this.ora));
      try { localStorage.setItem('lingua', this.ora); } catch {}
      document.dispatchEvent(new CustomEvent('lingua', { detail: this.ora }));
    },
    avvia() {
      let l = null;
      try { l = localStorage.getItem('lingua'); } catch {}
      if (!l) l = (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en';
      for (const b of document.querySelectorAll('[data-lingua]')) b.addEventListener('click', () => this.applica(b.dataset.lingua));
      this.applica(l);
    }
  };

  const MESI = { it: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
  const oggi = new Date();
  const mesiTra = (dal, al) => { const [a1, m1] = dal.split('-').map(Number), [a2, m2] = al ? al.split('-').map(Number) : [oggi.getFullYear(), oggi.getMonth() + 1]; return (a2 - a1) * 12 + (m2 - m1) + 1; };
  function periodi() {
    const l = Lingua.ora, en = l === 'en';
    for (const el of document.querySelectorAll('.periodo')) {
      const { dal, al } = el.dataset, n = mesiTra(dal, al), anni = Math.floor(n / 12), mesi = n % 12;
      const data = s => { const [a, m] = s.split('-').map(Number); return `${MESI[l][m - 1]} ${a}`; };
      const durata = [anni ? (en ? `${anni} yr${anni > 1 ? 's' : ''}` : `${anni} ann${anni > 1 ? 'i' : 'o'}`) : '', mesi ? (en ? `${mesi} mo${mesi > 1 ? 's' : ''}` : `${mesi} mes${mesi > 1 ? 'i' : 'e'}`) : ''].filter(Boolean).join(' ');
      el.textContent = `${data(dal)} — ${al ? data(al) : (en ? 'Present' : 'oggi')} · ${durata}`;
    }
    document.getElementById('anni-nrg').textContent = Math.floor(mesiTra('2020-07', '') / 12) + '+';
  }
  document.addEventListener('lingua', periodi);
  document.getElementById('anno').textContent = oggi.getFullYear();
  Lingua.avvia();

  const voci = new Map([...document.querySelectorAll('.indice a')].map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const oss = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { for (const a of voci.values()) a.classList.remove('qui'); voci.get(e.target.id)?.classList.add('qui'); } }, { rootMargin: '-25% 0px -65% 0px' });
    for (const id of voci.keys()) oss.observe(document.getElementById(id));
  }

  const tela = document.getElementById('maglia'), c = tela.getContext('2d');
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches, PASSO = 44;
  const caso = i => { const v = Math.sin(i * 91.7 + 47.3) * 15731.743; return v - Math.floor(v); };
  let L = 0, A = 0, col = 0, rig = 0, attiva = true, ultimo = 0;
  function misura() {
    const r = tela.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    L = r.width; A = r.height; tela.width = L * d; tela.height = A * d; c.setTransform(d, 0, 0, d, 0, 0);
    col = Math.ceil(L / PASSO) + 2; rig = Math.ceil(A / PASSO) + 2;
  }
  const tensione = (x, y, t) => .5 + .5 * Math.sin(x * .007 + t * .45) * Math.cos(y * .009 - t * .3) + .18 * Math.sin((x + y) * .004 - t * .2);
  function nodo(i, j, t) {
    const k = j * 131 + i, x = (i - .5) * PASSO + (caso(k) - .5) * PASSO * .5, y = (j - .5) * PASSO + (caso(k + 7) - .5) * PASSO * .5, s = tensione(x, y, t);
    return [x + Math.sin(t * .6 + k) * 2 + (s - .5) * 9, y + Math.cos(t * .5 + k * 1.3) * 2 + (s - .5) * 7, s];
  }
  function tinta(s, a) {
    const k = Math.max(0, Math.min(1, s)), p = k < .6 ? [122 + (94 - 122) * k / .6, 162 + (234 - 162) * k / .6, 247 + (212 - 247) * k / .6] : [94 + (251 - 94) * (k - .6) / .4, 234 + (191 - 234) * (k - .6) / .4, 212 + (36 - 212) * (k - .6) / .4];
    return `rgba(${p[0] | 0},${p[1] | 0},${p[2] | 0},${a})`;
  }
  function disegna(ms) {
    if (!attiva) return;
    if (!calmo) requestAnimationFrame(disegna);
    if (ms - ultimo < 33) return; ultimo = ms;
    const t = calmo ? 3 : ms / 1000;
    c.clearRect(0, 0, L, A); c.lineWidth = 1;
    for (let j = 0; j < rig; j++) for (let i = 0; i < col; i++) {
      const a = nodo(i, j, t), b = nodo(i + 1, j, t), d = nodo(i, j + 1, t), e = nodo(i + 1, j + 1, t);
      for (const [p, q, r] of (i + j) % 2 ? [[a, b, d], [b, e, d]] : [[a, b, e], [a, e, d]]) {
        const s = (p[2] + q[2] + r[2]) / 3;
        c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.lineTo(r[0], r[1]); c.closePath();
        if (s > .62) { c.fillStyle = tinta(s, (s - .62) * .45); c.fill(); }
        c.strokeStyle = tinta(s, .1 + s * .3); c.stroke();
      }
    }
  }
  misura(); requestAnimationFrame(disegna);
  addEventListener('resize', () => { misura(); if (calmo) requestAnimationFrame(disegna); });
  const riparti = v => { const prima = attiva; attiva = v; if (v && !prima) requestAnimationFrame(disegna); };
  if ('IntersectionObserver' in window) new IntersectionObserver(es => riparti(es[0].isIntersecting && !document.hidden)).observe(tela);
  document.addEventListener('visibilitychange', () => riparti(!document.hidden));
})();

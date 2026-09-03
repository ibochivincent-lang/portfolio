/**
 * Sorrel, QR Table Menu Template — 3D Rendered Design
 *
 * Ambient canvas particles + 3D perspective card tilt + parallax scroll depth.
 * All feature detection is guarded so the menu still works if Canvas is blocked.
 */

/* ============================================
   AMBIENT PARTICLE CANVAS — 3D DEPTH
   ============================================ */
(function initAmbientCanvas() {
    var canvas = document.getElementById('ambientCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    var particles = [];
    var PARTICLE_COUNT = 40;
    var connDist = 120;
    var w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() { this.reset(true); }
    Particle.prototype.reset = function (init) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.3 + 0.05;
        this.isGold = Math.random() > 0.6;
    };
    Particle.prototype.update = function () {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -10 || this.x > w + 10) this.vx *= -1;
        if (this.y < -10 || this.y > h + 10) this.vy *= -1;
    };
    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
        ctx.fillStyle = this.isGold
            ? 'rgba(212,160,74,' + this.opacity + ')'
            : 'rgba(194,96,74,' + this.opacity + ')';
        ctx.fill();
    };

    for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawConnections() {
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connDist) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(212,160,74,' + (0.04 * (1 - dist / connDist)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        drawConnections();
        requestAnimationFrame(animate);
    }
    animate();
})();

/* ============================================
   3D TILT ON MENU CARDS
   ============================================ */
(function initCardTilt() {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    var items = document.querySelectorAll('.item');
    if (!items.length) return;

    items.forEach(function (item) {
        item.style.transformStyle = 'preserve-3d';
        item.style.perspective = '600px';
        item.style.transition = 'transform 0.4s var(--ease), box-shadow 0.4s var(--ease)';

        item.addEventListener('mousemove', function (e) {
            var rect = item.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            var rotateX = y * -8;
            var rotateY = x * 8;
            item.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(6px)';
            item.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(212,160,74,0.1)';
        });

        item.addEventListener('mouseleave', function () {
            item.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)';
            item.style.boxShadow = 'none';
        });
    });
})();

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('has-js');
} else {
    document.documentElement.classList.remove('has-js');
}

(function onReady(init) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(function initSorrel() {

    let wantsSmooth = (new URLSearchParams(location.search).get('smooth')
        || document.documentElement.dataset.smooth) !== 'off'
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lenis = null;
    let lenisTick = null;
    if (wantsSmooth && typeof Lenis !== 'undefined') {
        const hasST = typeof ScrollTrigger !== 'undefined';
        lenis = new Lenis({ autoRaf: !hasST, anchors: true });
        if (hasST) {
            lenis.on('scroll', ScrollTrigger.update);
            lenisTick = function (time) { lenis.raf(time * 1000); };
            gsap.ticker.add(lenisTick);
            gsap.ticker.lagSmoothing(0);
            ScrollTrigger.addEventListener('refresh', function () {
                lenis.scrollTo(window.scrollY, { immediate: true, force: true });
            });
        }
    }

    const ctx = gsap.context(function gsapContextCallback() {
        const mm = gsap.matchMedia();

        mm.add({
            isMotion: '(prefers-reduced-motion: no-preference)',
            isReduced: '(prefers-reduced-motion: reduce)'
        }, function matchMediaCallback(context) {
            const isMotion = context.conditions.isMotion;
            const handlers = new Map();
            const resets = [];

            function listen(el, type, fn) {
                el.addEventListener(type, fn);
                const entry = handlers.get(el) || {};
                entry[type] = fn;
                handlers.set(el, entry);
            }

            const activeDiets = [];

            (function initFilters() {
                const bar = document.querySelector('[data-filters]');
                if (!bar) return;
                const chips = gsap.utils.toArray(bar.querySelectorAll('[data-diet]'));
                const items = gsap.utils.toArray('[data-item]');
                if (!chips.length || !items.length) return;

                const empties = gsap.utils.toArray('[data-empty]');

                function matches(item) {
                    const diet = item.dataset.diet || '';
                    return activeDiets.every(function (d) {
                        return diet.split(/\s+/).indexOf(d) !== -1;
                    });
                }

                function updateEmpties() {
                    empties.forEach(function (note) {
                        const panel = note.closest('[data-panel]');
                        if (!panel) return;
                        const rows = Array.prototype.slice.call(panel.querySelectorAll('[data-item]'));
                        const anyShown = rows.some(function (r) {
                            return !r.classList.contains('is-filtered');
                        });
                        note.hidden = anyShown || rows.length === 0;
                    });
                }

                function apply() {
                    items.forEach(function (item) {
                        const show = matches(item);
                        const hidden = item.classList.contains('is-filtered');

                        if (show && hidden) {
                            item.classList.remove('is-filtered');
                            if (isMotion) {
                                gsap.fromTo(item,
                                    { opacity: 0, y: 6 },
                                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                                );
                            } else {
                                gsap.set(item, { clearProps: 'opacity,transform' });
                            }
                        } else if (!show && !hidden) {
                            if (isMotion) {
                                gsap.to(item, {
                                    opacity: 0,
                                    duration: 0.22,
                                    ease: 'power1.out',
                                    onComplete: function () {
                                        item.classList.add('is-filtered');
                                        gsap.set(item, { clearProps: 'opacity,transform' });
                                        updateEmpties();
                                    }
                                });
                            } else {
                                item.classList.add('is-filtered');
                            }
                        }
                    });
                    if (!isMotion) updateEmpties();
                    ScrollTrigger.refresh();
                }

                chips.forEach(function (chip) {
                    listen(chip, 'click', function () {
                        const diet = chip.dataset.diet;
                        const i = activeDiets.indexOf(diet);
                        const on = i === -1;
                        if (on) activeDiets.push(diet);
                        else activeDiets.splice(i, 1);
                        chip.classList.toggle('is-on', on);
                        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
                        apply();
                    });
                });

                resets.push(function () {
                    activeDiets.length = 0;
                    items.forEach(function (item) {
                        item.classList.remove('is-filtered');
                        gsap.set(item, { clearProps: 'opacity,transform' });
                    });
                    chips.forEach(function (chip) {
                        chip.classList.remove('is-on');
                        chip.setAttribute('aria-pressed', 'false');
                    });
                    empties.forEach(function (note) { note.hidden = true; });
                });
            })();

            (function initTabs() {
                const nav = document.querySelector('[data-tabs]');
                const tabs = gsap.utils.toArray('[data-tab]');
                const panels = gsap.utils.toArray('[data-panel]');
                if (!nav || !tabs.length || !panels.length) return;

                nav.setAttribute('role', 'tablist');

                const pairs = [];
                tabs.forEach(function (tab) {
                    const name = tab.dataset.tab;
                    const panel = panels.filter(function (p) {
                        return p.dataset.panel === name;
                    })[0];
                    if (!panel) return;

                    tab.setAttribute('role', 'tab');
                    if (!tab.id) tab.id = 'tab-' + name;
                    panel.setAttribute('role', 'tabpanel');
                    panel.setAttribute('aria-labelledby', tab.id);
                    pairs.push({ tab: tab, panel: panel });
                });
                if (!pairs.length) return;

                const root = document.documentElement;
                const allTab = tabs.filter(function (t) { return t.dataset.tab === 'all'; })[0];
                if (allTab) {
                    allTab.setAttribute('role', 'tab');
                    if (!allTab.id) allTab.id = 'tab-all';
                }
                const order = (allTab ? [allTab] : []).concat(pairs.map(function (p) { return p.tab; }));
                let build = null;

                function play(panelList) {
                    if (build) build.kill();
                    if (!isMotion) return;
                    build = gsap.timeline();
                    build.fromTo(panelList,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.28, ease: 'power1.out', stagger: panelList.length > 1 ? 0.05 : 0 }
                    );
                    if (panelList.length === 1) {
                        const rows = Array.prototype.slice.call(
                            panelList[0].querySelectorAll('[data-item]:not(.is-filtered)')
                        );
                        if (rows.length) {
                            build.fromTo(rows,
                                { opacity: 0, y: 10 },
                                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05, clearProps: 'transform' },
                                0.06
                            );
                        }
                    }
                }

                function markActive(activeTab) {
                    order.forEach(function (tab) {
                        const on = tab === activeTab;
                        tab.classList.toggle('is-active', on);
                        tab.setAttribute('aria-selected', on ? 'true' : 'false');
                        tab.tabIndex = on ? 0 : -1;
                    });
                }

                function showAll(animate) {
                    root.classList.add('menu-all');
                    markActive(allTab);
                    pairs.forEach(function (pair) {
                        pair.panel.classList.remove('is-active');
                        gsap.set(pair.panel, { clearProps: 'opacity,transform' });
                    });
                    if (animate) play(pairs.map(function (p) { return p.panel; }));
                    ScrollTrigger.refresh();
                }

                function activate(index, animate) {
                    if (index < 0 || index >= pairs.length) return;
                    root.classList.remove('menu-all');
                    markActive(pairs[index].tab);
                    pairs.forEach(function (pair, i) {
                        const on = i === index;
                        pair.panel.classList.toggle('is-active', on);
                        if (!on) gsap.set(pair.panel, { clearProps: 'opacity,transform' });
                    });
                    if (animate) play([pairs[index].panel]);
                    ScrollTrigger.refresh();
                }

                function select(tab, animate) {
                    if (allTab && tab === allTab) { showAll(animate); return; }
                    const idx = pairs.map(function (p) { return p.tab; }).indexOf(tab);
                    if (idx >= 0) activate(idx, animate);
                }

                order.forEach(function (tab, oi) {
                    listen(tab, 'click', function (event) {
                        event.preventDefault();
                        select(tab, true);
                    });
                    listen(tab, 'keydown', function (event) {
                        const key = event.key;
                        let ni = -1;
                        if (key === 'ArrowRight' || key === 'ArrowDown') ni = (oi + 1) % order.length;
                        else if (key === 'ArrowLeft' || key === 'ArrowUp') ni = (oi - 1 + order.length) % order.length;
                        else if (key === 'Home') ni = 0;
                        else if (key === 'End') ni = order.length - 1;
                        else return;
                        event.preventDefault();
                        select(order[ni], true);
                        order[ni].focus();
                    });
                });

                if (allTab) showAll(false); else activate(0, false);

                resets.push(function () {
                    if (build) build.kill();
                    root.classList.remove('menu-all');
                    pairs.forEach(function (pair) {
                        gsap.set(pair.panel, { clearProps: 'opacity,transform' });
                    });
                });
            })();

            (function initItemDetails() {
                const items = gsap.utils.toArray('[data-item]');
                if (!items.length) return;

                items.forEach(function (item, i) {
                    const toggle = item.querySelector('[data-toggle]');
                    const more = item.querySelector('[data-more]');
                    if (!toggle || !more) return;

                    if (!more.id) more.id = 'item-more-' + i;
                    toggle.setAttribute('aria-controls', more.id);
                    toggle.setAttribute('aria-expanded', 'false');
                    item.classList.add('has-details');

                    if (!more.querySelector('.item__more-inner')) {
                        const inner = document.createElement('div');
                        inner.className = 'item__more-inner';
                        while (more.firstChild) inner.appendChild(more.firstChild);
                        more.appendChild(inner);
                    }

                    function setOpen(open) {
                        item.classList.toggle('is-open', open);
                        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                        if (isMotion) {
                            gsap.to(more, {
                                height: open ? 'auto' : 0,
                                opacity: open ? 1 : 0,
                                duration: 0.32,
                                ease: 'power2.out',
                                onComplete: function () { ScrollTrigger.refresh(); }
                            });
                        } else {
                            gsap.set(more, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 });
                            ScrollTrigger.refresh();
                        }
                    }

                    listen(item, 'click', function () {
                        setOpen(!item.classList.contains('is-open'));
                    });
                });

                resets.push(function () {
                    items.forEach(function (item) {
                        const more = item.querySelector('[data-more]');
                        const toggle = item.querySelector('[data-toggle]');
                        item.classList.remove('is-open');
                        if (toggle) toggle.setAttribute('aria-expanded', 'false');
                        if (more) gsap.set(more, { clearProps: 'height,opacity' });
                    });
                });
            })();

            (function initFooterReveal() {
                if (!isMotion) return;
                const items = gsap.utils.toArray('[data-note]');
                if (!items.length) return;

                const st = ScrollTrigger.batch(items, {
                    start: 'top 94%',
                    once: true,
                    onEnter: function (batch) {
                        gsap.fromTo(batch,
                            { opacity: 0, y: 16 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.6,
                                ease: 'power2.out',
                                stagger: 0.08,
                                overwrite: true
                            }
                        );
                    }
                });

                resets.push(function () {
                    st.forEach(function (t) { t.kill(); });
                    gsap.set(items, { clearProps: 'opacity,transform' });
                });
            })();

            return function cleanup() {
                handlers.forEach(function removeAll(entry, el) {
                    Object.keys(entry).forEach(function (type) {
                        el.removeEventListener(type, entry[type]);
                    });
                });
                handlers.clear();
                resets.forEach(function (fn) { fn(); });
                resets.length = 0;
                ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
            };
        });
    });

    window.gsapContext = ctx;

    window.addEventListener('beforeunload', function () {
        if (ctx) ctx.revert();
        if (lenisTick) gsap.ticker.remove(lenisTick);
        if (lenis) lenis.destroy();
    });
});
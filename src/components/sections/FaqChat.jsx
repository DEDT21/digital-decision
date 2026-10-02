import React from 'react';
import './FaqChat.css';

/* Chat-style FAQ: the question is a message bubble and the bubble itself is the button
   (plus/minus inside it); the answer replies underneath as an Ink bubble. Accordion semantics:
   question heading > button with aria-expanded/aria-controls, answer region hidden when closed.
   Emoji stickers from the original reference are deliberately dropped; the brand does not use
   emoji. */

const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

/* Collapse with max-height instead of grid-template-rows 0fr (WebKit does not interpolate back
   to 0fr, closed answers would stay open on iOS). Same mechanism as in TeamStructure.jsx:
   closed = `hidden`; opening animates from the current height and releases max-height at the
   end; closing makes the panel inert at once and hides it when the transition is done. */
function useCollapse(open) {
  const ref = React.useRef(null);
  const mounted = React.useRef(false);
  const [prevOpen, setPrevOpen] = React.useState(open);
  const [closing, setClosing] = React.useState(false);
  if (open !== prevOpen) { setPrevOpen(open); setClosing(!open); }

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.inert = !open;
    if (!mounted.current) {
      mounted.current = true;
      if (!open) { el.style.maxHeight = '0px'; el.style.opacity = '0'; }
      return undefined;
    }
    if (window.matchMedia && window.matchMedia(REDUCE_QUERY).matches) {
      el.style.maxHeight = open ? '' : '0px';
      el.style.opacity = open ? '' : '0';
      if (!open) setClosing(false);
      return undefined;
    }

    let timer = 0;
    const finish = () => {
      window.clearTimeout(timer);
      el.removeEventListener('transitionend', onEnd);
      if (open) { el.style.maxHeight = ''; el.style.opacity = ''; } else setClosing(false);
    };
    function onEnd(e) { if (e.target === el && e.propertyName === 'max-height') finish(); }

    const fromH = el.getBoundingClientRect().height;
    el.style.maxHeight = fromH + 'px';
    el.style.opacity = getComputedStyle(el).opacity;
    void el.offsetHeight; /* force a style flush so the transition has a start value */
    el.style.maxHeight = open ? el.scrollHeight + 'px' : '0px';
    el.style.opacity = open ? '1' : '0';
    el.addEventListener('transitionend', onEnd);
    timer = window.setTimeout(finish, 800);
    return () => { window.clearTimeout(timer); el.removeEventListener('transitionend', onEnd); };
  }, [open]);

  return { ref, hidden: !open && !closing };
}

function PlusMinus() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">
      <path d="M0 5h10" stroke="currentColor" strokeWidth="1.5" />
      <path className="dd-icon-v" d="M5 0v10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FaqItem({ item, isOpen, onToggle, index }) {
  const uid = React.useId();
  const qId = uid + '-q';
  const aId = uid + '-a';
  const panel = useCollapse(isOpen);
  return (
    <div className="dd-faq-item" data-reveal data-reveal-delay={index * 60}>
      <h3 className="dd-faq-q">
        <button type="button" id={qId} className="dd-faq-bubble" onClick={onToggle} aria-expanded={isOpen} aria-controls={aId}>
          <span>{item.question}</span>
          <span className="dd-faq-icon" aria-hidden="true"><PlusMinus /></span>
        </button>
      </h3>
      <div ref={panel.ref} id={aId} className="dd-faq-panel" role="region" aria-labelledby={qId} hidden={panel.hidden}>
        <div className="dd-faq-panel-inner">
          <p className="dd-faq-answer">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqChat({ items = [], timestamp, defaultOpenId, columnsGap, style }) {
  const [open, setOpen] = React.useState(defaultOpenId != null ? String(defaultOpenId) : null);

  return (
    <div className="dd-faq" style={columnsGap ? { gap: columnsGap, ...style } : style}>
      {timestamp ? <p className="dd-faq-time">{timestamp}</p> : null}
      {items.map((item, i) => {
        const id = String(item.id != null ? item.id : i);
        return (
          <FaqItem key={id} item={item} index={i} isOpen={open === id}
            onToggle={() => setOpen((prev) => (prev === id ? null : id))} />
        );
      })}
    </div>
  );
}

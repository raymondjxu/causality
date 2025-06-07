import React, { useEffect, useRef, useState } from 'react';
import './ErrorModal.css';

export default function ErrorModal({ show, onTryAgain, onPlaceForMe, message }) {
  const [visible, setVisible] = useState(show);
  const [shouldRender, setShouldRender] = useState(show);
  const timeoutRef = useRef(0);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setTimeout(() => setVisible(true), 10); // allow for transition
    } else {
      setVisible(false);
      timeoutRef.current = window.setTimeout(() => setShouldRender(false), 300); // match CSS duration
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [show]);

  if (!shouldRender) return null;
  return (
    <div className={`error-modal-backdrop${visible ? '' : ' hide'}`}>
      <div className={`error-modal${visible ? '' : ' hide'}`}>
        <div className="error-modal-message">{message}</div>
        <div className="error-modal-buttons">
          <button className="try-again-btn" onClick={onTryAgain}>Try Again</button>
          <button className="place-for-me-btn" onClick={onPlaceForMe}>Place it in the correct spot for me</button>
        </div>
      </div>
    </div>
  );
}

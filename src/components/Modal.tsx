import React from "react";

export function Modal(props: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHeader">
          <div>
            <div className="panelTitle">{props.title}</div>
            {props.subtitle && <div className="panelSub">{props.subtitle}</div>}
          </div>
          <button className="secondary" onClick={props.onClose}>Fermer</button>
        </div>

        {props.children}

        {props.footer && <div className="modalFooter">{props.footer}</div>}
      </div>
    </div>
  );
}


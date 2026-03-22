import { useState } from 'react';
import type { RGBColor } from '../types';

interface Props {
  initial: RGBColor;
  onApply: (color: RGBColor) => void;
  onClose: () => void;
}

function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function ColorPickerModal({ initial, onApply, onClose }: Props) {
  const [color, setColor] = useState<RGBColor>(initial);

  const { r, g, b } = color;
  const textColor = getLuminance(r, g, b) > 0.5 ? '#000' : '#fff';
  const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  function handleHexChange(hex: string) {
    const clean = hex.replace('#', '');
    if (clean.length === 6) {
      const nr = parseInt(clean.slice(0, 2), 16);
      const ng = parseInt(clean.slice(2, 4), 16);
      const nb = parseInt(clean.slice(4, 6), 16);
      if (!isNaN(nr) && !isNaN(ng) && !isNaN(nb)) {
        setColor({ r: nr, g: ng, b: nb });
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Group Colour</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          className="color-preview"
          style={{ background: `rgb(${r},${g},${b})`, color: textColor }}
        >
          Preview Text
        </div>

        <div className="color-sliders">
          {(['r', 'g', 'b'] as const).map((channel) => (
            <label key={channel} className="slider-row">
              <span className={`slider-label slider-label--${channel}`}>
                {channel.toUpperCase()} {color[channel]}
              </span>
              <input
                type="range"
                min="0"
                max="255"
                value={color[channel]}
                className={`slider slider--${channel}`}
                onChange={(e) => setColor((c) => ({ ...c, [channel]: Number(e.target.value) }))}
              />
            </label>
          ))}
        </div>

        <label className="hex-row">
          <span>Hex</span>
          <input
            type="text"
            className="hex-input"
            value={hexColor}
            onChange={(e) => handleHexChange(e.target.value)}
            maxLength={7}
            spellCheck={false}
          />
        </label>

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={() => { onApply(color); onClose(); }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

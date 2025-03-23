import React from "react";
import "./KeyboardHtml.scss";

const KeyboardHtml: React.FC = () => {
  return (
    <div className="keyboard-wrapper">
      <div className="keyboard">
        <div className="row">
          <div className="key">Esc</div>
          <div className="key">F1</div>
          <div className="key">F2</div>
          <div className="key">F3</div>
          <div className="key">F4</div>
          <div className="key">F5</div>
          <div className="key">F6</div>
          <div className="key">F7</div>
          <div className="key">F8</div>
          <div className="key">F9</div>
          <div className="key">F10</div>
          <div className="key">F11</div>
          <div className="key">F12</div>
        </div>
        <div className="row">
          <div className="key">~</div>
          <div className="key">1</div>
          <div className="key">2</div>
          <div className="key">3</div>
          <div className="key">4</div>
          <div className="key">5</div>
          <div className="key">6</div>
          <div className="key">7</div>
          <div className="key">8</div>
          <div className="key">9</div>
          <div className="key">0</div>
          <div className="key">-</div>
          <div className="key">=</div>
          <div className="key key-wide">Backspace</div>
        </div>
        <div className="row">
          <div className="key key-wide">Tab</div>
          <div className="key">Q</div>
          {/* Highlight W with tooltip */}
          <div className="key highlight">
            W<div className="tooltip">Walk Up - Jump in Mario mode</div>
          </div>
          <div className="key">E</div>
          <div className="key">R</div>
          <div className="key">T</div>
          <div className="key">Y</div>
          <div className="key">U</div>
          <div className="key">I</div>
          <div className="key">O</div>
          <div className="key">P</div>
          <div className="key">[</div>
          <div className="key">]</div>
          <div className="key key-wide">\</div>
        </div>
        <div className="row">
          <div className="key key-wide">Caps</div>
          {/* Highlight A, S, D */}
          <div className="key highlight">
            A<div className="tooltip">Walk Left</div>
          </div>
          <div className="key highlight">
            S<div className="tooltip">Walk Down - Fireflower throwing - Mario mode</div>
          </div>
          <div className="key highlight">
            D<div className="tooltip">Walk Right</div>
          </div>
          <div className="key">F</div>
          <div className="key">G</div>
          <div className="key">H</div>
          <div className="key">J</div>
          <div className="key">K</div>
          <div className="key">L</div>
          <div className="key">;</div>
          <div className="key">'</div>
          <div className="key key-wide">Enter</div>
        </div>
        <div className="row">
          <div className="key key-extra-wide">Shift</div>
          <div className="key">Z</div>
          <div className="key">X</div>
          <div className="key">C</div>
          <div className="key">V</div>
          <div className="key">B</div>
          <div className="key">N</div>
          <div className="key">M</div>
          <div className="key">,</div>
          <div className="key">.</div>
          <div className="key">/</div>
          <div className="key key-extra-wide highlight">⌃
          <div className="tooltip">Jump</div>

          </div>
        </div>
        <div className="row">
          <div className="key">Ctrl</div>
          <div className="key">Win</div>
          <div className="key">Alt</div>
          <div className="key key-space highlight">
            Space
            <div className="tooltip">Jump</div>
          </div>
          <div className="key">Ctrl</div>
          <div className="key highlight">˂
          <div className="tooltip">Walk Left</div>

          </div>
          <div className="key highlight">˅
          <div className="tooltip">Walk Down - Fireflower throwing - Mario mode</div>

          </div>

          <div className="key highlight">
            ˃<div className="tooltip">Walk Right</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardHtml;

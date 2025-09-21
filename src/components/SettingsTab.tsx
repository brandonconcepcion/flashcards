import React from "react";
import { Clock, Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface TextOverlay {
  text: string;
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  opacity: number;
  fontSize: number;
  color: string;
  fontFamily:
    | "arial"
    | "helvetica"
    | "times"
    | "georgia"
    | "garamond"
    | "serif"
    | "sans-serif"
    | "monospace"
    | "cursive"
    | "verdana"
    | "calibri"
    | "trebuchet";
  enabled: boolean;
}

interface TimerState {
  isRunning: boolean;
  remainingTime: number;
  totalTime: number;
  startTime: number | null;
}

interface SettingsTabProps {
  textOverlay: TextOverlay;
  timer: TimerState;
  onUpdateTextOverlay: (settings: Partial<TextOverlay>) => void;
  formatTime: (time: number) => string;
  onStartTimer: (minutes?: number) => void;
  onResetTimer: (minutes?: number) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  textOverlay,
  timer,
  onUpdateTextOverlay,
  formatTime,
  onStartTimer,
  onResetTimer,
}) => {
  const [customMinutes, setCustomMinutes] = React.useState<string>("25");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings-tab">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Customize your study experience</p>
      </div>

      <div className="settings-sections">
        {/* Theme Section */}
        <div className="settings-section">
          <div className="section-header">
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
            <h3>Appearance</h3>
          </div>
          <div className="section-content">
            <div className="theme-controls">
              <div className="theme-toggle">
                <span className="theme-label">Theme</span>
                <button onClick={toggleTheme} className={`toggle-btn ${theme}`}>
                  <div className="toggle-slider">
                    {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                </button>
                <span className="theme-name">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </div>
              <p className="theme-description">
                Switch between light and dark modes. The theme will be saved and
                applied across all sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Text Overlay Section */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={20} />
            <h3>Text Overlay</h3>
          </div>
          <div className="section-content">
            <div className="text-overlay-controls">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={textOverlay.enabled}
                  onChange={(e) =>
                    onUpdateTextOverlay({ enabled: e.target.checked })
                  }
                />
                Enable text overlay
              </label>

              {textOverlay.enabled && (
                <>
                  <div className="control-group">
                    <label>Text</label>
                    <textarea
                      value={textOverlay.text}
                      onChange={(e) =>
                        onUpdateTextOverlay({ text: e.target.value })
                      }
                      placeholder="Enter your inspirational quote..."
                      rows={2}
                    />
                  </div>

                  <div className="control-group">
                    <label>Position</label>
                    <select
                      value={textOverlay.position}
                      onChange={(e) =>
                        onUpdateTextOverlay({ position: e.target.value as any })
                      }
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="center">Center</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Font</label>
                    <select
                      value={textOverlay.fontFamily}
                      onChange={(e) =>
                        onUpdateTextOverlay({
                          fontFamily: e.target.value as any,
                        })
                      }
                    >
                      <option value="arial">Arial (Default Sans-serif)</option>
                      <option value="helvetica">
                        Helvetica (Clean Sans-serif)
                      </option>
                      <option value="verdana">
                        Verdana (Readable Sans-serif)
                      </option>
                      <option value="calibri">
                        Calibri (Modern Sans-serif)
                      </option>
                      <option value="trebuchet">
                        Trebuchet MS (Stylish Sans-serif)
                      </option>
                      <option value="times">
                        Times New Roman (Default Serif)
                      </option>
                      <option value="georgia">Georgia (Readable Serif)</option>
                      <option value="garamond">Garamond (Classic Serif)</option>
                      <option value="serif">Generic Serif</option>
                      <option value="sans-serif">Generic Sans-serif</option>
                      <option value="monospace">Monaco (Monospace)</option>
                      <option value="cursive">Brush Script (Cursive)</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Font Size: {textOverlay.fontSize}rem</label>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.1"
                      value={textOverlay.fontSize}
                      onChange={(e) =>
                        onUpdateTextOverlay({
                          fontSize: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="control-group">
                    <label>
                      Opacity: {Math.round(textOverlay.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="1"
                      step="0.1"
                      value={textOverlay.opacity}
                      onChange={(e) =>
                        onUpdateTextOverlay({
                          opacity: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="control-group">
                    <label>Color</label>
                    <div className="color-picker">
                      {[
                        "#ffffff",
                        "#f8fafc",
                        "#e2e8f0",
                        "#cbd5e1",
                        "#94a3b8",
                        "#64748b",
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${
                            textOverlay.color === color ? "selected" : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => onUpdateTextOverlay({ color })}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Timer Section */}
        <div className="settings-section">
          <div className="section-header">
            <Clock size={20} />
            <h3>Study Timer</h3>
          </div>
          <div className="section-content">
            <div className="timer-display">
              <span className="timer-label">Time Remaining:</span>
              <span className="timer-value">
                {formatTime(timer.remainingTime)}
              </span>
            </div>

            <div className="timer-controls-section">
              <div className="control-group">
                <label>Set Custom Timer (minutes)</label>
                <div className="timer-input-group">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="25"
                    className="timer-input"
                  />
                  <div className="timer-action-buttons">
                    <button
                      onClick={() => {
                        const minutes = parseInt(customMinutes) || 25;
                        onStartTimer(minutes);
                      }}
                      className="btn btn-primary timer-action-btn"
                      disabled={timer.isRunning}
                    >
                      Start {customMinutes}min
                    </button>
                    <button
                      onClick={() => {
                        const minutes = parseInt(customMinutes) || 25;
                        onResetTimer(minutes);
                      }}
                      className="btn btn-secondary timer-action-btn"
                    >
                      Set {customMinutes}min
                    </button>
                  </div>
                </div>
              </div>

              <div className="timer-presets">
                <label>Quick Presets</label>
                <div className="preset-buttons">
                  {[5, 15, 25, 45, 60].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => {
                        setCustomMinutes(minutes.toString());
                        onResetTimer(minutes);
                      }}
                      className="btn btn-outline preset-btn"
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="timer-description">
              Use the countdown timer in the header for focused study sessions.
              Default is 25 minutes (Pomodoro technique).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;

'use client'

import { useCallback, useEffect, useState } from 'react'

const SETTINGS_KEY = 'superpower_world_settings'
const SAVE_KEY = 'superpower_world_save'

interface Settings {
  cameraSensitivity: number
}

const DEFAULT_SETTINGS: Settings = {
  cameraSensitivity: 1,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    return {
      cameraSensitivity: parsed.cameraSensitivity ?? DEFAULT_SETTINGS.cameraSensitivity,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // localStorage not available
  }
}

export function getCameraSensitivity(): number {
  return loadSettings().cameraSensitivity
}

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const handleSensitivityChange = useCallback((value: number) => {
    const newSettings = { ...settings, cameraSensitivity: value }
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [settings])

  const handleResetData = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY)
      localStorage.removeItem(SETTINGS_KEY)
    } catch {
      // localStorage not available
    }
    setShowResetConfirm(false)
    window.location.reload()
  }, [])

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Camera Sensitivity */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Camera Sensitivity</span>
            <span className="text-gray-400 text-sm">
              {settings.cameraSensitivity.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.cameraSensitivity}
            onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Reset Game Data */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-semibold">Reset Game Data</span>
              <p className="text-gray-400 text-xs mt-0.5">
                Delete all saved progress and settings
              </p>
            </div>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-lg font-bold text-sm bg-red-800 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Reset
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleResetData}
                  className="px-3 py-2 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-2 rounded-lg font-bold text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-xs text-center mt-4">Press Esc to close</p>
      </div>
    </div>
  )
}

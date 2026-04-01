'use client'

import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'

interface Popup {
  id: number
  amount: number
  x: number
  y: number
}

let popupId = 0

export function CurrencyPopup() {
  const [popups, setPopups] = useState<Popup[]>([])
  const prevCurrency = useRef(0)
  const currency = useGameStore((s) => s.currency)

  useEffect(() => {
    const diff = currency - prevCurrency.current
    if (diff > 0 && prevCurrency.current > 0) {
      const id = popupId++
      // Random position near the currency display (top right)
      const x = window.innerWidth - 120 + (Math.random() - 0.5) * 40
      const y = 50 + (Math.random() - 0.5) * 20
      setPopups((prev) => [...prev, { id, amount: diff, x, y }])

      // Remove after animation
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id))
      }, 1200)
    }
    prevCurrency.current = currency
  }, [currency])

  return (
    <>
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="fixed z-50 pointer-events-none text-yellow-300 font-bold text-lg animate-float-up"
          style={{
            left: popup.x,
            top: popup.y,
          }}
        >
          +{popup.amount}
        </div>
      ))}

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-30px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.8);
          }
        }
        .animate-float-up {
          animation: float-up 1.2s ease-out forwards;
        }
      `}</style>
    </>
  )
}

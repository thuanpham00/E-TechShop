import { useCallback, useEffect, useRef, useState } from "react"
import socket from "src/socket"

export default function useCheckConnectSocket({
  maxAttempts = 10,
  initialDelay = 1000 // ms
}: { maxAttempts?: number; initialDelay?: number } = {}) {
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(Boolean(socket?.connected))
  const attemptRef = useRef<number>(0)
  const timerRef = useRef<number | null>(null)
  const manualDisconnectRef = useRef<boolean>(false)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const scheduleReconnect = useCallback(() => {
    if (manualDisconnectRef.current) return
    if (socket?.connected) {
      attemptRef.current = 0
      return
    }
    if (attemptRef.current >= maxAttempts) return

    const delay = Math.min(initialDelay * 2 ** attemptRef.current, 30000)
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      attemptRef.current += 1
      try {
        socket.connect()
      } catch {
        // ignore
      }
    }, delay)
  }, [initialDelay, maxAttempts])

  useEffect(() => {
    const onConnect = () => {
      clearTimer()
      attemptRef.current = 0
      setIsSocketConnected(true)
    }
    const onDisconnect = () => {
      setIsSocketConnected(false)
      if (!manualDisconnectRef.current) scheduleReconnect()
    }
    const onConnectError = () => {
      setIsSocketConnected(false)
      scheduleReconnect()
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
      clearTimer()
    }
  }, [scheduleReconnect])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && !socket.connected && !manualDisconnectRef.current) {
        attemptRef.current = 0
        try {
          socket.connect()
        } catch {
          scheduleReconnect()
        }
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [scheduleReconnect])

  const retryConnect = useCallback(() => {
    manualDisconnectRef.current = false
    clearTimer()
    attemptRef.current = 0
    try {
      socket.connect()
    } catch {
      scheduleReconnect()
    }
  }, [scheduleReconnect])

  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true
    clearTimer()
    try {
      socket.disconnect()
    } catch {
      // ignore
    }
    setIsSocketConnected(false)
  }, [])

  return { isSocketConnected, retryConnect, disconnect }
}

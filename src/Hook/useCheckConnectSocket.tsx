/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react"
import socket from "src/socket"

// ...existing code...
export default function useCheckConnectSocket() {
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(Boolean(socket?.connected))
  const [connectError, setConnectError] = useState<string | null>(null)

  const attemptsRef = useRef(0)
  const retryTimerRef = useRef<number | null>(null)
  const isRetryingRef = useRef(false)
  const mountedRef = useRef(true)

  const MAX_ATTEMPTS = 6
  const MAX_DELAY = 20_000 // 20s cap

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    attemptsRef.current = 0
    isRetryingRef.current = false
  }, [])

  const scheduleRetry = useCallback(
    (initialDelay = 1000) => {
      if (isRetryingRef.current) return
      isRetryingRef.current = true

      const doTry = () => {
        if (!mountedRef.current) return
        if (socket?.connected) {
          clearRetry()
          return
        }

        attemptsRef.current += 1
        try {
          socket.connect?.()
        } catch {
          /* noop */
        }

        if (attemptsRef.current >= MAX_ATTEMPTS) {
          isRetryingRef.current = false
          retryTimerRef.current = null
          return
        }

        const delay = Math.min(initialDelay * 2 ** (attemptsRef.current - 1), MAX_DELAY)
        retryTimerRef.current = window.setTimeout(doTry, delay)
      }

      retryTimerRef.current = window.setTimeout(doTry, initialDelay)
    },
    [clearRetry]
  )

  const stopRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    isRetryingRef.current = false
    attemptsRef.current = 0
  }, [])

  const retryConnect = useCallback(() => {
    // explicit retry triggered by user
    stopRetry()
    setConnectError(null)
    scheduleRetry(500)
    // fallback: if not connected after 5s, reload to recreate auth/socket
    window.setTimeout(() => {
      if (!socket.connected) {
        window.location.reload()
      }
    }, 5000)
  }, [scheduleRetry, stopRetry])

  useEffect(() => {
    mountedRef.current = true

    const onConnect = () => {
      if (!mountedRef.current) return
      clearRetry()
      setConnectError(null)
      setIsSocketConnected(true)
    }

    const onDisconnect = () => {
      if (!mountedRef.current) return
      setIsSocketConnected(false)
      // start a retry cycle
      scheduleRetry(1000)
    }

    const onConnectError = (err: any) => {
      if (!mountedRef.current) return
      setIsSocketConnected(false)
      const msg = err?.message || String(err || "connect_error")
      setConnectError(msg)
      // try retry cycle (backoff)
      scheduleRetry(1000)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)

    // initial state
    setIsSocketConnected(Boolean(socket?.connected))

    // if not connected on mount, try a short retry cycle
    if (!socket?.connected) scheduleRetry(500)

    return () => {
      mountedRef.current = false
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
      clearRetry()
    }
  }, [clearRetry, scheduleRetry])

  return {
    isSocketConnected,
    connectError,
    retryConnect,
    stopRetry
  }
}

import { useState } from "react"

export default function useCopyText() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyText = async (itemRow: string) => {
    try {
      await navigator.clipboard.writeText(itemRow) // lưu thông tin vừa copy
      setCopiedId(itemRow)

      setTimeout(() => {
        setCopiedId(null) // Reset sau 2 giây
      }, 3000)
    } catch (err) {
      console.error("Copy failed!", err)
    }
  }
  return {
    copiedId,
    handleCopyText
  }
}

import { ElementType, useRef, useState } from "react"
import { FloatingPortal, Placement, arrow, offset, shift, useFloating } from "@floating-ui/react"
import { AnimatePresence, motion } from "framer-motion"

interface Props {
  children: React.ReactNode
  renderPopover: React.ReactNode
  className?: string
  as?: ElementType
  initialOpen?: boolean
  PlacementInitialState?: Placement
}

export default function Popover({
  children,
  renderPopover,
  className,
  as: Element = "div",
  initialOpen,
  PlacementInitialState = "bottom-end"
}: Props) {
  const arrowRef = useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen || false)
  const { x, y, refs, strategy, middlewareData } = useFloating({
    middleware: [offset(6), shift(), arrow({ element: arrowRef })],
    placement: PlacementInitialState
  })

  const showPopover = () => {
    return setIsOpen(true)
  }

  const hidePopover = () => {
    return setIsOpen(false)
  }

  return (
    <Element className={className} ref={refs.setReference} onMouseEnter={showPopover} onMouseLeave={hidePopover}>
      {children}

      <FloatingPortal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={refs.setFloating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                width: "max-content",
                transformOrigin: `${middlewareData.arrow?.x}`
              }}
              initial={{ opacity: 0, transform: "scale(0)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              exit={{ opacity: 0, transform: "scale(0)" }}
              transition={{ duration: 0.2 }}
            >
              <span
                ref={arrowRef}
                className="absolute border-x-transparent border-t-transparent border-b-white border-[11px] -translate-y-[98%] z-10"
                style={{
                  top: middlewareData.arrow?.y,
                  left: middlewareData.arrow?.x
                }}
              />
              {renderPopover}
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </Element>
  )
}

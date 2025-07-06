import { CreditCard, ShoppingBag, ShieldCheck } from "lucide-react"

interface Step {
  name: string
  icon: JSX.Element
}

const steps: Step[] = [
  { name: "Giỏ hàng", icon: <ShoppingBag size={16} /> },
  { name: "Thông tin đặt hàng", icon: <CreditCard size={16} /> },
  { name: "Thanh toán", icon: <CreditCard size={16} /> },
  { name: "Hoàn tất", icon: <ShieldCheck size={16} /> }
]

interface CheckoutStepsProps {
  currentStep: number // từ 0 đến 3
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="bg-red-50 p-4 rounded-md">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-7 h-7 flex items-center justify-center rounded-full 
                ${index === currentStep ? "bg-red-500 text-white" : "bg-white border border-gray-300 text-gray-500"}
              `}
            >
              {step.icon}
            </div>
            <span
              className={`text-sm mt-2 text-center ${
                index === currentStep ? "text-red-500 font-semibold" : "text-gray-600"
              }`}
            >
              {step.name}
            </span>
            {/* Đường kẻ giữa các bước */}
            {index < steps.length - 1 && (
              <div className="absolute top-3 left-1/2 w-full h-px border-t border-dotted border-gray-300 z-[2]"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

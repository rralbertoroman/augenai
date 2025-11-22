interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className="flex items-center"
          style={{ flex: index === steps.length - 1 ? "0 0 auto" : "1 1 0%" }}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-500 ease-in-out ${
                currentStep >= step.number
                  ? "bg-primary/25 text-black scale-110 shadow-md"
                  : "bg-muted text-muted-foreground scale-100"
              }`}
            >
              {step.number}
            </div>
            <span className="text-xs mt-1 whitespace-nowrap transition-opacity duration-300">
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-4 bg-muted relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-in-out ${
                  currentStep > step.number ? "w-full" : "w-0"
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

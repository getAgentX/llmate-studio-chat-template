import React from "react";

const Stepper = ({ currentStepIndex, totalSteps, goTo, heading }) => {
  const totalStepsLength = totalSteps.length;

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-8 pb-20 space-y-8">
      <h2 className="text-base font-medium tracking-wide text-center text-white">
        {heading}
      </h2>

      <div className="flex items-center justify-center w-full max-w-4xl px-6 mx-auto">
        {Array.from({ length: totalStepsLength }).map((_, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const stepNum = index + 1;

          return (
            <React.Fragment key={index}>
              {/* Step icon and text container */}
              <div className="relative flex flex-col items-center">
                {/* Step icon */}
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full p-1.5 ${
                    isActive || isCompleted ? "bg-blue-600" : "bg-[#26282D]"
                  } cursor-pointer`}
                  onClick={() => isCompleted && goTo(index)}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 fill-white"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9.707 19.121a.997.997 0 01-1.414 0l-5.646-5.647a1.5 1.5 0 010-2.121l.707-.707a1.5 1.5 0 012.121 0L9 14.171l9.525-9.525a1.5 1.5 0 012.121 0l.707.707a1.5 1.5 0 010 2.121z" />
                    </svg>
                  ) : (
                    <span
                      className={`${
                        isActive ? "bg-white w-2 h-2 rounded-full" : ""
                      }`}
                    ></span>
                  )}
                </div>

                <div
                  className={`absolute w-32 mt-4 text-xs font-medium text-center top-full tracking-wide ${
                    isActive || isCompleted
                      ? "text-white cursor-pointer"
                      : "text-white/25"
                  } ${isCompleted ? "text-white/50 hover:text-white" : ""}`}
                  onClick={() => isCompleted && goTo(index)}
                >
                  {stepNum}. {totalSteps[index].name}
                </div>
              </div>

              {index < totalStepsLength - 1 && (
                <div
                  className={`flex-grow h-1 ${
                    isCompleted ? "bg-blue-600" : "bg-[#26282D]"
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;

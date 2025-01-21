import React, { useState } from "react";

const RangeSlider = ({
  name,
  min,
  max,
  step,
  value,
  register,
  showBtn,
  update,
  label,
}) => {
  const [isSliding, setIsSliding] = useState(false);

  const handleMouseDown = () => {
    setIsSliding(true);
  };

  const handleMouseUp = () => {
    setIsSliding(false);
  };

  const calculateLabelPosition = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `${percentage}%`;
  };

  return (
    <div className="grid w-full grid-cols-12 gap-3">
      <div className="flex items-center col-span-2 space-x-3">
        <span className="text-xs text-primary-text">{label}</span>
      </div>

      <div className="col-span-10">
        {showBtn && (
          <div className="relative flex items-center space-x-2 max-w-72">
            <span className="text-sm text-secondary-text">{min}</span>

            <input
              type="range"
              min={min}
              max={max}
              step={step}
              className="w-full h-1.5 rounded-md appearance-none cursor-pointer bg-range-slider"
              {...register(name)}
              value={value}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown} // Mobile support
              onTouchEnd={handleMouseUp} // Mobile support
              disabled={update ? !showBtn : false}
            />

            {/* Floating Label */}
            {isSliding && (
              <div
                className="absolute top-[-30px] left-0 transform -translate-x-1/2 bg-primary text-primary-text text-xs py-1 px-2 rounded-md"
                style={{ left: calculateLabelPosition() }}
              >
                {value}
              </div>
            )}

            <span className="text-sm text-secondary-text">{max}</span>
          </div>
        )}

        {!showBtn && (
          <input
            type="number"
            {...register(name)}
            value={value}
            disabled={true}
            className={`w-full p-3 text-xs font-normal border rounded-md appearance-none cursor-pointer h-7 max-w-72 placeholder:text-input-placeholder bg-page ${
              !showBtn
                ? "text-input-text-inactive border-transparent py-0"
                : "text-input-text border-input-border py-3"
            }`}
          />
        )}
      </div>
    </div>
  );
};

export default RangeSlider;

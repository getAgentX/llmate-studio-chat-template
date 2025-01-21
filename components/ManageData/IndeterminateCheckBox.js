import React from "react";

function IndeterminateCheckbox({ indeterminate, checked, onChange }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <input
      type="checkbox"
      className={`w-4 h-4 text-blue-600 rounded cursor-pointer border-border accent-secondary bg-transparent ${checked ? "" : "custom_table_checkbox"
      }`}
      ref={ref}
      checked={checked}
      onChange={onChange}
    />
  );
}

export default IndeterminateCheckbox;

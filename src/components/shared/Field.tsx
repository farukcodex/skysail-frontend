import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Field({
  label,
  id,
  defaultValue,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  id: string;
  defaultValue?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const currentType = isPasswordType && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative flex items-center w-full">
        <input
          id={id}
          type={currentType}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition pr-10"
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

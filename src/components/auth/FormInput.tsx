interface FormInputProps {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isDarkMode?: boolean;
}

export default function FormInput({
  id,
  type,
  label,
  placeholder,
  onChange,
  disabled,
}: FormInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--finsight-primary-text)]"
      >
        {label}
      </label>
      <div className="mt-1.5">
        <input
          id={id}
          type={type}
          required
          placeholder={placeholder}
          className="w-full rounded-lg border border-[var(--finsight-border)] bg-[var(--finsight-surface)] px-3.5 py-2.5 text-[var(--finsight-primary-text)] placeholder-[var(--finsight-muted-text)] shadow-sm transition-colors focus:border-[var(--finsight-accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--finsight-accent-blue)]/20 disabled:opacity-60"
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

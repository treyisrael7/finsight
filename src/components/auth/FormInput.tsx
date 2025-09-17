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
  isDarkMode = false,
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="mt-1">
        <input
          id={id}
          type={type}
          required
          placeholder={placeholder}
          className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                     ${isDarkMode 
                       ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                       : 'bg-white border-gray-300 text-gray-900'}`}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

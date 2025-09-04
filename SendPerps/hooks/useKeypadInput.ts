import { useState } from 'react';

export function useKeypadInput(initialValue: string = '0') {
  const [value, setValue] = useState(initialValue);

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      if (value.length > 0) {
        const newValue = value.slice(0, -1);
        setValue(newValue || '0');
      }
    } else if (key === '.') {
      if (!value.includes('.')) {
        const newValue = value === '0' ? '0.' : value + key;
        setValue(newValue);
      }
    } else {
      if (value === '0') {
        setValue(key);
      } else {
        setValue(value + key);
      }
    }
  };

  const handleLongPress = (key: string) => {
    if (key === 'backspace') {
      setValue('0');
    }
  };

  const reset = () => setValue(initialValue);

  return {
    value,
    setValue,
    handleKeyPress,
    handleLongPress,
    reset,
  };
}
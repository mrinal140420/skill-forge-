import { FormEvent, useState } from 'react';

export const useFormState = <T extends Record<string, any>>(initialState: T) => {
  const [formData, setFormData] = useState<T>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const { name, value, type } = target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value
    }));
  };

  const reset = () => {
    setFormData(initialState);
    setError(null);
  };

  return {
    formData,
    setFormData,
    handleChange,
    reset,
    loading,
    setLoading,
    error,
    setError,
  };
};

import { useState } from 'react';
import {
  confirmUserSignUp,
  registerUser,
  setupUserAfterConfirmation,
} from '../services/auth.service';

export function useSignUp() {
  const [loading, setLoading] = useState(false);

  async function signUp(email: string, password: string, name: string) {
    setLoading(true);
    // loading is kept ON after return — caller must call setLoading(false) or it resets on confirm
    return registerUser(email, password, name);
  }

  async function confirm(
    email: string,
    code: string,
    password: string,
    name: string,
    phone?: string,
    cpf?: string,
    birthDate?: string,
  ) {
    setLoading(true);
    try {
      await confirmUserSignUp(email, code);
      await setupUserAfterConfirmation(email, password, name, phone, cpf, birthDate);
    } finally {
      setLoading(false);
    }
  }

  function stopLoading() {
    setLoading(false);
  }

  return { signUp, confirm, stopLoading, loading };
}

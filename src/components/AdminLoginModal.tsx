import React, { useState } from 'react';
import { signInAdmin, signOutAdmin } from '../services/authService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  adminEmail: string | null;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  adminEmail,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInAdmin(email.trim(), password);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError('Неверный email или пароль.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOutAdmin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-[#d0c5af]/40">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#735c00]">admin_panel_settings</span>
            <h2 className="text-lg font-bold text-[#1b1b1d]">
              {isAdmin ? 'Админ-доступ' : 'Вход для администратора'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#eae7ea] text-[#4d4635]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <p className="text-sm text-[#4d4635]">
              Вы вошли как <strong>{adminEmail}</strong>. У вас есть доступ к редактированию каталога.
            </p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 rounded-xl border border-[#d0c5af] text-[#4d4635] text-sm font-semibold hover:bg-[#eae7ea]"
            >
              Выйти
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-[#4d4635]">
              Без входа сайт открыт всем как каталог для просмотра. Вход нужен только для
              редактирования украшений.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#4d4635] mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                placeholder="admin@aiaigold.kg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4d4635] mb-1">Пароль</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-xl bg-[#735c00] text-white text-sm font-bold hover:bg-[#574500] disabled:opacity-60"
            >
              {isSubmitting ? 'Входим…' : 'Войти'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

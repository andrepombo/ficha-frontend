import { useState, FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const copy = useMemo(
    () => ({
      en: {
        title: 'Welcome back',
        subtitle: 'Sign in to access your dashboard',
        emailLabel: 'Email',
        emailPlaceholder: 'Enter your email',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        remember: 'Remember me',
        forgot: 'Forgot your password?',
        submit: 'Sign in',
        demo: 'Demo mode: use your email and the password 12345 to enter.',
        footer: "Don’t have an account?",
        footerLink: 'Contact an administrator',
        errorFallback: 'Invalid username or password',
        toggleLabel: 'Switch to Portuguese',
      },
      pt: {
        title: 'Bem-vindo de volta',
        subtitle: 'Faça login para acessar seu painel',
        emailLabel: 'E-mail',
        emailPlaceholder: 'Digite seu e-mail',
        passwordLabel: 'Senha',
        passwordPlaceholder: 'Digite sua senha',
        remember: 'Lembrar-me',
        forgot: 'Esqueceu sua senha?',
        submit: 'Entrar',
        demo: 'Modo demonstração: use seu e-mail e a senha 12345 para entrar.',
        footer: 'Não tem uma conta?',
        footerLink: 'Entre em contato com o administrador',
        errorFallback: 'Usuário ou senha inválidos',
        toggleLabel: 'Switch to English',
      },
    }),
    []
  );

  const t = copy[language];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || t.errorFallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full text-xs bg-indigo-600 text-white border border-indigo-500 inline-flex items-center gap-1.5 shadow-sm hover:bg-indigo-700 transition"
          >
            {language === 'pt' ? (
              <>
                <span>EN</span>
                <span role="img" aria-label="English">🇬🇧</span>
              </>
            ) : (
              <>
                <span>PT</span>
                <span role="img" aria-label="Portuguese">🇧🇷</span>
              </>
            )}
          </button>
        </div>
        {/* Logo/Brand Section */}
        <div className="text-center">
          <div className="mx-auto h-32 w-32 flex items-center justify-center">
            <img src="/painel/andre.svg" alt="Andre" className="h-32 w-32 object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.emailLabel}
              </label>
              <input
                id="username"
                name="username"
                type="email"
                autoComplete="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                placeholder={t.emailPlaceholder}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                placeholder={t.passwordPlaceholder}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  {t.remember}
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
                >
                  {t.forgot}
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                t.submit
              )}
            </button>
          </form>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm shadow-sm">
          {t.demo.replace('12345', '<pw>')
            .split('<pw>')
            .map((segment, idx) =>
              idx === 1 ? (
                <span key={idx} className="font-semibold">12345</span>
              ) : (
                <span key={idx}>{segment}</span>
              )
            )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          {t.footer}{' '}
          <a
            href="#"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
          >
            {t.footerLink}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

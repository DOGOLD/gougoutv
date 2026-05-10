'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import IOSCompatibility from '@/components/IOSCompatibility';
import { useSite } from '@/components/SiteProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldAskUsername, setShouldAskUsername] = useState(false);
  const [enableRegister, setEnableRegister] = useState(false);
  const { siteName } = useSite();

  // 在客户端挂载后设置配置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageType = window.RUNTIME_CONFIG?.STORAGE_TYPE;
      // 始终显示用户名输入框，允许管理员登录
      setShouldAskUsername(true);
      setEnableRegister(
        Boolean(window.RUNTIME_CONFIG?.ENABLE_REGISTER)
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!password || (shouldAskUsername && !username)) return;

    try {
      setLoading(true);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          ...(shouldAskUsername ? { username } : {}),
        }),
      });

      if (res.ok) {
        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } else if (res.status === 401) {
        setError('密码错误');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '服务器错误');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理注册逻辑
  const handleRegister = async () => {
    setError(null);
    if (!password || !username) return;

    try {
      setLoading(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '服务器错误');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IOSCompatibility>
      <div className='relative min-h-screen flex items-center justify-center px-4 overflow-hidden'>
        {/* iOS Safari兼容的背景渐变 */}
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'></div>

        {/* 简化的装饰性元素 - iOS Safari兼容 */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/20 rounded-full opacity-30 blur-xl'></div>
          <div className='absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/20 rounded-full opacity-30 blur-xl'></div>
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-400/15 rounded-full opacity-20 blur-lg'></div>
        </div>

        <div className='absolute top-4 right-4'>
          <ThemeToggle />
        </div>

        <div className='relative z-10 w-full max-w-md rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl p-10 dark:border dark:border-zinc-800 border border-gray-200'>
          {/* 简化的Logo - iOS Safari兼容 */}
          <h1 className='text-center text-3xl font-extrabold mb-8'>
            <span className='bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent'>
              {siteName}
            </span>
          </h1>

          <form onSubmit={handleSubmit} className='space-y-8'>
            {shouldAskUsername && (
              <div>
                <label htmlFor='username' className='sr-only'>
                  用户名
                </label>
                <input
                  id='username'
                  type='text'
                  autoComplete='username'
                  className='block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-gray-300 dark:ring-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none sm:text-base bg-white dark:bg-zinc-800'
                  placeholder='输入用户名'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor='password' className='sr-only'>
                密码
              </label>
              <input
                id='password'
                type='password'
                autoComplete='current-password'
                className='block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-gray-300 dark:ring-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none sm:text-base bg-white dark:bg-zinc-800'
                placeholder='输入访问密码'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            )}

            {/* 登录 / 注册按钮 */}
            {shouldAskUsername && enableRegister ? (
              <div className='flex gap-4'>
                <button
                  type='button'
                  onClick={handleRegister}
                  disabled={!password || !username || loading}
                  className='flex-1 inline-flex justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {loading ? '注册中...' : '注册'}
                </button>
                <button
                  type='submit'
                  disabled={
                    !password || loading || (shouldAskUsername && !username)
                  }
                  className='flex-1 inline-flex justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {loading ? '登录中...' : '登录'}
                </button>
              </div>
            ) : (
              <button
                type='submit'
                disabled={
                  !password || loading || (shouldAskUsername && !username)
                }
                className='inline-flex w-full justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {loading ? '登录中...' : '登录'}
              </button>
            )}
          </form>
        </div>
      </div>
    </IOSCompatibility>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}

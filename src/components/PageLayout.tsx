import { Clover, Film, Home, Search, Tv, Menu, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { BackButton } from './BackButton';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface PageLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const TopNavbar = ({ activePath = '/' }: { activePath?: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { siteName } = useSite();
  const [active, setActive] = useState(activePath);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (activePath) {
      setActive(activePath);
    } else {
      const getCurrentFullPath = () => {
        const queryString = searchParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
      };
      const fullPath = getCurrentFullPath();
      setActive(fullPath);
    }
  }, [activePath, pathname, searchParams]);

  const handleSearchClick = useCallback(() => {
    router.push('/search');
  }, [router]);

  const menuItems = [
    { icon: Home, label: '首页', href: '/' },
    { icon: Search, label: '搜索', href: '/search' },
    { icon: Film, label: '电影', href: '/douban?type=movie' },
    { icon: Tv, label: '剧集', href: '/douban?type=tv' },
    { icon: Clover, label: '综艺', href: '/douban?type=show' },
  ];

  return (
    <>
      {/* 桌面端导航栏 - 赛博朋克风格 */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <div className="relative">
          {/* 背景渐变层 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f] backdrop-blur-2xl opacity-95"></div>

          {/* 顶部发光线 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"></div>

          {/* 底部发光边框 */}
          <div className="absolute bottom-0 left-0 right-0 h-px">
            <div className="h-full bg-gradient-to-r from-purple-600/40 via-pink-500/50 to-cyan-500/40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/60 via-pink-500/70 to-cyan-500/60 blur-sm"></div>
          </div>

          {/* 装饰性网格 */}
          <div className="absolute inset-0 cyber-grid-bg opacity-10"></div>

          {/* 主内容 */}
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo区域 */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center group">
                  <div className="relative">
                    {/* Logo发光效果 */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-lg blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-md blur opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                    {/* Logo图标 */}
                    <div className="relative flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0f]/80 rounded-lg border border-white/10">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-xl font-black tracking-tight cyber-gradient-text">
                        {siteName}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 导航菜单 */}
              <div className="flex items-center space-x-2">
                {menuItems.map((item) => {
                  const typeMatch = item.href.match(/type=([^&]+)/)?.[1];
                  const tagMatch = item.href.match(/tag=([^&]+)/)?.[1];
                  const decodedActive = decodeURIComponent(active);
                  const decodedItemHref = decodeURIComponent(item.href);

                  const isActive =
                    decodedActive === decodedItemHref ||
                    (decodedActive.startsWith('/douban') &&
                      decodedActive.includes(`type=${typeMatch}`) &&
                      tagMatch &&
                      decodedActive.includes(`tag=${tagMatch}`));

                  const Icon = item.icon;

                  if (item.href === '/search') {
                    return (
                      <button
                        key={item.label}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSearchClick();
                          setActive('/search');
                        }}
                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
                      >
                        {/* 发光背景 */}
                        {isActive && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-cyan-600/30 rounded-xl"></div>
                            <div className="absolute inset-0 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.4)]"></div>
                          </>
                        )}
                        {/* 悬停发光 */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}
                        <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                        <span className="relative z-10">{item.label}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActive(item.href)}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
                    >
                      {isActive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-cyan-600/30 rounded-xl"></div>
                          <div className="absolute inset-0 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.4)]"></div>
                        </>
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      )}
                      <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* 右侧按钮 */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="w-px h-8 bg-white/10"></div>
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 移动端导航栏 */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-xl"></div>
          {/* 底部发光线 */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple-500/50 via-pink-500/60 to-cyan-500/50"></div>
          <div className="relative flex items-center justify-between h-16 px-4">
            <Link href="/" className="flex items-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md blur opacity-50"></div>
                <span className="relative text-lg font-bold cyber-gradient-text">{siteName}</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-2 rounded-xl text-white/80 hover:text-white transition-colors group"
            >
              <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {mobileMenuOpen ? <X size={24} className="relative z-10" /> : <Menu size={24} className="relative z-10" />}
            </button>
          </div>

          {/* 移动端菜单 */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-[#0a0a0f]/98 backdrop-blur-xl border-b border-white/10">
              {/* 菜单背景装饰 */}
              <div className="absolute inset-0 cyber-grid-bg opacity-5"></div>
              <div className="relative px-4 py-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-gradient-to-r from-purple-600/10 to-pink-600/10 transition-all group"
                    >
                      <Icon size={20} className="text-purple-400" />
                      <span className="group-hover:text-purple-300 transition-colors">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

const PageLayout = ({ children, activePath = '/' }: PageLayoutProps) => {
  return (
    <div className="w-full min-h-screen bg-[#0a0a0f]">
      {/* 全局背景网格 */}
      <div className="fixed inset-0 cyber-grid-bg opacity-20 pointer-events-none"></div>

      {/* 背景渐变光效 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* 移动端头部 */}
      <MobileHeader showBackButton={['/play'].includes(activePath)} />

      {/* 桌面端顶部导航栏 */}
      <TopNavbar activePath={activePath} />

      {/* 主内容区域 */}
      <div className="relative min-w-0 transition-all duration-300 lg:pt-20">
        {/* 桌面端左上角返回按钮 */}
        {['/play'].includes(activePath) && (
          <div className="absolute top-3 left-1 z-20 hidden lg:flex">
            <BackButton />
          </div>
        )}

        {/* 主内容容器 */}
        <main className="mb-14 lg:mb-0 lg:p-6 xl:p-8">
          <div className="flex w-full min-h-[calc(100vh-4rem)]">
            {/* 左侧留白区域 */}
            <div
              className="hidden lg:block flex-shrink-0"
              style={{ width: ['/play'].includes(activePath) ? '8.33%' : '16.67%' }}
            ></div>

            {/* 主内容区 */}
            <div
              className="flex-1 lg:flex-none w-full"
              style={{ width: ['/play'].includes(activePath) ? '83.33%' : '66.67%' }}
            >
              <div
                className="p-4 lg:p-8 xl:p-10"
                style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
              >
                {children}
              </div>
            </div>

            {/* 右侧留白区域 */}
            <div
              className="hidden lg:block flex-shrink-0"
              style={{ width: ['/play'].includes(activePath) ? '8.33%' : '16.67%' }}
            ></div>
          </div>
        </main>
      </div>

      {/* 移动端底部导航 */}
      <div className="lg:hidden">
        <MobileBottomNav activePath={activePath} />
      </div>
    </div>
  );
};

export default PageLayout;

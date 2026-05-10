/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

import {
  type Favorite,
  clearAllFavorites,
  getAllFavorites,
  getAllPlayRecords,
  subscribeToDataUpdates,
} from '@/lib/db.client';
import { getDoubanCategories } from '@/lib/douban.client';
import { DoubanItem } from '@/lib/types';

import CapsuleSwitch from '@/components/CapsuleSwitch';
import ContinueWatching from '@/components/ContinueWatching';
import PageLayout from '@/components/PageLayout';
import PaginatedRow from '@/components/PaginatedRow';
import { useSite } from '@/components/SiteProvider';
import VideoCard from '@/components/VideoCard';

// 漂浮粒子组件 - 使用固定种子确保 SSR 和客户端渲染一致
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{
    top: string;
    left: string;
    opacity: number;
    delay: string;
  }>>([]);

  useEffect(() => {
    // 使用固定种子生成随机数，确保服务端和客户端渲染一致
    const seed = 42;
    const seededRandom = (function (s) {
      return function () {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
      };
    })(seed);

    const generatedParticles = [...Array(12)].map((_, i) => ({
      top: `${20 + seededRandom() * 60}%`,
      left: `${10 + seededRandom() * 80}%`,
      opacity: 0.3 + seededRandom() * 0.4,
      delay: `${i * 0.2}s`,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"
          style={{
            top: particle.top,
            left: particle.left,
            animationDelay: particle.delay,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
};

// 主内容区大型 GouGouTV Logo 组件 - 赛博朋克风格
const MainGouGouLogo = () => {
  return (
    <div className="relative py-12 overflow-hidden">
      {/* 背景网格 */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30"></div>

      {/* 中心发光效果 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute inset-1/3 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 装饰性圆环 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-64 h-64 border border-purple-500/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute inset-8 border border-pink-500/15 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
        <div className="absolute inset-16 border border-cyan-500/10 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
      </div>

      {/* 漂浮粒子 */}
      <FloatingParticles />

      {/* 主内容 */}
      <div className="relative text-center">
        {/* Logo */}
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-lg blur opacity-75 animate-pulse"></div>
          <h1 className="relative text-5xl md:text-7xl font-black tracking-tight cyber-gradient-text px-4 py-2">
            GouGouTV
          </h1>
        </div>

        {/* 副标题 */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-lg md:text-xl text-white/60 font-medium tracking-widest">
            极致影视体验，尽在指尖
          </span>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>

        {/* 装饰线 */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="w-20 h-px bg-gradient-to-r from-transparent to-purple-500"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-20 h-px bg-gradient-to-l from-transparent to-purple-500"></div>
        </div>
      </div>
    </div>
  );
};

// GouGouTV 底部 Logo 组件 - 赛博朋克风格
const BottomGouGouLogo = () => {
  return (
    <div className="relative py-16 mt-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-purple-500/20 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-pink-500/20 to-transparent"></div>
      </div>

      {/* 主内容 */}
      <div className="relative text-center">
        <div className="inline-flex items-center gap-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-purple-500"></div>
          <h2 className="text-2xl md:text-3xl font-bold cyber-gradient-text">GouGouTV</h2>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-purple-500"></div>
        </div>
        <p className="mt-3 text-sm text-white/40 font-medium tracking-wider">
          Powered by GouGouTV Core
        </p>
      </div>
    </div>
  );
};

function HomeClient() {
  const [activeTab, setActiveTab] = useState<'home' | 'favorites'>('home');
  const [hotMovies, setHotMovies] = useState<DoubanItem[]>([]);
  const [hotTvShows, setHotTvShows] = useState<DoubanItem[]>([]);
  const [hotVarietyShows, setHotVarietyShows] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { announcement } = useSite();

  const [moviePage, setMoviePage] = useState(0);
  const [tvShowPage, setTvShowPage] = useState(0);
  const [varietyShowPage, setVarietyShowPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState({
    movies: false,
    tvShows: false,
    varietyShows: false,
  });
  const [hasMoreData, setHasMoreData] = useState({
    movies: true,
    tvShows: true,
    varietyShows: true,
  });

  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && announcement) {
      const hasSeenAnnouncement = localStorage.getItem('hasSeenAnnouncement');
      if (hasSeenAnnouncement !== announcement) {
        setShowAnnouncement(true);
      } else {
        setShowAnnouncement(Boolean(!hasSeenAnnouncement && announcement));
      }
    }
  }, [announcement]);

  type FavoriteItem = {
    id: string;
    source: string;
    title: string;
    poster: string;
    episodes: number;
    source_name: string;
    currentEpisode?: number;
    search_title?: string;
  };

  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const fetchDoubanData = async () => {
      try {
        setLoading(true);
        const [moviesData, tvShowsData, varietyShowsData] = await Promise.all([
          getDoubanCategories({ kind: 'movie', category: '热门', type: '全部' }),
          getDoubanCategories({ kind: 'tv', category: 'tv', type: 'tv' }),
          getDoubanCategories({ kind: 'tv', category: 'show', type: 'show' }),
        ]);

        if (moviesData.code === 200) setHotMovies(moviesData.list);
        if (tvShowsData.code === 200) setHotTvShows(tvShowsData.list);
        if (varietyShowsData.code === 200) setHotVarietyShows(varietyShowsData.list);
      } catch (error) {
        // 静默处理错误
      } finally {
        setLoading(false);
      }
    };
    fetchDoubanData();
  }, []);

  const loadMoreMovies = async () => {
    if (loadingMore.movies || !hasMoreData.movies) return;
    setLoadingMore(prev => ({ ...prev, movies: true }));
    try {
      const nextPage = moviePage + 1;
      const moviesData = await getDoubanCategories({
        kind: 'movie',
        category: '热门',
        type: '全部',
        pageStart: nextPage * 20,
        pageLimit: 20,
      });
      if (moviesData.code === 200 && moviesData.list.length > 0) {
        setHotMovies(prev => [...prev, ...moviesData.list]);
        setMoviePage(nextPage);
        if (moviesData.list.length < 20) setHasMoreData(prev => ({ ...prev, movies: false }));
      } else {
        setHasMoreData(prev => ({ ...prev, movies: false }));
      }
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoadingMore(prev => ({ ...prev, movies: false }));
    }
  };

  const loadMoreTvShows = async () => {
    if (loadingMore.tvShows || !hasMoreData.tvShows) return;
    setLoadingMore(prev => ({ ...prev, tvShows: true }));
    try {
      const nextPage = tvShowPage + 1;
      const tvShowsData = await getDoubanCategories({
        kind: 'tv',
        category: 'tv',
        type: 'tv',
        pageStart: nextPage * 20,
        pageLimit: 20,
      });
      if (tvShowsData.code === 200 && tvShowsData.list.length > 0) {
        setHotTvShows(prev => [...prev, ...tvShowsData.list]);
        setTvShowPage(nextPage);
        if (tvShowsData.list.length < 20) setHasMoreData(prev => ({ ...prev, tvShows: false }));
      } else {
        setHasMoreData(prev => ({ ...prev, tvShows: false }));
      }
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoadingMore(prev => ({ ...prev, tvShows: false }));
    }
  };

  const loadMoreVarietyShows = async () => {
    if (loadingMore.varietyShows || !hasMoreData.varietyShows) return;
    setLoadingMore(prev => ({ ...prev, varietyShows: true }));
    try {
      const nextPage = varietyShowPage + 1;
      const varietyShowsData = await getDoubanCategories({
        kind: 'tv',
        category: 'show',
        type: 'show',
        pageStart: nextPage * 20,
        pageLimit: 20,
      });
      if (varietyShowsData.code === 200 && varietyShowsData.list.length > 0) {
        setHotVarietyShows(prev => [...prev, ...varietyShowsData.list]);
        setVarietyShowPage(nextPage);
        if (varietyShowsData.list.length < 20) setHasMoreData(prev => ({ ...prev, varietyShows: false }));
      } else {
        setHasMoreData(prev => ({ ...prev, varietyShows: false }));
      }
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoadingMore(prev => ({ ...prev, varietyShows: false }));
    }
  };

  const updateFavoriteItems = async (allFavorites: Record<string, Favorite>) => {
    const allPlayRecords = await getAllPlayRecords();
    const sorted = Object.entries(allFavorites)
      .sort(([, a], [, b]) => b.save_time - a.save_time)
      .map(([key, fav]) => {
        const plusIndex = key.indexOf('+');
        const source = key.slice(0, plusIndex);
        const id = key.slice(plusIndex + 1);
        const playRecord = allPlayRecords[key];
        const currentEpisode = playRecord?.index;
        return {
          id,
          source,
          title: fav.title,
          year: fav.year,
          poster: fav.cover,
          episodes: fav.total_episodes,
          source_name: fav.source_name,
          currentEpisode,
          search_title: fav?.search_title,
        } as FavoriteItem;
      });
    setFavoriteItems(sorted);
  };

  useEffect(() => {
    if (activeTab !== 'favorites') return;
    const loadFavorites = async () => {
      const allFavorites = await getAllFavorites();
      await updateFavoriteItems(allFavorites);
    };
    loadFavorites();
    const unsubscribe = subscribeToDataUpdates(
      'favoritesUpdated',
      (newFavorites: Record<string, Favorite>) => {
        updateFavoriteItems(newFavorites);
      }
    );
    return unsubscribe;
  }, [activeTab]);

  const handleCloseAnnouncement = (announcement: string) => {
    setShowAnnouncement(false);
    localStorage.setItem('hasSeenAnnouncement', announcement);
  };

  // 章节标题组件
  const SectionTitle = ({ title, href }: { title: string; href?: string }) => (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
        <h2 className="text-xl md:text-2xl font-bold">
          <span className="cyber-gradient-text">{title}</span>
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-white/50 hover:text-purple-400 transition-colors group"
        >
          <span className="group-hover:translate-x-1 transition-transform">查看更多</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );

  // 骨架屏组件
  const SkeletonCard = () => (
    <div className="w-full">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl">
        <div className="absolute inset-0 cyber-skeleton"></div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 cyber-skeleton rounded w-3/4"></div>
        <div className="h-3 cyber-skeleton rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <div className="relative">
        {/* 背景网格 */}
        <div className="absolute inset-0 cyber-grid-bg opacity-20 pointer-events-none"></div>

        {/* 主内容 */}
        <div className="relative px-4 sm:px-8 lg:px-12 py-4 sm:py-8">
          {/* 主 Logo - 仅在首页显示 */}
          {activeTab === 'home' && <MainGouGouLogo />}

          {/* Tab 切换 */}
          <div className="mb-8 flex justify-center">
            <CapsuleSwitch
              options={[
                { label: '首页', value: 'home' },
                { label: '收藏夹', value: 'favorites' },
              ]}
              active={activeTab}
              onChange={(value) => setActiveTab(value as 'home' | 'favorites')}
            />
          </div>

          {/* 内容区域 */}
          <div className="w-full">
            {activeTab === 'favorites' ? (
              // 收藏夹视图
              <>
                <section className="mb-12">
                  <div className="mb-6 flex items-center justify-between">
                    <SectionTitle title="我的收藏" />
                    {favoriteItems.length > 0 && (
                      <button
                        className="text-sm text-white/50 hover:text-pink-400 transition-colors flex items-center gap-1"
                        onClick={async () => {
                          await clearAllFavorites();
                          setFavoriteItems([]);
                        }}
                      >
                        <span>清空</span>
                      </button>
                    )}
                  </div>

                  {/* 收藏夹网格 */}
                  <div className="grid grid-cols-3 gap-x-2 gap-y-14 sm:gap-y-20 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fill,_minmax(11rem,_1fr))] sm:gap-x-6 lg:gap-x-8 justify-items-center">
                    {favoriteItems.map((item) => (
                      <div key={item.id + item.source} className="w-full max-w-44">
                        <VideoCard
                          query={item.search_title}
                          {...item}
                          from="favorite"
                          type={item.episodes > 1 ? 'tv' : ''}
                        />
                      </div>
                    ))}
                    {favoriteItems.length === 0 && (
                      <div className="col-span-full text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-white/30" />
                        </div>
                        <p className="text-white/50 text-lg">暂无收藏内容</p>
                        <p className="text-white/30 text-sm mt-2">快去发现精彩影视吧</p>
                      </div>
                    )}
                  </div>
                </section>

                <BottomGouGouLogo />
              </>
            ) : (
              // 首页视图
              <>
                {/* 继续观看 */}
                <ContinueWatching />

                {/* 热门电影 */}
                <section className="mb-12">
                  <SectionTitle title="热门电影" href="/douban?type=movie" />
                  <PaginatedRow
                    itemsPerPage={10}
                    onLoadMore={loadMoreMovies}
                    hasMoreData={hasMoreData.movies}
                    isLoading={loadingMore.movies}
                  >
                    {loading
                      ? Array.from({ length: 10 }).map((_, index) => (
                        <div key={index} className="w-full">
                          <SkeletonCard />
                        </div>
                      ))
                      : hotMovies.map((movie, index) => (
                        <div key={index} className="w-full">
                          <VideoCard
                            from="douban"
                            title={movie.title}
                            poster={movie.poster}
                            douban_id={movie.id}
                            rate={movie.rate}
                            year={movie.year}
                            type="movie"
                          />
                        </div>
                      ))}
                  </PaginatedRow>
                </section>

                {/* 热门剧集 */}
                <section className="mb-12">
                  <SectionTitle title="热门剧集" href="/douban?type=tv" />
                  <PaginatedRow
                    itemsPerPage={10}
                    onLoadMore={loadMoreTvShows}
                    hasMoreData={hasMoreData.tvShows}
                    isLoading={loadingMore.tvShows}
                  >
                    {loading
                      ? Array.from({ length: 10 }).map((_, index) => (
                        <div key={index} className="w-full">
                          <SkeletonCard />
                        </div>
                      ))
                      : hotTvShows.map((show, index) => (
                        <div key={index} className="w-full">
                          <VideoCard
                            from="douban"
                            title={show.title}
                            poster={show.poster}
                            douban_id={show.id}
                            rate={show.rate}
                            year={show.year}
                          />
                        </div>
                      ))}
                  </PaginatedRow>
                </section>

                {/* 热门综艺 */}
                <section className="mb-12">
                  <SectionTitle title="热门综艺" href="/douban?type=show" />
                  <PaginatedRow
                    itemsPerPage={10}
                    onLoadMore={loadMoreVarietyShows}
                    hasMoreData={hasMoreData.varietyShows}
                    isLoading={loadingMore.varietyShows}
                  >
                    {loading
                      ? Array.from({ length: 10 }).map((_, index) => (
                        <div key={index} className="w-full">
                          <SkeletonCard />
                        </div>
                      ))
                      : hotVarietyShows.map((show, index) => (
                        <div key={index} className="w-full">
                          <VideoCard
                            from="douban"
                            title={show.title}
                            poster={show.poster}
                            douban_id={show.id}
                            rate={show.rate}
                            year={show.year}
                          />
                        </div>
                      ))}
                  </PaginatedRow>
                </section>

                <BottomGouGouLogo />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 公告弹窗 */}
      {announcement && showAnnouncement && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 ${showAnnouncement ? '' : 'opacity-0 pointer-events-none'
            }`}
        >
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#12121a] to-[#0a0a0f] p-6 shadow-2xl border border-white/10 transform transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">提示</h3>
              </div>
              <button
                onClick={() => handleCloseAnnouncement(announcement)}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="关闭"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
            <div className="relative overflow-hidden rounded-xl mb-6 bg-white/5 border border-white/10">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
              <p className="ml-4 py-4 text-white/70 leading-relaxed">{announcement}</p>
            </div>
            <button
              onClick={() => handleCloseAnnouncement(announcement)}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}

import { CheckCircle, Heart, Link } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type Favorite,
  deleteFavorite,
  deletePlayRecord,
  generateStorageKey,
  isFavorited,
  saveFavorite,
  subscribeToDataUpdates,
} from '@/lib/db.client';
import { SearchResult } from '@/lib/types';
import { processImageUrl } from '@/lib/utils';

import { ImagePlaceholder } from '@/components/ImagePlaceholder';

interface VideoCardProps {
  id?: string;
  source?: string;
  title?: string;
  query?: string;
  poster?: string;
  episodes?: number;
  source_name?: string;
  progress?: number;
  year?: string;
  from: 'playrecord' | 'favorite' | 'search' | 'douban';
  currentEpisode?: number;
  douban_id?: string;
  onDelete?: () => void;
  rate?: string;
  items?: SearchResult[];
  type?: string;
}

export default function VideoCard({
  id,
  title = '',
  query = '',
  poster = '',
  episodes,
  source,
  source_name,
  progress = 0,
  year,
  from,
  currentEpisode,
  douban_id,
  onDelete,
  rate,
  items,
  type = '',
}: VideoCardProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAggregate = from === 'search' && !!items?.length;

  const aggregateData = useMemo(() => {
    if (!isAggregate || !items) return null;
    const countMap = new Map<string | number, number>();
    const episodeCountMap = new Map<number, number>();
    items.forEach((item) => {
      if (item.douban_id && item.douban_id !== 0) {
        countMap.set(item.douban_id, (countMap.get(item.douban_id) || 0) + 1);
      }
      const len = item.episodes?.length || 0;
      if (len > 0) {
        episodeCountMap.set(len, (episodeCountMap.get(len) || 0) + 1);
      }
    });

    const getMostFrequent = <T extends string | number>(
      map: Map<T, number>
    ) => {
      let maxCount = 0;
      let result: T | undefined;
      map.forEach((cnt, key) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          result = key;
        }
      });
      return result;
    };

    return {
      first: items[0],
      mostFrequentDoubanId: getMostFrequent(countMap),
      mostFrequentEpisodes: getMostFrequent(episodeCountMap) || 0,
    };
  }, [isAggregate, items]);

  const actualTitle = aggregateData?.first.title ?? title;
  const actualPoster = aggregateData?.first.poster ?? poster;
  const actualSource = aggregateData?.first.source ?? source;
  const actualId = aggregateData?.first.id ?? id;
  const actualDoubanId = String(
    aggregateData?.mostFrequentDoubanId ?? douban_id
  );
  const actualEpisodes = aggregateData?.mostFrequentEpisodes ?? episodes;
  const actualYear = aggregateData?.first.year ?? year;
  const actualQuery = query || '';
  const actualSearchType = isAggregate
    ? aggregateData?.first.episodes?.length === 1
      ? 'movie'
      : 'tv'
    : type;

  useEffect(() => {
    if (from === 'douban' || !actualSource || !actualId) return;

    const fetchFavoriteStatus = async () => {
      try {
        const fav = await isFavorited(actualSource, actualId);
        setFavorited(fav);
      } catch (err) {
        throw new Error('检查收藏状态失败');
      }
    };

    fetchFavoriteStatus();

    const storageKey = generateStorageKey(actualSource, actualId);
    const unsubscribe = subscribeToDataUpdates(
      'favoritesUpdated',
      (newFavorites: Record<string, Favorite>) => {
        const isNowFavorited = !!newFavorites[storageKey];
        setFavorited(isNowFavorited);
      }
    );

    return unsubscribe;
  }, [from, actualSource, actualId]);

  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (from === 'douban' || !actualSource || !actualId) return;
      try {
        if (favorited) {
          await deleteFavorite(actualSource, actualId);
          setFavorited(false);
        } else {
          await saveFavorite(actualSource, actualId, {
            title: actualTitle,
            source_name: source_name || '',
            year: actualYear || '',
            cover: actualPoster,
            total_episodes: actualEpisodes ?? 1,
            save_time: Date.now(),
          });
          setFavorited(true);
        }
      } catch (err) {
        throw new Error('切换收藏状态失败');
      }
    },
    [
      from,
      actualSource,
      actualId,
      actualTitle,
      source_name,
      actualYear,
      actualPoster,
      actualEpisodes,
      favorited,
    ]
  );

  const handleDeleteRecord = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (from !== 'playrecord' || !actualSource || !actualId) return;
      try {
        await deletePlayRecord(actualSource, actualId);
        onDelete?.();
      } catch (err) {
        throw new Error('删除播放记录失败');
      }
    },
    [from, actualSource, actualId, onDelete]
  );

  const handleClick = useCallback(() => {
    if (from === 'douban') {
      router.push(
        `/play?title=${encodeURIComponent(actualTitle.trim())}${actualYear ? `&year=${actualYear}` : ''
        }${actualSearchType ? `&stype=${actualSearchType}` : ''}`
      );
    } else if (actualSource && actualId) {
      router.push(
        `/play?source=${actualSource}&id=${actualId}&title=${encodeURIComponent(
          actualTitle
        )}${actualYear ? `&year=${actualYear}` : ''}${isAggregate ? '&prefer=true' : ''
        }${actualQuery ? `&stitle=${encodeURIComponent(actualQuery.trim())}` : ''
        }${actualSearchType ? `&stype=${actualSearchType}` : ''}`
      );
    }
  }, [
    from,
    actualSource,
    actualId,
    router,
    actualTitle,
    actualYear,
    isAggregate,
    actualQuery,
    actualSearchType,
  ]);

  const config = useMemo(() => {
    const configs = {
      playrecord: {
        showSourceName: true,
        showProgress: false,
        showPlayButton: true,
        showHeart: true,
        showCheckCircle: true,
        showDoubanLink: false,
        showRating: false,
      },
      favorite: {
        showSourceName: true,
        showProgress: false,
        showPlayButton: true,
        showHeart: true,
        showCheckCircle: false,
        showDoubanLink: false,
        showRating: false,
      },
      search: {
        showSourceName: true,
        showProgress: false,
        showPlayButton: true,
        showHeart: !isAggregate,
        showCheckCircle: false,
        showDoubanLink: !!actualDoubanId,
        showRating: false,
      },
      douban: {
        showSourceName: false,
        showProgress: false,
        showPlayButton: true,
        showHeart: false,
        showCheckCircle: false,
        showDoubanLink: true,
        showRating: !!rate,
      },
    };
    return configs[from] || configs.search;
  }, [from, isAggregate, actualDoubanId, rate]);

  return (
    <div
      className="group relative w-full cursor-pointer transition-all duration-500 ease-out hover:-translate-y-4 hover:z-10"
      onClick={handleClick}
    >
      {/* 卡片外发光效果 */}
      <div className="absolute -inset-1 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-cyan-600/0 group-hover:from-purple-600/20 group-hover:via-pink-600/15 group-hover:to-cyan-600/20 rounded-2xl blur-xl transition-all duration-500"></div>

      {/* 主卡片容器 */}
      <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-2xl overflow-hidden border border-white/5 group-hover:border-purple-500/30 transition-all duration-500">
        {/* 装饰性边框层 */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        </div>

        {/* 海报容器 */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {/* 骨架屏 */}
          {!isLoading && <ImagePlaceholder aspectRatio="aspect-[2/3]" />}

          {/* 图片 */}
          <Image
            src={processImageUrl(actualPoster)}
            alt={actualTitle}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-115"
            referrerPolicy="no-referrer"
            onLoadingComplete={() => setIsLoading(true)}
          />

          {/* 渐变遮罩层 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent"></div>

          {/* 悬浮渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-pink-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

          {/* 边框发光效果 */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/40 rounded-2xl transition-all duration-500 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.35)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* 播放按钮 - 赛博朋克风格 */}
          {config.showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
              <div className="relative">
                {/* 最外层光晕 */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                {/* 外层光晕 */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                {/* 按钮主体 */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 flex items-center justify-center shadow-xl shadow-purple-500/50 transition-all duration-300 hover:scale-115">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="relative z-10 w-8 h-8 text-white ml-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          {(config.showHeart || config.showCheckCircle) && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              {config.showCheckCircle && (
                <button
                  onClick={handleDeleteRecord}
                  className="relative w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 hover:bg-purple-600/80 hover:scale-110 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] border border-white/10 hover:border-purple-500/50"
                >
                  <CheckCircle size={18} />
                </button>
              )}
              {config.showHeart && (
                <button
                  onClick={handleToggleFavorite}
                  className={`relative w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/10 ${favorited
                      ? 'bg-red-500/80 text-white border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-black/60 text-white hover:bg-pink-500/80 hover:border-pink-400/50'
                    }`}
                >
                  <Heart size={18} className={favorited ? 'fill-current' : ''} />
                </button>
              )}
            </div>
          )}

          {/* 评分徽章 */}
          {config.showRating && rate && (
            <div className="absolute top-3 right-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  {rate}
                </div>
              </div>
            </div>
          )}

          {/* 集数徽章 */}
          {actualEpisodes && actualEpisodes > 1 && (
            <div className="absolute top-3 left-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg shadow-purple-500/30 border border-white/10">
                  {currentEpisode ? `${currentEpisode}/${actualEpisodes}` : `${actualEpisodes}集`}
                </div>
              </div>
            </div>
          )}

          {/* 豆瓣链接 */}
          {config.showDoubanLink && actualDoubanId && (
            <a
              href={`https://movie.douban.com/subject/${actualDoubanId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-cyan-500 text-white text-xs font-bold w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 transition-transform">
                  <Link size={14} />
                </div>
              </div>
            </a>
          )}
        </div>

        {/* 信息区域 */}
        <div className="relative p-3 pt-2 bg-gradient-to-t from-[#0a0a0f]/90 to-transparent">
          {/* 标题 */}
          <div className="relative">
            <h3 className="block text-sm font-semibold truncate text-white/90 transition-all duration-300 group-hover:text-purple-300">
              {actualTitle}
            </h3>
          </div>

          {/* 年份和来源 */}
          <div className="flex items-center justify-between mt-2">
            {year && (
              <span className="text-xs text-white/40 font-medium">{year}</span>
            )}
            {config.showSourceName && source_name && (
              <span className="text-xs text-white/40 font-medium bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {source_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

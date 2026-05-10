/* eslint-disable no-console */

'use client';

const CURRENT_VERSION = '20250904200125';

// 版本检查结果枚举
export enum UpdateStatus {
  HAS_UPDATE = 'has_update', // 有新版本
  NO_UPDATE = 'no_update', // 无新版本
  FETCH_FAILED = 'fetch_failed', // 获取失败
}

// 版本检查URL - 已禁用
const VERSION_CHECK_URLS: string[] = [];

/**
 * 检查是否有新版本可用 - 已禁用
 * @returns Promise<UpdateStatus> - 返回版本检查状态
 */
export async function checkForUpdates(): Promise<UpdateStatus> {
  return UpdateStatus.FETCH_FAILED;
}

/**
 * 从指定URL获取版本信息 - 已禁用
 * @param url - 版本信息URL
 * @returns Promise<string | null> - 版本字符串或null
 */
async function fetchVersionFromUrl(url: string): Promise<string | null> {
  return null;
}

/**
 * 比较版本号 - 已禁用
 * @param remoteVersion - 远程版本号
 * @returns UpdateStatus - 返回版本比较结果
 */
function compareVersions(remoteVersion: string): UpdateStatus {
  return UpdateStatus.FETCH_FAILED;
}

// 导出当前版本号供其他地方使用
export { CURRENT_VERSION };

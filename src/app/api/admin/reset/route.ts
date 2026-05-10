/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { getAuthInfoFromCookie } from '@/lib/auth';
import { resetConfig } from '@/lib/config';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';

  const authInfo = getAuthInfoFromCookie(request);
  if (!authInfo || !authInfo.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const username = authInfo.username;

  // 在localstorage模式下，只有admin用户可以重置配置
  if (storageType === 'localstorage') {
    if (username !== 'admin') {
      return NextResponse.json({ error: '仅admin用户可重置配置' }, { status: 401 });
    }
  } else {
    // 在数据库模式下，只有站长可以重置配置
    if (username !== process.env.USERNAME) {
      return NextResponse.json({ error: '仅支持站长重置配置' }, { status: 401 });
    }
  }

  try {
    await resetConfig();

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store', // 管理员配置不缓存
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: '重置管理员配置失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

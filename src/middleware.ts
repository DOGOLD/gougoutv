/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // 移除所有访问控制检查，允许所有用户直接访问网站
  return NextResponse.next();
}

// 配置middleware匹配规则（保持为空，不匹配任何路径）
export const config = {
  matcher: [],
};

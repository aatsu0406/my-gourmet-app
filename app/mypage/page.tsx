'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  // ここにユーザー情報などを保持するStateを作る予定
  
  return (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 text-stone-800">
      <div className="max-w-2xl mx-auto">
        
        {/* 左上の戻るボタン（投稿ページと同じ仕組み） */}
        <nav className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors group">
            <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </div>
            <span className="text-sm font-bold">ホームへ戻る</span>
          </Link>
        </nav>

        {/* ユーザープロフィールのカード */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
          {/* ヘッダー部分：マットな色味を出す */}
          <div className="bg-zinc-800 p-10 text-center">
            <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-inner border-4 border-zinc-700">
              👤
            </div>
            <h1 className="text-2xl font-black text-white">ゲストユーザー</h1>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">ぐるログ会員ステータス: Gold</p>
          </div>

          {/* 統計・設定などのコンテンツ */}
          <div className="p-8 space-y-6">
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
              <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 ml-1">ぐるログ履歴</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-[10px] text-stone-400 font-bold mb-1">総訪問数</p>
                  <p className="text-2xl font-black text-orange-600">0</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-[10px] text-stone-400 font-bold mb-1">今月の訪問数</p>
                  <p className="text-2xl font-black text-stone-800">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
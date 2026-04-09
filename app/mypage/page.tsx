'use client'; // ブラウザ上で動く「クライアントコンポーネント」であることを宣言

import { useState, useEffect } from 'react';  // Reactの基本機能（状態管理、副作用実行）を読み込む
import Link from 'next/link'; // ページ間を高速移動するためのリンクコンポーネントを読み込む
import { useRouter } from 'next/navigation';  // プログラムからページを移動させる機能を読み込む
import { supabase } from '../../src/lib/supabase';  // データベース（Supabase）を操作する設定済みのインスタンスを読み込む

export default function MyPage() {  // MyPageという名前のメイン部品（ページ）を定義
  // 状態（State）を定義 
    const [loading, setLoading] = useState(true); // 読み込み中かどうか（初期値：true）
    const [totalCount, setTotalCount] = useState<number | null>(null);  // 全投稿数（最初は空っぽ）
    const [monthlyCount, setMonthlyCount] = useState<number | null>(null);  // 今月の投稿数（最初は空っぽ）

  useEffect(() => { // 画面が表示された時に1回だけ実行する
    async function fetchData() {  // 非同期（時間がかかる処理）を行うための関数
      try {
        // ① 今月の1日を取得（例: 2026-04-01T00:00:00Z）
        const now = new Date(); // 今日の日付を取得
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();  // 今月の「1日」を計算して標準形式の文字列に変換

        // ② 2つのクエリを並列（同時）に実行
        const [totalRes, monthlyRes] = await Promise.all([  // 2つの通信が両方終わるまで待機
          // 全件数
          supabase.from('posts').select('*', { count: 'exact', head: true }), // postsテーブルの全行数をカウント（データ中身は見ない）
          // 今月分のみ（作成日がfirstDay以上のもの）
          supabase.from('posts')  // postsテーブルに対して
            .select('*', { count: 'exact', head: true })  // 行数をカウントし
            .gte('created_at', firstDay)  // created_atカラムが今月1日（firstDay）以上のものだけに絞り込む
        ]);

        if (totalRes.error) throw totalRes.error; // 全件取得でエラーがあればcatchへ飛ばす
        if (monthlyRes.error) throw monthlyRes.error; // 今月分取得でエラーがあればcatchへ飛ばす

        setTotalCount(totalRes.count);  // 取得した全件数をStateに保存
        setMonthlyCount(monthlyRes.count);  // 取得した今月分件数をStateに保存
      } catch (error) {
        console.error('データ取得エラー:', error);  // 失敗した内容をコンソールに表示
      } finally {
        setLoading(false);  // 成功しても失敗しても、読み込み中（loading）を終了させる
      }
    }

  fetchData();  // 上で定義した関数を実際に呼び出す
  }, []); // 依存配列が空なので、ページ読み込み時の1回のみ実行

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
                  <p className="text-2xl font-black text-orange-600">
                    {/* ロード中は「...」を表示し、終わったら件数を出す */}
                    {loading ? '...' : totalCount ?? 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-[10px] text-stone-400 font-bold mb-1">今月の訪問数</p>
                  <p className="text-2xl font-black text-stone-800">
                    {/* ロード中なら...、終わったら数値を出す */}
                    {loading ? '...' : monthlyCount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
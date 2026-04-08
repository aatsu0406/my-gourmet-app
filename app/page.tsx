'use client'; // ブラウザ側で動く部品であることを明示

import { useEffect, useState } from 'react';  //この一行を書くところからスタートするのが標準的なお作法 タイミングをコントロールして（useEffect）」「データを保持・更新する（useState）
import { supabase } from '../src/lib/supabase'; // 自作の接続設定 あらかじめ別のファイルで作っておいた『接続済みの窓口（supabaseオブジェクト）』を、このファイルに持ってくる
import Link from 'next/link';

//データの器を用意
export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  //posts:投稿内容を入れる箱  DBから届いたデータの保存
  //setPosts:配列に取得したデータを入れて更新させるもの
  const [loading, setLoading] = useState(true); //loading:処理中判定
  const [isMenuOpen, setIsMenuOpen] = useState(false);  //メニューが開いているかを覚える定数

//データ取得の関数定義
  const fetchPosts = async () => {
    setLoading(true); //読み込み中スイッチをONにする
    
    try {
      // Supabaseから「投稿」と「紐付いたタグ」をまとめて取得
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_tags (
            tags (
              tag_name
            )
          )
        `)
        .order('created_at', { ascending: false }); //昇順ソート

      if (error) {  //エラーあればコンソールに表示
        console.error('データの取得に失敗しました:', error.message);
      } else {  //問題なければ取得データを「posts」に格納
        console.log('取得したデータ:', data);
        setPosts(data || []);
      }
    } catch (err) { //予期せぬエラー時のハンドリング
      console.error('予期せぬエラーが発生しました:', err);
    } finally { //最終的に読み込み中スイッチのOFF
      setLoading(false);
    }
  };

  //「いつ」動かすかを決めるスイッチ
  useEffect(() => {
    fetchPosts(); // 画面が開いた瞬間に実行！
  }, []);

  //読み込み中時の画面表示
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="text-zinc-400 font-bold text-xl animate-pulse">読み込み中...</div>
    </div>
  );

  //画面全体のレイアウト設定
  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8 text-black">
      <div className="max-w-2xl mx-auto">
      {/* 1. ハンバーガーボタン */}
      <button onClick={() => setIsMenuOpen(true)}
        className="p-3 bg-white rounded-2xl shadow-sm text-stone-600 hover:text-orange-600 transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
        </svg>
      </button>
      {/* 2. スライドメニュー（isOpenがtrueのときだけ現れる） */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <button onClick={() => setIsMenuOpen(false)} className="mb-8 text-stone-400 hover:text-white">
            ✕ 閉じる
          </button>
          <nav className="space-y-6">
            <Link href="/" className="block text-lg font-bold text-white hover:text-orange-400 transition-colors" onClick={() => setIsMenuOpen(false)}>ホーム</Link>
            <Link href="/post" className="block text-lg font-bold text-white hover:text-orange-400">投稿ページ</Link>
            <Link href="/mypage" className="block text-lg font-bold text-white hover:text-orange-400">マイページ</Link>
          </nav>
        </div>
      </div>
      {/* 3. 背景のぼかし（メニュー以外をタップで閉じる用） */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
          onClick={() => setIsMenuOpen(false)} 
        />
      )}
        {/* ヘッダーと「記録する」ボタン */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-zinc-400 italic tracking-tighter">ぐるログ</h1>
            <p className="text-xs text-zinc-400 font-bold ml-1">こだわりの一品を、忘れないうちに。</p>
          </div>
          <a 
            href="/post" 
            className="bg-zinc-400 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all active:scale-95 text-sm"
          >
            ＋ 記録する
          </a>
        </header>

        {/* データの繰り返し表示（map関数） */}
        <div className="space-y-6">
          {posts.length === 0 ? ( //投稿が0件の時 三項演算子での記述
            <div className="bg-white p-12 rounded-3xl text-center shadow-sm border-2 border-dashed border-orange-100">
              <p className="text-gray-400 font-bold">まだ投稿がありません。<br/>右上のボタンから最初の記録をしてみよう！</p>
            </div>
          ) : (
            //map関数
            posts.map((post) => ( // 1件以上あるとき、データの数だけ繰り返す
              <article key={post.id} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  {/* 店名・評価・タグの表示 */}
                  <h2 className="text-2xl font-bold text-gray-800">{post.shop_name}</h2>
                  <div className="flex items-center bg-orange-100 px-3 py-1 rounded-full">
                    <span className="text-orange-500 text-lg">★</span>
                    <span className="text-orange-600 font-black ml-1">{post.rating}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.post_tags?.map((pt: any, i: number) => (
                    <span key={i} className="text-[10px] font-black text-white bg-orange-400 px-3 py-1 rounded-full">
                      #{pt.tags?.tag_name}
                    </span>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.comment || "（コメントなし）"}
                  </p>
                </div>
                
                <div className="flex justify-end items-center border-t border-gray-100 pt-3">
                  <span className="text-[10px] text-gray-400 font-bold">
                    {/* 日付の変換 */}
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
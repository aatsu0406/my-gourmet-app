'use client';

import { useEffect, useState } from 'react';
// 以前のスクリーンショットに基づき、src/lib/supabase.ts の正しい場所を指すように修正します。
// app/page.tsx から見ると、src/lib/supabase.ts は ../src/lib/supabase になります。
import { supabase } from '../src/lib/supabase';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('データの取得に失敗しました:', error.message);
      } else {
        console.log('取得したデータ:', data);
        setPosts(data || []);
      }
    } catch (err) {
      console.error('予期せぬエラーが発生しました:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="text-orange-500 font-bold text-xl animate-pulse">読み込み中...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8 text-black">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-orange-600 italic tracking-tighter">GOURMET LOG</h1>
            <p className="text-xs text-gray-500 font-bold ml-1">こだわりの一杯を、忘れないうちに。</p>
          </div>
          <a 
            href="/post" 
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all active:scale-95 text-sm"
          >
            ＋ 記録する
          </a>
        </header>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center shadow-sm border-2 border-dashed border-orange-100">
              <p className="text-gray-400 font-bold">まだ投稿がありません。<br/>右上のボタンから最初の記録をしてみよう！</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
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
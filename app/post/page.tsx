'use client';

import { useState, useEffect } from 'react';
/**
 * インポートパスの修正:
 * アップロードされた画像 image_990c2e.png のディレクトリ構造を再確認しました。
 * - src/lib/supabase.ts
 * - app/post/page.tsx
 * * プレビュー環境のビルドにおいて、'../../src/lib/supabase' では解決できない場合があるため、
 * より直接的な相対パス、あるいは環境に合わせたパス指定を試行します。
 */
import { supabase } from '../../src/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PostPage() {
  const [shopName, setShopName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    try {
      // 1. postsテーブルへ保存
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ shop_name: shopName, comment: comment, rating: rating }])
        .select()
        .single();

      if (postError) throw postError;

      // 2. タグの保存と紐付け
      if (tags.length > 0) {
        for (const tagName of tags) {
          const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .upsert({ tag_name: tagName }, { onConflict: 'tag_name' })
            .select()
            .single();

          if (tagError) throw tagError;

          await supabase
            .from('post_tags')
            .insert({ post_id: postData.id, tag_id: tagData.id });
        }
      }

      router.push('/');   //自動でホームに戻る
      setShopName('');
      setComment('');
      setTags([]);
      
    } catch (error: any) {
      console.error('保存失敗:', error);
      alert('エラーが発生しました：\n' + (error.message || '不明なエラー'));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors group">
            <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </div>
            <span className="text-sm font-bold">ホームへ戻る</span>
          </Link>
        </div>
        <div className="w-full max-w-lg bg-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
          <div className="bg-gradient-to-br bg-zinc-400 p-10 text-center text-white">
            <h1 className="text-3xl font-black tracking-tighter text-white">ぐるログ</h1>
            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">こだわりの一品を、忘れないうちに。</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-black">店舗名</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-4 focus:ring-orange-100 outline-none font-bold text-black"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="店舗名を入力"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-black">ハッシュタグ追加</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, i) => (
                  <span key={i} className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                    #{tag}
                    <button type="button" onClick={() => removeTag(i)} className="ml-2">×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-4 focus:ring-orange-100 outline-none text-sm font-bold text-black"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="ハッシュタグを入力してEnter"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-black">評価</label>
              <select 
                className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-4 focus:ring-orange-100 outline-none font-bold text-orange-500"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map(v => (
                  <option key={v} value={v}>{'★'.repeat(v)}{'☆'.repeat(5-v)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-black">内容</label>
              <textarea
                className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl h-32 focus:ring-4 focus:ring-orange-100 outline-none text-sm font-medium resize-none text-black"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="内容を入力してください"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-5 rounded-2xl font-black text-white shadow-lg transition-all ${
                loading ? 'bg-slate-300' : 'bg-zinc-400 hover:bg-orange-600 active:scale-95'
              }`}
            >
              {loading ? '投稿しています...' : '投稿する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
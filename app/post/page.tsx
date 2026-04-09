'use client';

import { useState, useEffect, SubmitEvent } from 'react';
import { supabase } from '../../src/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PostPage() {
  const [shopName, setShopName] = useState(''); // 店舗名の入力内容を覚える
  const [comment, setComment] = useState(''); // コメントの入力内容を覚える
  const [rating, setRating] = useState(5);  // 評価（★の数）を覚える。初期値は5
  const [tagInput, setTagInput] = useState(''); // 今入力中の「タグ1つ分」の文字
  const [tags, setTags] = useState<string[]>([]); // 確定して並んでいる「タグのリスト」
  const [loading, setLoading] = useState(false);  // 投稿ボタン連打防止用の「通信中フラグ」
  const [mounted, setMounted] = useState(false);  // 画面がブラウザで表示されたか判定
  const router = useRouter(); // 投稿後に画面を切り替えるための道具

  useEffect(() => {
    setMounted(true);
  }, []);

  //タグを確定させる
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) { // Enterが押され、かつ文字があれば
      e.preventDefault(); // 本来のEnterの動き（送信など）を止める
      if (!tags.includes(tagInput.trim())) {  // まだ同じタグがリストになければ
        setTags([...tags, tagInput.trim()]);  // 今までのタグリストに新しいタグを追加！
      }
      setTagInput('');  // 入力欄を空っぽにする
    }
  };

  //間違えて追加してしまったタグを、ポチッと消すための処理
  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));  // 指定した番号以外を残す（＝削除）
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {  //「フォームが送信された」というイベント情報 e を受け取る
    e.preventDefault(); // 画面のリロードを防ぐ
    if (!supabase) return;  //DBとの接続準備ができていなかったら、ここで処理を中止
    setLoading(true);  // 「投稿中...」状態にしてボタンを無効化

    try {
      // 1. postsテーブルへ保存
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ shop_name: shopName, comment: comment, rating: rating }])
        .select() // 保存した直後のデータ（IDなど）を返してもらう
        .single();  // 1件だけなのでオブジェクトとして受け取る

      if (postError) throw postError; // 失敗したらcatchブロックへ飛ばす

      // 2. タグの保存と紐付け
      if (tags.length > 0) {
        for (const tagName of tags) { // タグの数だけ繰り返す
          const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .upsert({ tag_name: tagName }, { onConflict: 'tag_name' })  // 「あれば使う、なければ作る」を判断
            .select() // その結果を画面（プログラム）に戻して！
            .single();  // データは1件だけのはずだから、1件として扱って！

          if (tagError) throw tagError;

          // 中間テーブルに「この投稿」と「このタグ」のIDをセットで保存
          await supabase
            .from('post_tags')
            .insert({ post_id: postData.id, tag_id: tagData.id });
        }
      }

      router.push('/');   // ホーム画面へ自動で戻る（Next.jsの便利な機能）
      // 入力欄をリセット（念のため）
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
                onChange={(e) => setShopName(e.target.value)} // 文字が打たれるたびにStateを更新
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
                onChange={(e) => setTagInput(e.target.value)} // 文字が打たれるたびにStateを更新
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
                onChange={(e) => setComment(e.target.value)}  // 文字が打たれるたびにStateを更新
                placeholder="内容を入力してください"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} // 通信中はボタンを押せなくする
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
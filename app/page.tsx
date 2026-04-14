'use client'; // ブラウザ側で動く部品であることを明示

import { useEffect, useState } from 'react';  //この一行を書くところからスタートするのが標準的なお作法 タイミングをコントロールして（useEffect）」「データを保持・更新する（useState）
import { supabase } from '../src/lib/supabase'; // 自作の接続設定 あらかじめ別のファイルで作っておいた『接続済みの窓口（supabaseオブジェクト）』を、このファイルに持ってくる
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 画面遷移のための道具
import { Toaster, toast } from 'react-hot-toast'; // トースト通知のための部品と道具

//データの器を用意
export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);  //投稿内容を入れる箱
  const [loading, setLoading] = useState(true); //loading:処理中判定
  const [isMenuOpen, setIsMenuOpen] = useState(false);  //メニューが開いているかを覚える定数
  const [selectedTag, setSelectedTag] = useState<string | null>(null);  //「今どのタグが選ばれているか」をReactに覚えさせるための定数
  const [tagList, setTagList] = useState<any[]>([]); //タグのリストを入れる器
  const router = useRouter(); //画面遷移のための道具
  // 編集ボタンを押した時の動き
  const handleEdit = (id: number) => {
    // 投稿ページに「id」をくっつけて飛ばす！
    router.push(`/post?id=${id}`);
  };

//データ取得の関数定義
  const fetchAllData = async () => {
    setLoading(true); //読み込み中スイッチをONにする
    try {
      //投稿データのクエリ作成
      let postQuery = supabase
        .from('posts')
        .select(`
          *,
          post_tags!inner (
            tags!inner (tag_name)
          )
        `)
        .order('created_at', { ascending: false }); //新しい順に並べる

      //もしタグが選択されていたら、条件を追加する
      if (selectedTag) {
        postQuery = postQuery.eq('post_tags.tags.tag_name', selectedTag);
      }

      // --- 投稿とタグを同時に取得開始 ---
      const [postsResponse, tagsResponse] = await Promise.all([
        postQuery,
        supabase
          .from('tags')
          .select('tag_name, post_tags(count)') //タグと、そのタグが何回投稿に使われているかを同時に取る
      ]);

      // --- 投稿データの反映 ---
      if (postsResponse.error) throw postsResponse.error;
      setPosts(postsResponse.data || []);

      // --- タグ一覧の反映 ---
      if (tagsResponse.error) throw tagsResponse.error;
        const formattedTags = tagsResponse.data?.map((tag) => ({
          tag_name: tag.tag_name,
          count: tag.post_tags?.[0]?.count || 0 //投稿数をカウント
        }))
        .filter((tag) => tag.count > 0)   // 1件以上のタグだけを抽出
        || [];
      setTagList(formattedTags);

    } catch (error: any) {
      console.error('データ取得に失敗しました:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ★ 2. 実行タイミングの管理
  useEffect(() => {
    fetchAllData();
  }, [selectedTag]); // タグが変わるたびに fetchAllData が走る

  // ★ 3. 削除処理（ここも fetchAllData を再利用できる）
  const handleDelete = async (id: number) => {
  // 1. 「確認用」のトーストを出す
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="font-bold text-sm">削除しますか？</p>
      <div className="flex gap-2">
        {/* 「はい」を押した時の処理 */}
        <button
          onClick={async () => {
            toast.dismiss(t.id); // 確認トーストを消す
            
            // 削除実行（いつもの流れ）
            const loadToast = toast.loading('削除中...');
            try {
              const { error } = await supabase.from('posts').delete().eq('id', id);
              if (error) throw error;
              toast.success('削除しました', { id: loadToast });
              fetchAllData();
            } catch (e) {
              toast.error('削除に失敗しました…', { id: loadToast });
            }
          }}
          className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
        >
          削除する
        </button>

        {/* 「いいえ」を押した時の処理 */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
        >
          キャンセル
        </button>
      </div>
    </div>
  ), {
    duration: 3000, // 3秒経ったら勝手に消える設定
    position: 'top-center',
  });
};

  //読み込み中時の画面表示
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="text-zinc-400 font-bold text-xl animate-pulse">読み込み中...</div>
    </div>
  );

  //画面全体のレイアウト設定
  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8 text-black">
      <Toaster /> {/* トースト通知を表示するための部品 */}
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

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {/* 全表示ボタン */}
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full border ${selectedTag === null ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            すべて
          </button>

          {/* 各タグのボタン */}
          {tagList.map((tag) => ( // ← ここは ( ) なので注意！
            <button
              key={tag.tag_name}
              onClick={() => setSelectedTag(tag.tag_name)}
              className={`px-4 py-2 rounded-full border ${
                selectedTag === tag.tag_name ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              {tag.tag_name}
              <span className="ml-1.5 text-xs opacity-70">
                ({tag.count})
              </span>
            </button>
          ))}
      </div>

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
                
                <div className="flex justify-end items-center border-t border-gray-100 pt-3 gap-3">
                {/* 編集ボタン */}
                  <button 
                    onClick={() => handleEdit(post.id)}
                    className="text-[11px] font-bold text-slate-500 hover:text-orange-600 active:scale-90 transition-all cursor-pointer"
                  >
                    編集
                  </button>

                  {/* 削除ボタン */}
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
                  >
                    削除
                  </button>

                  {/* 日付（これの左側にボタンを並べた） */}
                  <span className="text-[10px] text-gray-400 font-bold ml-auto">
                    {new Date(post.created_at).toLocaleString('ja-JP')}
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
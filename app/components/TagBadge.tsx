// 1. 「この部品を使うには、どんなデータが必要か」を定義する（型定義）
interface TagBadgeProps {
  tagName: string;
}

// 2. 部品本体を作成
export const TagBadge = ({ tagName }: TagBadgeProps) => {
  return (
    <span className="text-[10px] font-black text-white bg-orange-400 px-3 py-1 rounded-full">
      #{tagName}
    </span>
  );
};
# デプロイ手順ガイド

## ① Node.js のインストール（まだの場合）

https://nodejs.org/ja/ から **LTS版** をダウンロードしてインストール

インストール確認：
```bash
node --version   # v20.x.x が表示されればOK
npm --version
```

---

## ② GitHubへ push

### GitHub CLIをインストール（推奨）
```bash
brew install gh
gh auth login   # ブラウザで認証
```

### リポジトリを作成して push
```bash
cd "~/Documents/Claude code/naishi-mitsumore"

# GitHub上にリポジトリ作成 & push（一発）
gh repo create naishi-mitsumore --public --source=. --remote=origin --push
```

#### gh CLI使わない場合（手動）
1. https://github.com/new でリポジトリ「naishi-mitsumore」を作成
2. 以下を実行：
```bash
cd "~/Documents/Claude code/naishi-mitsumore"
git remote add origin https://github.com/あなたのユーザー名/naishi-mitsumore.git
git push -u origin main
```

---

## ③ Supabase プロジェクト作成

1. https://supabase.com でアカウント作成・ログイン
2. 「New project」でプロジェクト作成
3. 「SQL Editor」で `supabase/migrations/001_init.sql` の内容を貼り付けて実行
4. 「Project Settings」→「API」から以下をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### スタッフアカウントの作成
Supabase の「Authentication」→「Users」→「Add user」から
スタッフのメールアドレスとパスワードを登録。

その後、SQL Editorで以下を実行（スタッフ名を設定）：
```sql
INSERT INTO public.profiles (id, name, role)
SELECT id, 'スタッフ名', 'staff'
FROM auth.users
WHERE email = 'staff@example.com';
```

---

## ④ Vercel へデプロイ

### Vercel CLIでデプロイ
```bash
npm install -g vercel
cd "~/Documents/Claude code/naishi-mitsumore"
vercel --prod
```

### または Vercel ダッシュボードから（推奨・簡単）
1. https://vercel.com でログイン
2. 「Add New Project」→ GitHubリポジトリ「naishi-mitsumore」を選択
3. 「Environment Variables」に以下を追加：
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxx...
   ```
4. 「Deploy」をクリック → 数分でURLが発行される！

---

## ⑤ 完成！

Vercelから発行されたURL（例：`https://naishi-mitsumore.vercel.app`）を
スタッフ全員に共有すれば、どこからでもアクセスできるで！

### セキュリティについて
- URLはオープンだが、**ログインしないと使えない**（middleware.tsで保護済み）
- スタッフアカウントはSupabaseで管理者が作成する運用
- 全データはSupabaseのRLS（行レベルセキュリティ）で保護されてる

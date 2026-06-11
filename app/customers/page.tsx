export default function CustomersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-16 text-center text-gray-400">
          <p className="text-lg mb-2">顧客がまだ登録されていません</p>
          <p className="text-sm">Supabaseを接続すると顧客データが表示されます</p>
        </div>
      </div>
    </div>
  )
}

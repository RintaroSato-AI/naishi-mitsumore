import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未ログイン' }, { status: 401 })

  const formData = await req.formData()
  const status = formData.get('status') as string

  const allowed = ['draft', 'sent', 'approved', 'rejected', 'expired']
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: '無効なステータス' }, { status: 400 })
  }

  const { error } = await supabase
    .from('estimates')
    .update({ status })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.redirect(new URL(`/estimates/${params.id}`, req.url))
}

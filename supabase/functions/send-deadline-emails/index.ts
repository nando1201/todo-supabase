/// <reference lib="deno.window" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend'

// 1. Ambil Secrets
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
// 💡 Gunakan SERVICE_ROLE_KEY untuk bypass RLS (Supabase otomatis menyediakan ini di Edge Functions)
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

Deno.serve(async (_req: Request) => {
  try {
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY belum terpasang di Secrets!' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Client Admin (Bypass RLS)
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const resend = new Resend(resendApiKey)

    // Tanggal Hari Ini (Format: YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]

    // 2. Ambil data todos bertanggal hari ini & is_completed = false
    const { data: upcomingTodos, error: dbError } = await supabase
      .from('todos')
      .select('id, title, due_date, user_id')
      .eq('due_date', today)
      .eq('is_completed', false)

    if (dbError) throw dbError

    const sent = []
    const failed = []

    if (upcomingTodos && upcomingTodos.length > 0) {
      // Ambil user_id unik
      const userIds = [...new Set(upcomingTodos.map(t => t.user_id))]
      
      // Ambil email dari tabel profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds)

      if (profileError) console.error('Profile Error:', profileError)

      const profileMap = new Map(profiles?.map(p => [p.id, p.email]))

      // 3. Loop & Kirim Email
      for (const todo of upcomingTodos) {
        const userEmail = profileMap.get(todo.user_id)

        if (userEmail) {
          try {
            await resend.emails.send({
              from: 'TodoApp <onboarding@resend.dev>',
              to: userEmail,
              subject: `⏰ Pengingat: Tugas "${todo.title || 'Tugas Kamu'}" tenggat waktu hari ini!`,
              html: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2>Halo!</h2>
                  <p>Tugas kamu <strong>${todo.title || 'Tugas Tanpa Judul'}</strong> memiliki tenggat waktu hari ini (${todo.due_date}).</p>
                  <p>Jangan lupa untuk segera menyelesaikannya ya!</p>
                </div>
              `,
            })
            sent.push({ id: todo.id, email: userEmail })
          } catch (sendError) {
            failed.push({ id: todo.id, email: userEmail, reason: String(sendError) })
          }
        } else {
          failed.push({ id: todo.id, email: null, reason: 'Email tidak ditemukan di tabel profiles' })
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Proses selesai', 
        today, 
        total: upcomingTodos?.length || 0, 
        sent, 
        failed 
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || String(err) }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
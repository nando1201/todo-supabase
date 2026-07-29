/// <reference lib="deno.window" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'https://esm.sh/nodemailer@6.9.10'

const gmailUser = Deno.env.get('GMAIL_USER')
const gmailAppPass = Deno.env.get('GMAIL_APP_PASS')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (_req: Request) => {
  try {
    if (!gmailUser || !gmailAppPass || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Secrets (GMAIL_USER / GMAIL_APP_PASS / SERVICE_ROLE_KEY) belum dipasang di Supabase!' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Setup Server Transporter Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPass,
      },
    })

    // Rentang Tanggal Hari Ini (00:00:00 - 23:59:59 lokal)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

    // 1. Ambil data todos bertanggal hari ini & belum selesai
    const { data: upcomingTodos, error: dbError } = await supabase
      .from('todos')
      .select('id, title, due_date, user_id')
      .gte('due_date', startOfDay)
      .lte('due_date', endOfDay)
      .eq('is_completed', false)

    if (dbError) throw dbError

    const sent = []
    const failed = []

    if (upcomingTodos && upcomingTodos.length > 0) {
      // 2. Ambil seluruh data user dari auth.users
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      const userMap = new Map(users.map(u => [u.id, u.email]))

      // 3. Loop & Kirim ke email masing-masing pemilik tugas
      for (const todo of upcomingTodos) {
        const targetEmail = userMap.get(todo.user_id)

        if (targetEmail) {
          try {
            await transporter.sendMail({
              from: `"TugasKu" <${gmailUser}>`,
              to: targetEmail, // Email user masing-masing
              subject: `⏰ Pengingat: Tugas "${todo.title || 'Tugas Kamu'}" tenggat waktu hari ini!`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                  <h2>Halo!</h2>
                  <p>Tugas kamu <strong>"${todo.title || 'Tanpa Judul'}"</strong> memiliki tenggat waktu hari ini.</p>
                  <p>Jangan lupa untuk segera menyelesaikannya di TugasKu ya!</p>
                </div>
              `,
            })

            sent.push({ id: todo.id, email: targetEmail })
          } catch (sendErr) {
            failed.push({ id: todo.id, email: targetEmail, reason: String(sendErr) })
          }
        } else {
          failed.push({ id: todo.id, email: null, reason: 'Email user tidak ditemukan' })
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Proses kirim email pengingat via Gmail sukses!', 
        total_tugas_hari_ini: upcomingTodos?.length || 0, 
        terkirim: sent, 
        gagal: failed 
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
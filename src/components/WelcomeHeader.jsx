export default function WelcomeHeader({ userName, activeTodos, progressPercent, completedTodos, totalTodos, onAddTodo }) {
  return (
    <div className="rounded-md bg-[#20302A] text-white p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#9CB4A5]">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl">
            Selamat pagi, {userName || 'Fernando'}
          </h1>
          <p className="text-[#C9D8CE] text-sm max-w-xl">
            Ada {activeTodos} tugas aktif hari ini. Ayo selesaikan satu per satu.
          </p>
        </div>

        <button
          onClick={onAddTodo}
          className="px-6 py-3 rounded-md bg-[#C99A2E] text-[#20302A] font-bold text-xs uppercase tracking-wider hover:bg-[#D9AE55] transition duration-200 flex items-center justify-center gap-2 shrink-0"
        >
          + Tambah Tugas Baru
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-[#C9D8CE]">
          <span>Progress Penyelesaian Hari Ini</span>
          <span className="font-mono">{progressPercent}% Selesai ({completedTodos}/{totalTodos})</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#C99A2E] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

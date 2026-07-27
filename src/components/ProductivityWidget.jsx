export default function ProductivityWidget({ progressPercent, completedTodos, streak = '5 hari' }) {
  return (
    <div className="bg-[#20302A] p-6 rounded-md text-white space-y-4">
      <h3 className="text-sm font-serif">Produktivitas Mingguan</h3>

      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-white/5 border border-white/10 p-3 rounded-md text-center space-y-1">
          <span className="text-[10px] text-[#C9D8CE] uppercase font-mono">Selesai</span>
          <p className="text-lg font-serif text-white">{progressPercent}%</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 rounded-md text-center space-y-1">
          <span className="text-[10px] text-[#C9D8CE] uppercase font-mono">Tuntas</span>
          <p className="text-lg font-serif text-white">{completedTodos}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 rounded-md text-center space-y-1">
          <span className="text-[10px] text-[#C9D8CE] uppercase font-mono">Runtut</span>
          <p className="text-lg font-serif text-[#C99A2E]">{streak}</p>
        </div>
      </div>
    </div>
  )
}

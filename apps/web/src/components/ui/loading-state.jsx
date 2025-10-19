export function LoadingState({ message = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-16 text-slate-500">
      {message}
    </div>
  );
}

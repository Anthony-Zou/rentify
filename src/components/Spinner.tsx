export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
      className={`inline-block rounded-full border-2 animate-spin ${className}`}
    />
  )
}

export default function CatalogLoading() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6">
      <div className="h-14 w-56 animate-pulse rounded-2xl bg-paper-deep" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-96 animate-pulse rounded-2xl bg-paper-deep" />
        ))}
      </div>
    </div>
  );
}

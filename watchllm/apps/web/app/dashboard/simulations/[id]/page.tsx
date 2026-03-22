type PageProps = {
  params: { id: string };
};

export default function SimulationDetailPage({ params }: PageProps) {
  const { id } = params;
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold">Simulation {id}</h1>
      <p className="mt-2 text-gray-500">Coming in Phase 2.</p>
    </div>
  );
}

import StatusSidebar from '../StatusSidebar'

export default function StatusSidebarExample() {
  //todo: remove mock functionality
  const mockClaims = [
    {
      id: "1",
      status: "processing" as const,
      timestamp: "2 minutes ago",
      message: "Analyzing uploaded documents..."
    },
    {
      id: "2",
      status: "completed" as const,
      timestamp: "1 hour ago",
      message: "Claim #2847 processed successfully"
    }
  ];

  return <StatusSidebar claims={mockClaims} />
}

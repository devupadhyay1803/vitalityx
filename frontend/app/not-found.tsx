import { ComingSoon } from "@/components/ui/ComingSoon";

export default function NotFound() {
  return (
    <ComingSoon 
      title="Page Not Found" 
      description="The page you are looking for doesn't exist, has been moved, or is currently under construction."
      backUrl="/"
    />
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2 } from "lucide-react";
import StatusSidebar from "@/components/StatusSidebar";
import { useToast } from "@/hooks/use-toast";

interface ClaimStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  timestamp: string;
  message: string;
}

export default function Portal() {
  const [showForm, setShowForm] = useState(false);
  const [claims, setClaims] = useState<ClaimStatus[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    claimType: "",
    description: "",
    files: null as FileList | null
  });
  const { toast } = useToast();

  const handleNewRequest = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    //todo: remove mock functionality
    // Simulate adding a new claim to status
    const newClaim: ClaimStatus = {
      id: Date.now().toString(),
      status: "processing",
      timestamp: "Just now",
      message: `Processing ${formData.claimType || 'new claim'}...`
    };

    setClaims([newClaim, ...claims]);

    // Simulate API call to n8n webhook
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Request submitted",
        description: "Your claim is being processed by AI workflows"
      });
      
      // Reset form
      setFormData({ claimType: "", description: "", files: null });
      setShowForm(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen">
      {/* Status Sidebar - 1/3 width */}
      <div className="w-1/3">
        <StatusSidebar claims={claims} />
      </div>

      {/* Main Panel - 2/3 width */}
      <div className="w-2/3 flex flex-col items-center justify-center p-12 bg-background">
        {!showForm ? (
          <div className="text-center space-y-8 max-w-2xl">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              AI Claim Portal
            </h1>
            <p className="text-muted-foreground text-lg">
              Submit and track your claims with AI-powered processing
            </p>
            <Button
              size="lg"
              onClick={handleNewRequest}
              className="px-8 py-6 text-lg shadow-lg"
              data-testid="button-new-request"
            >
              New Request
            </Button>
          </div>
        ) : (
          <Card className="w-full max-w-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-card-foreground">Submit New Claim</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="claimType">Claim Type</Label>
                <Input
                  id="claimType"
                  placeholder="e.g., Medical, Property, Auto"
                  value={formData.claimType}
                  onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                  required
                  data-testid="input-claim-type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about your claim..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                  data-testid="input-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Supporting Documents</Label>
                <div className="border-2 border-dashed border-border rounded-md p-8 text-center hover-elevate">
                  <input
                    type="file"
                    id="files"
                    multiple
                    className="hidden"
                    onChange={(e) => setFormData({ ...formData, files: e.target.files })}
                    data-testid="input-files"
                  />
                  <label htmlFor="files" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {formData.files
                        ? `${formData.files.length} file(s) selected`
                        : "Click to upload files"}
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Claim"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

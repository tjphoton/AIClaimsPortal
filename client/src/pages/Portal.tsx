import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  label: string;
  status: "active" | "pending" | "completed";
}

export default function Portal() {
  const [currentStep, setCurrentStep] = useState<"initial" | "upload" | "selection">("initial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [workflowResponse, setWorkflowResponse] = useState<{
    summary: string;
    products: string;
    resumeUrl: string;
  } | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { toast } = useToast();

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: "1", label: "Workflow Started", status: "pending" },
    { id: "2", label: "File Uploads", status: "pending" },
    { id: "3", label: "Product Selection", status: "pending" },
    { id: "4", label: "Submit", status: "pending" },
    { id: "5", label: "Complete", status: "pending" },
  ]);

  const handleStartWorkflow = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/start-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to start workflow');
      }

      const data = await response.json();
      
      if (data.resumeUrl) {
        setResumeUrl(data.resumeUrl);
        setWorkflowSteps(steps => 
          steps.map((step, idx) => ({
            ...step,
            status: idx === 0 ? "completed" : idx === 1 ? "active" : "pending"
          }))
        );
        setCurrentStep("upload");
        setIsSubmitting(false);
      } else {
        throw new Error('No resume URL received');
      }
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start workflow. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch(`/api/resume-workflow?resumeUrl=${encodeURIComponent(resumeUrl)}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      // Handle array response from n8n
      const responseData = Array.isArray(data) ? data[0] : data;
      
      if (responseData.summary && responseData.products && responseData.resumeUrl) {
        setWorkflowResponse(responseData);
        setResumeUrl(responseData.resumeUrl);
        setCurrentStep("selection");
        setWorkflowSteps(steps => 
          steps.map((step, idx) => ({
            ...step,
            status: idx <= 1 ? "completed" : idx === 2 ? "active" : "pending"
          }))
        );
        toast({
          title: "Files processed successfully",
          description: "Please select products to continue"
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleProductSelection = (product: string) => {
    setSelectedProducts(prev => 
      prev.includes(product) 
        ? prev.filter(p => p !== product)
        : [...prev, product]
    );
  };

  const handleProductSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/resume-workflow?resumeUrl=${encodeURIComponent(resumeUrl)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedProducts })
      });

      const data = await response.json();
      
      setWorkflowSteps(steps => 
        steps.map((step, idx) => ({
          ...step,
          status: idx <= 4 ? "completed" : "pending"
        }))
      );

      toast({
        title: "Products submitted successfully",
        description: "Your claim has been processed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Status Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="space-y-4">
          {workflowSteps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                step.status === "completed" ? "bg-green-500" :
                step.status === "active" ? "bg-blue-500" :
                "bg-gray-300"
              }`} />
              <span className={`text-sm ${
                step.status === "active" ? "text-gray-900 font-medium" :
                step.status === "completed" ? "text-gray-700" :
                "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex items-center justify-center p-12">
        {currentStep === "initial" ? (
          <div className="text-center space-y-8 max-w-2xl">
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
              AI Claim Portal
            </h1>
            <p className="text-gray-600 text-lg">
              Submit and track your claims with AI-powered processing
            </p>
            <Button
              size="lg"
              onClick={handleStartWorkflow}
              disabled={isSubmitting}
              className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
              data-testid="button-new-request"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                "New Request"
              )}
            </Button>
          </div>
        ) : currentStep === "upload" ? (
          <div className="w-full max-w-2xl space-y-6">
            <div 
              className="border-2 border-dashed border-blue-300 rounded-lg p-16 text-center bg-white hover:border-blue-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
                data-testid="input-files"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <p className="text-blue-600 text-lg font-medium">
                  {files && files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Drag & Drop or Click to Upload File"}
                </p>
              </label>
            </div>

            <Button
              onClick={handleFileUpload}
              disabled={isSubmitting || !files || files.length === 0}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
              data-testid="button-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Summary</h2>
              <p className="text-gray-700 leading-relaxed">{workflowResponse?.summary}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflowResponse?.products.split(',').map((product, index) => {
                  const trimmedProduct = product.trim();
                  const isSelected = selectedProducts.includes(trimmedProduct);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleProductSelection(trimmedProduct)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-900' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className="font-medium">{trimmedProduct}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleProductSubmit}
              disabled={isSubmitting || selectedProducts.length === 0}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Selection"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

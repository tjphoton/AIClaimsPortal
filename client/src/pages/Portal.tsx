
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText, CheckCircle2, Wrench, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  status: "active" | "pending" | "completed";
}

type SupportType = "general" | "troubleshooting" | "warranty";

export default function Portal() {
  const [currentStep, setCurrentStep] = useState<"initial" | "upload" | "selection" | "issues" | "resolution">("initial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [workflowResponse, setWorkflowResponse] = useState<{
    summary: string;
    products: string;
    resumeUrl: string;
  } | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedSupportType, setSelectedSupportType] = useState<SupportType | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const { toast } = useToast();

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: "1", label: "Start Process", description: "Initialize your claim", status: "pending" },
    { id: "2", label: "Upload Invoice", description: "Provide proof of purchase", status: "pending" },
    { id: "3", label: "Select Products", description: "Choose affected items", status: "pending" },
    { id: "4", label: "Describe Issues", description: "Tell us what's wrong", status: "pending" },
    { id: "5", label: "Resolution", description: "Get your solution", status: "pending" },
  ]);

  const supportTypes = [
    { id: "general", label: "General Question", description: "Basic inquiries about your product" },
    { id: "troubleshooting", label: "Troubleshooting", description: "Technical issues or problems" },
    { id: "warranty", label: "Warranty Claim", description: "Product defects or warranty issues" }
  ];

  const issuesList = [
    "Battery not charging properly",
    "Screen flickering or display issues",
    "Keyboard keys unresponsive",
    "Unexpected shutdowns or restarts",
    "Wi-Fi or connectivity problems"
  ];

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

      // Create preview URL for the uploaded file
      const fileUrl = URL.createObjectURL(files[0]);
      setUploadedFileUrl(fileUrl);

      const response = await fetch(`/api/resume-workflow?resumeUrl=${encodeURIComponent(resumeUrl)}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
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

  const toggleIssueSelection = (issue: string) => {
    setSelectedIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const handleSelectionContinue = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product",
        variant: "destructive"
      });
      return;
    }
    if (!selectedSupportType) {
      toast({
        title: "No support type selected",
        description: "Please select a type of support needed",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep("issues");
    setWorkflowSteps(steps => 
      steps.map((step, idx) => ({
        ...step,
        status: idx <= 2 ? "completed" : idx === 3 ? "active" : "pending"
      }))
    );
  };

  const handleIssuesContinue = () => {
    if (selectedIssues.length === 0) {
      toast({
        title: "No issues selected",
        description: "Please select at least one issue",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep("resolution");
    setWorkflowSteps(steps => 
      steps.map((step, idx) => ({
        ...step,
        status: idx <= 3 ? "completed" : idx === 4 ? "active" : "pending"
      }))
    );
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
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
        body: JSON.stringify({ 
          selectedProducts,
          supportType: selectedSupportType,
          selectedIssues,
          email 
        })
      });

      setWorkflowSteps(steps => 
        steps.map((step) => ({
          ...step,
          status: "completed"
        }))
      );

      toast({
        title: "Updates sent successfully",
        description: "We'll send you updates via email"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header spanning full width */}
      <div className="bg-white border-b border-gray-200 py-8 px-12">
        <h1 className="text-4xl font-bold text-gray-900 text-center">Customer Claims Portal</h1>
        <p className="text-gray-600 text-center mt-2">Get support for your products quickly and easily</p>
      </div>

      {/* Main content area with two rounded sections */}
      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Panel - Claim Status */}
        <div className="w-80 bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Claim Status</h2>
            <p className="text-gray-600 text-sm">Track your progress</p>
          </div>
          
          <div className="space-y-3 flex-1">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className={`p-4 rounded-lg border ${
                step.status === "completed" ? "bg-green-50 border-green-200" :
                step.status === "active" ? "bg-blue-50 border-blue-200" :
                "bg-gray-50 border-gray-200"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    step.status === "completed" ? "bg-green-500 text-white" :
                    step.status === "active" ? "bg-blue-500 text-white" :
                    "bg-gray-300 text-gray-600"
                  }`}>
                    {step.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      step.status === "active" ? "text-gray-900" : "text-gray-700"
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentStep === "selection" && uploadedFileUrl && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold mb-3">Invoice Preview</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={uploadedFileUrl} 
                  alt="Invoice preview" 
                  className="w-full h-auto"
                />
              </div>
              {workflowResponse?.summary && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Summary</p>
                  <p className="text-xs text-blue-800">{workflowResponse.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Claims Workflow */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Claims Workflow</h2>
            <p className="text-gray-600 mt-1">Follow the steps below to process your claim</p>
          </div>

          {currentStep === "initial" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Initialize Your Claim</h3>
                  <p className="text-gray-600 mt-2">
                    Click the button below to start your claims process. This will create a new session and prepare the system for your request.
                  </p>
                </div>
              </div>
              
              <Button
                size="lg"
                onClick={handleStartWorkflow}
                disabled={isSubmitting}
                className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    🚀 Start Claims Workflow
                  </>
                )}
              </Button>
            </div>
          )}

          {currentStep === "upload" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Upload Your Invoice</h3>
                </div>
              </div>

              <div 
                className="border-2 border-dashed border-blue-400 rounded-lg p-16 text-center bg-blue-50/30"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(e.target.files)}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  {files && files.length > 0 ? (
                    <div>
                      <p className="text-gray-900 font-medium">
                        Selected: {files[0].name}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-medium mb-1">Drag & drop your invoice here</p>
                      <p className="text-gray-500 text-sm">Supports PDF and PNG files</p>
                    </div>
                  )}
                  <Button variant="default" className="mt-4" type="button">
                    Choose File
                  </Button>
                </label>
              </div>

              <Button
                onClick={handleFileUpload}
                disabled={isSubmitting || !files || files.length === 0}
                className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Invoice"
                )}
              </Button>
            </div>
          )}

          {currentStep === "selection" && (
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Select Products & Support Type</h3>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Products from your invoice:</h4>
                <div className="space-y-3">
                  {workflowResponse?.products.split(',').map((product, index) => {
                    const trimmedProduct = product.trim();
                    const isSelected = selectedProducts.includes(trimmedProduct);
                    return (
                      <button
                        key={index}
                        onClick={() => toggleProductSelection(trimmedProduct)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{trimmedProduct}</p>
                        <p className="text-sm text-gray-500 mt-1">Select if you need support for this item</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Type of support needed:</h4>
                <div className="space-y-3">
                  {supportTypes.map((type) => {
                    const isSelected = selectedSupportType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedSupportType(type.id as SupportType)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleSelectionContinue}
                disabled={selectedProducts.length === 0 || !selectedSupportType}
                className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue
              </Button>
            </div>
          )}

          {currentStep === "issues" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Describe Your Issues</h3>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Select all issues that apply:</h4>
                <div className="space-y-3">
                  {issuesList.map((issue, index) => {
                    const isSelected = selectedIssues.includes(issue);
                    return (
                      <button
                        key={index}
                        onClick={() => toggleIssueSelection(issue)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{issue}</p>
                        <p className="text-sm text-gray-500 mt-1">Check if this describes your problem</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleIssuesContinue}
                disabled={selectedIssues.length === 0}
                className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue
              </Button>
            </div>
          )}

          {currentStep === "resolution" && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Resolution & Next Steps</h3>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Wrench className="w-5 h-5 text-gray-600 mt-1" />
                  <h4 className="font-semibold text-gray-900">Troubleshooting Steps</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Check the charging cable and adapter for damage and ensure they are properly connected, reset the System Management Controller (SMC) to resolve battery and power-related issues, update macOS to the latest version to fix potential software bugs causing shutdowns, run Apple Diagnostics to check for hardware problems.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="w-5 h-5 text-gray-600 mt-1" />
                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                </div>
                <p className="text-gray-700 mb-4">
                  Could you please provide your email address so we can send you a summary of your case?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📧 Get Updates via Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleEmailSubmit}
                    disabled={isSubmitting || !email}
                    className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Me Updates"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

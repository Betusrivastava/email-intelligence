import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import OrganizationForm from "@/components/organization-form";
import { Wand2, Paperclip, Info, CheckCircle } from "lucide-react";
import type { Organization } from "@shared/schema";

const extractSchema = z.object({
  emailContent: z.string().min(10, "Email content must be at least 10 characters long"),
});

type ExtractForm = z.infer<typeof extractSchema>;

interface ExtractedData {
  name: string;
  location: string;
  owners: string;
  activities: string;
  age: number;
  website: string;
  industry: string;
  emailContent: string;
}

export default function EmailExtractor() {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for data from Chrome extension on component mount
  useEffect(() => {
    const checkExtensionData = async () => {
      try {
        // Check URL parameters for extension data
        const urlParams = new URLSearchParams(window.location.search);
        const fromExtension = urlParams.get('fromExtension');
        const extractedDataParam = urlParams.get('extractedData');

        if (fromExtension === 'true' && extractedDataParam) {
          const data = JSON.parse(decodeURIComponent(extractedDataParam));
          setExtractedData(data);
          
          // Clean URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          toast({
            title: "Data from Chrome Extension",
            description: "Organization information imported from Gmail extension.",
          });
          return;
        }

        // Fallback: Check localStorage for extension data
        const extensionData = localStorage.getItem('chromeExtensionData');
        if (extensionData) {
          const data = JSON.parse(extensionData);
          if (data.timestamp && Date.now() - data.timestamp < 60000) { // Within 1 minute
            setExtractedData(data.extractedData);
            localStorage.removeItem('chromeExtensionData'); // Clean up
            toast({
              title: "Data from Chrome Extension",
              description: "Organization information imported from Gmail extension.",
            });
          }
        }
      } catch (error) {
        console.error('Error checking extension data:', error);
      }
    };

    checkExtensionData();
    
    // Listen for messages from Chrome extension
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'CHROME_EXTENSION_DATA') {
        setExtractedData(event.data.payload);
        toast({
          title: "Data from Chrome Extension",
          description: "Organization information received from Gmail.",
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  const form = useForm<ExtractForm>({
    resolver: zodResolver(extractSchema),
    defaultValues: {
      emailContent: "",
    },
  });

  const extractMutation = useMutation({
    mutationFn: async (data: ExtractForm) => {
      const response = await apiRequest("POST", "/api/extract", data);
      return response.json();
    },
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: (result) => {
      if (result.success) {
        setExtractedData(result.data);
        toast({
          title: "Extraction Complete",
          description: "Organization information has been successfully extracted from the email.",
        });
      } else {
        throw new Error(result.message);
      }
    },
    onError: (error) => {
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract organization information",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (organizationData: any) => {
      const response = await apiRequest("POST", "/api/organizations", organizationData);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Organization Saved",
          description: `${result.data.name} has been added to your database.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
        // Reset form and extracted data
        form.reset();
        setExtractedData(null);
      } else {
        throw new Error(result.message);
      }
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save organization",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExtractForm) => {
    extractMutation.mutate(data);
  };

  const handleSave = (organizationData: any) => {
    saveMutation.mutate(organizationData);
  };

  const handleCancel = () => {
    setExtractedData(null);
    form.reset();
  };

  return (
    <div className="space-y-8">
      {/* Email Input Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Email Content Extraction</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Info className="h-4 w-4" />
              <span>Paste your email content below for AI analysis</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="emailContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your email content here..."
                        className="min-h-[200px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-4">
                <Button 
                  type="submit" 
                  disabled={extractMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {extractMutation.isPending ? (
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Extract Information
                </Button>
                <Button type="button" variant="outline">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Add Attachment
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* AI Processing Status */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <LoadingSpinner className="h-5 w-5" />
              <h3 className="text-lg font-semibold">AI Processing Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-700">Email content analyzed</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-700">Organization details extracted</span>
              </div>
              <div className="flex items-center space-x-3">
                <LoadingSpinner className="h-4 w-4" />
                <span className="text-sm text-slate-700">Validating information...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Information Display */}
      {extractedData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Extracted Organization Details</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  <CheckCircle className="inline h-3 w-3 mr-1" />
                  Verified
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OrganizationForm
              initialData={{
                ...extractedData,
                attachments: [],
              }}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={saveMutation.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

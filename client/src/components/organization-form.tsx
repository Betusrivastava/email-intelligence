import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrganizationSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Save, X, FileUp, Plus, Trash2 } from "lucide-react";

const formSchema = insertOrganizationSchema.extend({
  age: z.number().min(0).max(200),
  website: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const INDUSTRIES = [
  "Information Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Energy",
  "Education",
  "Consulting",
  "Real Estate",
  "Other"
];

interface OrganizationFormProps {
  initialData?: Partial<FormData>;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export default function OrganizationForm({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
  readOnly = false,
}: OrganizationFormProps) {
  const [attachments, setAttachments] = useState<string[]>(initialData?.attachments || []);
  const [newAttachment, setNewAttachment] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      location: initialData?.location || "",
      owners: initialData?.owners || "",
      activities: initialData?.activities || "",
      age: initialData?.age || 0,
      website: initialData?.website || "",
      industry: initialData?.industry || "",
      attachments: initialData?.attachments || [],
      emailContent: initialData?.emailContent || "",
    },
  });

  const addAttachment = () => {
    console.log("Add attachment clicked:", newAttachment.trim());
    if (newAttachment.trim() && !attachments.includes(newAttachment.trim())) {
      const updatedAttachments = [...attachments, newAttachment.trim()];
      console.log("Updated attachments:", updatedAttachments);
      setAttachments(updatedAttachments);
      form.setValue("attachments", updatedAttachments);
      setNewAttachment("");
    } else {
      console.log("Attachment not added - either empty or duplicate");
    }
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(updatedAttachments);
    form.setValue("attachments", updatedAttachments);
  };

  const onSubmit = (data: FormData) => {
    onSave({ ...data, attachments });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owners"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owners/Key Personnel</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Age (Years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled={readOnly} placeholder="e.g., www.example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Activities</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none h-24"
                      {...field}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Attachments</FormLabel>
              <div className="border border-slate-200 rounded-lg p-4 mt-2 space-y-3">
                {/* Add new attachment */}
                {!readOnly && (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter attachment URL or file path"
                      value={newAttachment}
                      onChange={(e) => setNewAttachment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttachment())}
                    />
                    <Button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        addAttachment();
                      }}
                      disabled={!newAttachment.trim()}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                )}

                {/* Display existing attachments */}
                {attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                        <span className="text-sm truncate flex-1 mr-2" title={attachment}>
                          {attachment}
                        </span>
                        {!readOnly && (
                          <Button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No attachments added</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save to Database
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}

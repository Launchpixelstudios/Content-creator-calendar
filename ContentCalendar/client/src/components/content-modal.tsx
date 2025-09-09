import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertContentItemSchema, type ContentItem, type ContentTemplate } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock } from "lucide-react";

const formSchema = insertContentItemSchema.extend({
  scheduledDate: z.string().min(1, "Scheduled date is required"),
});

type FormData = z.infer<typeof formSchema>;

interface ContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContent: ContentItem | null;
}

export function ContentModal({ open, onOpenChange, editingContent }: ContentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const isEditing = !!editingContent;
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);

  // Fetch content templates
  const { data: templates = [] } = useQuery<ContentTemplate[]>({
    queryKey: ["/api/templates"],
    enabled: open,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      platform: undefined,
      scheduledDate: "",
      status: "draft",
    },
  });

  // Handle template selection
  const applyTemplate = (template: ContentTemplate) => {
    // Check if template is premium and user doesn't have subscription
    if (template.isPremium && user?.subscriptionStatus !== 'active') {
      toast({
        title: "Premium Template",
        description: "This template requires a premium subscription. Please upgrade to access it.",
        variant: "destructive",
      });
      return;
    }

    setSelectedTemplate(template);
    form.setValue("title", template.title);
    form.setValue("description", template.content);
    form.setValue("platform", template.platform as "social" | "email" | "blog");
    
    toast({
      title: "Template Applied",
      description: `"${template.title}" template has been applied to your content.`,
    });
  };

  // Reset form when modal opens/closes or editing content changes
  useEffect(() => {
    if (open && editingContent) {
      form.reset({
        title: editingContent.title,
        description: editingContent.description || "",
        platform: editingContent.platform as "social" | "email" | "blog",
        scheduledDate: format(new Date(editingContent.scheduledDate), "yyyy-MM-dd'T'HH:mm"),
        status: editingContent.status as "draft" | "scheduled" | "posted",
      });
      setSelectedTemplate(null);
    } else if (open && !editingContent) {
      form.reset({
        title: "",
        description: "",
        platform: undefined,
        scheduledDate: "",
        status: "draft",
      });
      setSelectedTemplate(null);
    }
  }, [open, editingContent, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/content", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Success",
        description: "Content created successfully!",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PUT", `/api/content/${editingContent!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Success",
        description: "Content updated successfully!",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">
            {isEditing ? "Edit Content" : "Add New Content"}
          </DialogTitle>
        </DialogHeader>

        {/* Template Selection */}
        {!isEditing && templates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Content Templates
            </h3>
            <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => applyTemplate(template)}
                  data-testid={`template-${template.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{template.title}</h4>
                        {template.isPremium && (
                          <Badge variant="secondary" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {template.platform}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {selectedTemplate && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Template "{selectedTemplate.title}" applied
                </div>
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="content-form">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter content title..."
                      {...field}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your content..."
                      rows={4}
                      className="resize-none"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Platform <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-platform">
                        <SelectValue placeholder="Select platform..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="social" data-testid="option-social">Social Media</SelectItem>
                      <SelectItem value="email" data-testid="option-email">Email</SelectItem>
                      <SelectItem value="blog" data-testid="option-blog">Blog</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Scheduled Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      data-testid="input-scheduled-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Status <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft" data-testid="option-draft">Draft</SelectItem>
                      <SelectItem value="scheduled" data-testid="option-scheduled">Scheduled</SelectItem>
                      <SelectItem value="posted" data-testid="option-posted">Posted</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-submit"
              >
                {isPending ? "Saving..." : isEditing ? "Update Content" : "Create Content"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

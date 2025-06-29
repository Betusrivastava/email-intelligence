import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import OrganizationForm from "@/components/organization-form";
import { Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Organization } from "@shared/schema";

const INDUSTRIES = [
  "All Industries",
  "Information Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Energy",
  "Education",
  "Other"
];

export default function OrganizationDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [viewingOrg, setViewingOrg] = useState<Organization | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ["/api/organizations", searchQuery, selectedIndustry],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedIndustry !== "All Industries") params.append("industry", selectedIndustry);
      
      const response = await fetch(`/api/organizations?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch organizations");
      const result = await response.json();
      return result.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/organizations/${id}`);
      return response.json();
    },
    onSuccess: (result, id) => {
      if (result.success) {
        toast({
          title: "Organization Deleted",
          description: "The organization has been successfully removed from your database.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      }
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete organization",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/organizations/${id}`, data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Organization Updated",
          description: "The organization details have been successfully updated.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
        setEditingOrg(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update organization",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleUpdate = (data: any) => {
    if (editingOrg) {
      updateMutation.mutate({ id: editingOrg.id, data });
    }
  };

  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      "Information Technology": "bg-blue-100 text-blue-800",
      "Healthcare": "bg-green-100 text-green-800",
      "Finance": "bg-purple-100 text-purple-800",
      "Manufacturing": "bg-orange-100 text-orange-800",
      "Energy": "bg-emerald-100 text-emerald-800",
      "Education": "bg-indigo-100 text-indigo-800",
      "Retail": "bg-pink-100 text-pink-800",
    };
    return colors[industry] || "bg-gray-100 text-gray-800";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Saved Organizations</CardTitle>
          <p className="text-sm text-slate-500">Total: {organizations.length} organizations</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Organizations Found</h3>
              <p className="text-slate-500">Start by extracting organization information from emails.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org: Organization) => (
                    <TableRow key={org.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{org.name}</div>
                          <div className="text-sm text-slate-500">{org.owners}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getIndustryColor(org.industry || "Other")}>
                          {org.industry || "Other"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{org.location}</TableCell>
                      <TableCell className="text-sm">
                        {org.age ? `${org.age} years` : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {org.createdAt ? formatTimeAgo(org.createdAt) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setViewingOrg(org)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Organization Details</DialogTitle>
                              </DialogHeader>
                              {viewingOrg && (
                                <OrganizationForm
                                  initialData={viewingOrg}
                                  onSave={() => {}}
                                  onCancel={() => setViewingOrg(null)}
                                  readOnly
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingOrg(org)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Organization</DialogTitle>
                              </DialogHeader>
                              {editingOrg && (
                                <OrganizationForm
                                  initialData={editingOrg}
                                  onSave={handleUpdate}
                                  onCancel={() => setEditingOrg(null)}
                                  isLoading={updateMutation.isPending}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(org.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

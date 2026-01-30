'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { certificateTemplatesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Award,
  Edit,
  Trash2,
  Check,
  ArrowLeft,
} from 'lucide-react';

interface TemplateConfig {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderStyle: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  templateConfig: TemplateConfig;
  createdAt: string;
}

export default function CertificateTemplatesPage() {
  const { currentOrganization } = useAuthStore();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<CertificateTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [currentOrganization]);

  const fetchTemplates = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const response = await certificateTemplatesApi.getAll(currentOrganization.id);
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificate templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (templateId: string) => {
    if (!currentOrganization) return;

    try {
      await certificateTemplatesApi.setDefault(currentOrganization.id, templateId);
      toast({ title: 'Default template updated', variant: 'success' });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to set default template',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!currentOrganization || !templateToDelete) return;

    try {
      await certificateTemplatesApi.delete(currentOrganization.id, templateToDelete.id);
      toast({ title: 'Template deleted', variant: 'success' });
      fetchTemplates();
      setDeleteModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-black mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization from the sidebar.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/certificates">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black">Certificate Templates</h1>
            <p className="text-gray-600 mt-1">
              Customize how certificates look for your courses.
            </p>
          </div>
        </div>
        <Link href="/dashboard/certificates/templates/new/edit">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mb-4 shadow-brutal-sm">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">No templates yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first certificate template to customize how certificates look.
            </p>
            <Link href="/dashboard/certificates/templates/new/edit">
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <CardContent className="p-0">
                {/* Preview */}
                <div
                  className="h-40 rounded-t-lg flex items-center justify-center relative"
                  style={{
                    backgroundColor: template.templateConfig?.backgroundColor || '#ffffff',
                    borderBottom: `4px ${template.templateConfig?.borderStyle || 'solid'} ${template.templateConfig?.accentColor || '#D6FF25'}`,
                  }}
                >
                  <div className="text-center">
                    <Award
                      className="h-10 w-10 mx-auto mb-2"
                      style={{ color: template.templateConfig?.accentColor || '#D6FF25' }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: template.templateConfig?.textColor || '#000000' }}
                    >
                      Certificate Preview
                    </p>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-t-lg">
                    <Link href={`/dashboard/certificates/templates/${template.id}/edit`}>
                      <Button size="sm" variant="secondary">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    {!template.isDefault && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetDefault(template.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-black">{template.name}</h3>
                    {template.isDefault && (
                      <Badge variant="success" className="ml-2">Default</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="h-5 w-5 rounded-lg border-2 border-black"
                      style={{ backgroundColor: template.templateConfig?.backgroundColor }}
                      title="Background"
                    />
                    <div
                      className="h-5 w-5 rounded-lg border-2 border-black"
                      style={{ backgroundColor: template.templateConfig?.textColor }}
                      title="Text"
                    />
                    <div
                      className="h-5 w-5 rounded-lg border-2 border-black"
                      style={{ backgroundColor: template.templateConfig?.accentColor }}
                      title="Accent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                    {!template.isDefault && (
                      <button
                        onClick={() => {
                          setTemplateToDelete(template);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1 rounded border-2 border-transparent hover:border-red-500 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

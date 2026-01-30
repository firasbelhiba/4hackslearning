'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { certificateTemplatesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Palette,
} from 'lucide-react';

interface TemplateConfig {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  logoPosition: string;
  borderStyle: string;
  fontFamily: string;
  showOrganizationLogo: boolean;
  showStudentName: boolean;
  showCourseName: boolean;
  showCompletionDate: boolean;
  showCertificateId: boolean;
}

interface CertificateTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  templateConfig: TemplateConfig;
  createdAt: string;
}

const defaultConfig: TemplateConfig = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  accentColor: '#D6FF25',
  logoPosition: 'top-center',
  borderStyle: 'double',
  fontFamily: 'Outfit',
  showOrganizationLogo: true,
  showStudentName: true,
  showCourseName: true,
  showCompletionDate: true,
  showCertificateId: true,
};

export default function CertificatesPage() {
  const { currentOrganization } = useAuthStore();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    templateConfig: defaultConfig,
  });

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

  const handleOpenModal = (template?: CertificateTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        templateConfig: { ...defaultConfig, ...template.templateConfig },
      });
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', templateConfig: defaultConfig });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentOrganization) return;

    try {
      if (editingTemplate) {
        await certificateTemplatesApi.update(
          currentOrganization.id,
          editingTemplate.id,
          formData
        );
        toast({ title: 'Template updated', variant: 'success' });
      } else {
        await certificateTemplatesApi.create(currentOrganization.id, formData);
        toast({ title: 'Template created', variant: 'success' });
      }
      fetchTemplates();
      setModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save template',
        variant: 'destructive',
      });
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

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setFormData({
      ...formData,
      templateConfig: { ...formData.templateConfig, [key]: value },
    });
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
        <div>
          <h1 className="text-3xl font-bold text-black">Certificate Templates</h1>
          <p className="text-gray-600 mt-1">
            Customize how certificates look for your courses.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          variant="primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
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
            <Button
              onClick={() => handleOpenModal()}
              variant="primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
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
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenModal(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
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

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              Customize how your certificates will look.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Template"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Background</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.templateConfig.backgroundColor}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      className="h-8 w-8 rounded-lg border-2 border-black cursor-pointer"
                    />
                    <Input
                      value={formData.templateConfig.backgroundColor}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.templateConfig.textColor}
                      onChange={(e) => updateConfig('textColor', e.target.value)}
                      className="h-8 w-8 rounded-lg border-2 border-black cursor-pointer"
                    />
                    <Input
                      value={formData.templateConfig.textColor}
                      onChange={(e) => updateConfig('textColor', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.templateConfig.accentColor}
                      onChange={(e) => updateConfig('accentColor', e.target.value)}
                      className="h-8 w-8 rounded-lg border-2 border-black cursor-pointer"
                    />
                    <Input
                      value={formData.templateConfig.accentColor}
                      onChange={(e) => updateConfig('accentColor', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-sm">Display Options</Label>
                {[
                  { key: 'showOrganizationLogo', label: 'Show Organization Logo' },
                  { key: 'showStudentName', label: 'Show Student Name' },
                  { key: 'showCourseName', label: 'Show Course Name' },
                  { key: 'showCompletionDate', label: 'Show Completion Date' },
                  { key: 'showCertificateId', label: 'Show Certificate ID' },
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.templateConfig[option.key as keyof TemplateConfig] as boolean}
                      onChange={(e) => updateConfig(option.key as keyof TemplateConfig, e.target.checked)}
                      className="rounded border-2 border-black h-4 w-4 text-brand focus:ring-brand"
                    />
                    <span className="text-black text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Preview */}
            <div>
              <Label className="text-sm mb-2 block">Preview</Label>
              <div
                className="rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center"
                style={{
                  backgroundColor: formData.templateConfig.backgroundColor,
                  border: `2px ${formData.templateConfig.borderStyle} ${formData.templateConfig.accentColor}`,
                }}
              >
                {formData.templateConfig.showOrganizationLogo && (
                  <Award
                    className="h-8 w-8 mb-2"
                    style={{ color: formData.templateConfig.accentColor }}
                  />
                )}
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: formData.templateConfig.textColor }}
                >
                  CERTIFICATE OF COMPLETION
                </p>
                {formData.templateConfig.showStudentName && (
                  <p
                    className="text-lg font-bold"
                    style={{ color: formData.templateConfig.textColor }}
                  >
                    John Doe
                  </p>
                )}
                {formData.templateConfig.showCourseName && (
                  <p
                    className="text-xs mt-2"
                    style={{ color: formData.templateConfig.textColor, opacity: 0.8 }}
                  >
                    Completed: Introduction to Blockchain
                  </p>
                )}
                {formData.templateConfig.showCompletionDate && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: formData.templateConfig.textColor, opacity: 0.6 }}
                  >
                    January 28, 2026
                  </p>
                )}
                {formData.templateConfig.showCertificateId && (
                  <p
                    className="text-[10px] mt-2"
                    style={{ color: formData.templateConfig.textColor, opacity: 0.4 }}
                  >
                    ID: CERT-2026-XXXX
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
            >
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

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
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Organization Selected</h2>
          <p className="text-zinc-400">Please select an organization from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificate Templates</h1>
          <p className="text-zinc-400 mt-1">
            Customize how certificates look for your courses.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-zinc-800 rounded-lg mb-4"></div>
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No templates yet</h3>
            <p className="text-zinc-400 text-center mb-4">
              Create your first certificate template to customize how certificates look.
            </p>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="bg-zinc-900 border-zinc-800 group">
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
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    {template.isDefault && (
                      <Badge variant="success" className="ml-2">Default</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="h-4 w-4 rounded-full border border-zinc-600"
                      style={{ backgroundColor: template.templateConfig?.backgroundColor }}
                      title="Background"
                    />
                    <div
                      className="h-4 w-4 rounded-full border border-zinc-600"
                      style={{ backgroundColor: template.templateConfig?.textColor }}
                      title="Text"
                    />
                    <div
                      className="h-4 w-4 rounded-full border border-zinc-600"
                      style={{ backgroundColor: template.templateConfig?.accentColor }}
                      title="Accent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                    {!template.isDefault && (
                      <button
                        onClick={() => {
                          setTemplateToDelete(template);
                          setDeleteModalOpen(true);
                        }}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
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
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Customize how your certificates will look.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="My Template"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs">Background</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.templateConfig.backgroundColor}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.templateConfig.backgroundColor}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.templateConfig.textColor}
                      onChange={(e) => updateConfig('textColor', e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.templateConfig.textColor}
                      onChange={(e) => updateConfig('textColor', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.templateConfig.accentColor}
                      onChange={(e) => updateConfig('accentColor', e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.templateConfig.accentColor}
                      onChange={(e) => updateConfig('accentColor', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-zinc-300 text-sm">Display Options</Label>
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
                      className="rounded border-zinc-700 bg-zinc-800 text-[#D6FF25] focus:ring-[#D6FF25]"
                    />
                    <span className="text-zinc-300 text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Preview */}
            <div>
              <Label className="text-zinc-300 text-sm mb-2 block">Preview</Label>
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
              className="bg-zinc-800 border-zinc-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
            >
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Template</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-white"
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

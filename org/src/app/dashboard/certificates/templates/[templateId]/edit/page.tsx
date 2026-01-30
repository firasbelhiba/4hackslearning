'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { useAuthStore } from '@/stores/auth-store';
import { certificateTemplatesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Save,
  Award,
  Palette,
  Type,
  Layout,
  Eye,
  Settings,
  Building2,
  Layers,
} from 'lucide-react';

interface TemplateConfig {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  secondaryColor: string;
  logoPosition: 'top-left' | 'top-center' | 'top-right';
  borderStyle: 'none' | 'solid' | 'double' | 'dashed';
  borderWidth: number;
  borderColor: string;
  fontFamily: string;
  titleFontSize: number;
  nameFontSize: number;
  bodyFontSize: number;
  padding: number;
  showOrganizationLogo: boolean;
  showStudentName: boolean;
  showCourseName: boolean;
  showCompletionDate: boolean;
  showCertificateId: boolean;
  showInstructorSignature: boolean;
  showQRCode: boolean;
  certificateTitle: string;
  certificateSubtitle: string;
  completionText: string;
  signatureLabel: string;
  orientation: 'landscape' | 'portrait';
  backgroundPattern: 'none' | 'dots' | 'grid' | 'diagonal';
}

interface CertificateTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  templateConfig: TemplateConfig;
}

const defaultConfig: TemplateConfig = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  accentColor: '#D6FF25',
  secondaryColor: '#f3f4f6',
  logoPosition: 'top-center',
  borderStyle: 'double',
  borderWidth: 4,
  borderColor: '#000000',
  fontFamily: 'Outfit',
  titleFontSize: 24,
  nameFontSize: 36,
  bodyFontSize: 14,
  padding: 40,
  showOrganizationLogo: true,
  showStudentName: true,
  showCourseName: true,
  showCompletionDate: true,
  showCertificateId: true,
  showInstructorSignature: true,
  showQRCode: false,
  certificateTitle: 'CERTIFICATE OF COMPLETION',
  certificateSubtitle: 'This is to certify that',
  completionText: 'has successfully completed the course',
  signatureLabel: 'Instructor',
  orientation: 'landscape',
  backgroundPattern: 'none',
};

const fontFamilies = [
  { value: 'Outfit', label: 'Outfit', googleFont: 'Outfit:wght@400;500;600;700' },
  { value: 'Inter', label: 'Inter', googleFont: 'Inter:wght@400;500;600;700' },
  { value: 'Playfair Display', label: 'Playfair Display', googleFont: 'Playfair+Display:wght@400;500;600;700' },
  { value: 'Montserrat', label: 'Montserrat', googleFont: 'Montserrat:wght@400;500;600;700' },
  { value: 'Georgia', label: 'Georgia (Serif)', googleFont: null },
  { value: 'Times New Roman', label: 'Times New Roman', googleFont: null },
];

// Load Google Fonts dynamically
const loadGoogleFont = (fontFamily: string) => {
  const font = fontFamilies.find(f => f.value === fontFamily);
  if (!font?.googleFont) return;

  const linkId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;
  document.head.appendChild(link);
};

const borderStyles = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
  { value: 'double', label: 'Double' },
  { value: 'dashed', label: 'Dashed' },
];

const logoPositions = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
];

const backgroundPatterns = [
  { value: 'none', label: 'None' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'diagonal', label: 'Diagonal Lines' },
];

export default function EditCertificateTemplatePage() {
  const { templateId } = useParams();
  const router = useRouter();
  const { currentOrganization } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [config, setConfig] = useState<TemplateConfig>(defaultConfig);
  const [allTemplates, setAllTemplates] = useState<CertificateTemplate[]>([]);
  const isNew = templateId === 'new';

  useEffect(() => {
    if (currentOrganization) {
      fetchAllTemplates();
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (templateId && templateId !== 'new' && currentOrganization) {
      fetchTemplate();
    } else {
      setIsLoading(false);
    }
  }, [templateId, currentOrganization]);

  // Load all Google fonts on mount, and also when config.fontFamily changes
  useEffect(() => {
    // Load all Google fonts to make them available immediately
    fontFamilies.forEach(font => {
      if (font.googleFont) {
        loadGoogleFont(font.value);
      }
    });
  }, []);

  // Also ensure current font is loaded
  useEffect(() => {
    loadGoogleFont(config.fontFamily);
  }, [config.fontFamily]);

  const fetchAllTemplates = async () => {
    if (!currentOrganization) return;
    try {
      const response = await certificateTemplatesApi.getAll(currentOrganization.id);
      setAllTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchTemplate = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const response = await certificateTemplatesApi.getById(
        currentOrganization.id,
        templateId as string
      );
      const template = response.data;
      setTemplateName(template.name);
      setConfig({ ...defaultConfig, ...template.templateConfig });
    } catch (error) {
      console.error('Failed to fetch template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive',
      });
      router.push('/dashboard/certificates/templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganization || !templateName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a template name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const data = {
        name: templateName,
        templateConfig: config,
      };

      if (isNew) {
        await certificateTemplatesApi.create(currentOrganization.id, data);
        toast({ title: 'Template created', variant: 'success' });
      } else {
        await certificateTemplatesApi.update(
          currentOrganization.id,
          templateId as string,
          data
        );
        toast({ title: 'Template updated', variant: 'success' });
      }
      router.push('/dashboard/certificates/templates');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTemplate = (selectedTemplateId: string) => {
    const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId);
    if (selectedTemplate) {
      setConfig({ ...defaultConfig, ...selectedTemplate.templateConfig });
      toast({
        title: 'Template loaded',
        description: `Loaded settings from "${selectedTemplate.name}"`,
        variant: 'success',
      });
    }
  };

  const updateConfig = <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const getBackgroundPattern = () => {
    switch (config.backgroundPattern) {
      case 'dots':
        return `radial-gradient(${config.secondaryColor} 1px, transparent 1px)`;
      case 'grid':
        return `linear-gradient(${config.secondaryColor} 1px, transparent 1px), linear-gradient(90deg, ${config.secondaryColor} 1px, transparent 1px)`;
      case 'diagonal':
        return `repeating-linear-gradient(45deg, transparent, transparent 10px, ${config.secondaryColor} 10px, ${config.secondaryColor} 11px)`;
      default:
        return 'none';
    }
  };

  const getBackgroundSize = () => {
    switch (config.backgroundPattern) {
      case 'dots':
        return '20px 20px';
      case 'grid':
        return '20px 20px, 20px 20px';
      default:
        return 'auto';
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/certificates/templates">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black">
              {isNew ? 'Create Certificate Template' : 'Edit Certificate Template'}
            </h1>
            <p className="text-gray-600 mt-1">
              Design your certificate with a live preview
            </p>
          </div>
        </div>
        <Button onClick={handleSave} variant="primary" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-6">
          {/* Template Selector - Start from existing template */}
          {allTemplates.length > 0 && (
            <Card className="border-2 border-dashed border-brand">
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Start from Existing Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Select onValueChange={handleSelectTemplate}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose a template to use as base..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} {template.isDefault && '(Default)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Load settings from an existing template to use as a starting point
                </p>
              </CardContent>
            </Card>
          )}

          {/* Template Name */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Certificate Template"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select
                    value={config.orientation}
                    onValueChange={(value) => updateConfig('orientation', value as 'landscape' | 'portrait')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landscape">Landscape</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={config.fontFamily}
                    onValueChange={(value) => updateConfig('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="colors">
                <Palette className="h-4 w-4 mr-1" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography">
                <Type className="h-4 w-4 mr-1" />
                Text
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout className="h-4 w-4 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="content">
                <Eye className="h-4 w-4 mr-1" />
                Content
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.backgroundColor}
                          onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                          className="h-10 w-10 rounded-lg border-2 border-black cursor-pointer"
                        />
                        <Input
                          value={config.backgroundColor}
                          onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.textColor}
                          onChange={(e) => updateConfig('textColor', e.target.value)}
                          className="h-10 w-10 rounded-lg border-2 border-black cursor-pointer"
                        />
                        <Input
                          value={config.textColor}
                          onChange={(e) => updateConfig('textColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.accentColor}
                          onChange={(e) => updateConfig('accentColor', e.target.value)}
                          className="h-10 w-10 rounded-lg border-2 border-black cursor-pointer"
                        />
                        <Input
                          value={config.accentColor}
                          onChange={(e) => updateConfig('accentColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.secondaryColor}
                          onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                          className="h-10 w-10 rounded-lg border-2 border-black cursor-pointer"
                        />
                        <Input
                          value={config.secondaryColor}
                          onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-100">
                    <Label className="mb-3 block">Border Settings</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Style</Label>
                        <Select
                          value={config.borderStyle}
                          onValueChange={(value) => updateConfig('borderStyle', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {borderStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Width</Label>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          value={config.borderWidth}
                          onChange={(e) => updateConfig('borderWidth', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.borderColor}
                            onChange={(e) => updateConfig('borderColor', e.target.value)}
                            className="h-9 w-9 rounded-lg border-2 border-black cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-100">
                    <div className="space-y-2">
                      <Label>Background Pattern</Label>
                      <Select
                        value={config.backgroundPattern}
                        onValueChange={(value) => updateConfig('backgroundPattern', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {backgroundPatterns.map((pattern) => (
                            <SelectItem key={pattern.value} value={pattern.value}>
                              {pattern.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Title Size</Label>
                      <Input
                        type="number"
                        min={12}
                        max={48}
                        value={config.titleFontSize}
                        onChange={(e) => updateConfig('titleFontSize', parseInt(e.target.value) || 24)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Name Size</Label>
                      <Input
                        type="number"
                        min={16}
                        max={72}
                        value={config.nameFontSize}
                        onChange={(e) => updateConfig('nameFontSize', parseInt(e.target.value) || 36)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Body Size</Label>
                      <Input
                        type="number"
                        min={10}
                        max={24}
                        value={config.bodyFontSize}
                        onChange={(e) => updateConfig('bodyFontSize', parseInt(e.target.value) || 14)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-100 space-y-4">
                    <div className="space-y-2">
                      <Label>Certificate Title</Label>
                      <Input
                        value={config.certificateTitle}
                        onChange={(e) => updateConfig('certificateTitle', e.target.value)}
                        placeholder="CERTIFICATE OF COMPLETION"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle Text</Label>
                      <Input
                        value={config.certificateSubtitle}
                        onChange={(e) => updateConfig('certificateSubtitle', e.target.value)}
                        placeholder="This is to certify that"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Completion Text</Label>
                      <Input
                        value={config.completionText}
                        onChange={(e) => updateConfig('completionText', e.target.value)}
                        placeholder="has successfully completed the course"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Signature Label</Label>
                      <Input
                        value={config.signatureLabel}
                        onChange={(e) => updateConfig('signatureLabel', e.target.value)}
                        placeholder="Instructor"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Logo Position</Label>
                      <Select
                        value={config.logoPosition}
                        onValueChange={(value) => updateConfig('logoPosition', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {logoPositions.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Padding (px)</Label>
                      <Input
                        type="number"
                        min={20}
                        max={80}
                        value={config.padding}
                        onChange={(e) => updateConfig('padding', parseInt(e.target.value) || 40)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <Label className="mb-4 block">Display Elements</Label>
                  <div className="space-y-3">
                    {[
                      { key: 'showOrganizationLogo', label: 'Organization Logo', icon: Building2 },
                      { key: 'showStudentName', label: 'Student Name', icon: Type },
                      { key: 'showCourseName', label: 'Course Name', icon: Award },
                      { key: 'showCompletionDate', label: 'Completion Date', icon: Layout },
                      { key: 'showCertificateId', label: 'Certificate ID', icon: Settings },
                      { key: 'showInstructorSignature', label: 'Instructor Signature', icon: Type },
                      { key: 'showQRCode', label: 'QR Code for Verification', icon: Eye },
                    ].map((option) => (
                      <label
                        key={option.key}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-black cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={config[option.key as keyof TemplateConfig] as boolean}
                          onChange={(e) => updateConfig(option.key as keyof TemplateConfig, e.target.checked as any)}
                          className="rounded border-2 border-black h-5 w-5 text-brand focus:ring-brand"
                        />
                        <option.icon className="h-4 w-4 text-gray-500" />
                        <span className="text-black font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="xl:sticky xl:top-6 h-fit">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
                {/* Certificate Preview */}
                <div
                  className="mx-auto shadow-lg transition-all"
                  style={{
                    width: config.orientation === 'landscape' ? '100%' : '70%',
                    aspectRatio: config.orientation === 'landscape' ? '1.414' : '0.707',
                    backgroundColor: config.backgroundColor,
                    border: config.borderStyle !== 'none' ? `${config.borderWidth}px ${config.borderStyle} ${config.borderColor}` : 'none',
                    padding: `${config.padding / 2}px`,
                    fontFamily: `"${config.fontFamily}", ${config.fontFamily === 'Georgia' || config.fontFamily === 'Times New Roman' || config.fontFamily === 'Playfair Display' ? 'serif' : 'sans-serif'}`,
                    backgroundImage: getBackgroundPattern(),
                    backgroundSize: getBackgroundSize(),
                  }}
                >
                  <div className="h-full flex flex-col items-center justify-between text-center">
                    {/* Logo */}
                    {config.showOrganizationLogo && (
                      <div
                        className={`w-full flex ${
                          config.logoPosition === 'top-left'
                            ? 'justify-start'
                            : config.logoPosition === 'top-right'
                            ? 'justify-end'
                            : 'justify-center'
                        }`}
                      >
                        <Award
                          className="h-8 w-8"
                          style={{ color: config.accentColor }}
                        />
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                      <p
                        className="font-bold tracking-widest mb-2"
                        style={{
                          color: config.textColor,
                          fontSize: `${config.titleFontSize / 2}px`,
                        }}
                      >
                        {config.certificateTitle}
                      </p>

                      <p
                        className="mb-2"
                        style={{
                          color: config.textColor,
                          fontSize: `${config.bodyFontSize / 2}px`,
                          opacity: 0.8,
                        }}
                      >
                        {config.certificateSubtitle}
                      </p>

                      {config.showStudentName && (
                        <p
                          className="font-bold my-2"
                          style={{
                            color: config.accentColor,
                            fontSize: `${config.nameFontSize / 2}px`,
                            borderBottom: `2px solid ${config.accentColor}`,
                            paddingBottom: '4px',
                          }}
                        >
                          John Doe
                        </p>
                      )}

                      {config.showCourseName && (
                        <div className="my-2">
                          <p
                            style={{
                              color: config.textColor,
                              fontSize: `${config.bodyFontSize / 2}px`,
                              opacity: 0.8,
                            }}
                          >
                            {config.completionText}
                          </p>
                          <p
                            className="font-semibold mt-1"
                            style={{
                              color: config.textColor,
                              fontSize: `${config.bodyFontSize / 2 + 2}px`,
                            }}
                          >
                            Introduction to Blockchain
                          </p>
                        </div>
                      )}

                      {config.showCompletionDate && (
                        <p
                          className="mt-2"
                          style={{
                            color: config.textColor,
                            fontSize: `${config.bodyFontSize / 2 - 1}px`,
                            opacity: 0.6,
                          }}
                        >
                          January 30, 2026
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="w-full flex items-end justify-between">
                      {config.showInstructorSignature && (
                        <div className="text-left">
                          <div
                            className="border-t pt-1"
                            style={{
                              borderColor: config.textColor,
                              width: '80px',
                            }}
                          >
                            <p
                              style={{
                                color: config.textColor,
                                fontSize: `${config.bodyFontSize / 2 - 2}px`,
                                opacity: 0.6,
                              }}
                            >
                              {config.signatureLabel}
                            </p>
                          </div>
                        </div>
                      )}

                      {config.showQRCode && (
                        <div
                          className="border-2 rounded"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderColor: config.textColor,
                            opacity: 0.3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontSize: '8px', color: config.textColor }}>QR</span>
                        </div>
                      )}

                      {config.showCertificateId && (
                        <div className="text-right">
                          <p
                            style={{
                              color: config.textColor,
                              fontSize: `${config.bodyFontSize / 2 - 2}px`,
                              opacity: 0.4,
                            }}
                          >
                            ID: CERT-2026-XXXX
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

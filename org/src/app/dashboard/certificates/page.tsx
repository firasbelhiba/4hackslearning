'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { certificatesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Search,
  Award,
  Eye,
  Download,
  ExternalLink,
  Settings,
  User,
  Calendar,
  BookOpen,
} from 'lucide-react';

interface Certificate {
  id: string;
  uniqueCode: string;
  pdfUrl: string | null;
  issuedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    level: string;
  };
}

export default function CertificatesPage() {
  const { currentOrganization } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, [currentOrganization]);

  const fetchCertificates = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const response = await certificatesApi.getOrganizationCertificates(currentOrganization.id);
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'success';
      case 'INTERMEDIATE':
        return 'warning';
      case 'ADVANCED':
        return 'destructive';
      default:
        return 'secondary';
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
        <div>
          <h1 className="text-3xl font-bold text-black">Certificates</h1>
          <p className="text-gray-600 mt-1">
            View all certificates issued to students in your organization.
          </p>
        </div>
        <Link href="/dashboard/certificates/templates">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by student name, email, course, or certificate ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand/20 border-2 border-black flex items-center justify-center">
              <Award className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">{certificates.length}</p>
              <p className="text-sm text-gray-600">Total Certificates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 border-2 border-black flex items-center justify-center">
              <User className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">
                {new Set(certificates.map(c => c.user.id)).size}
              </p>
              <p className="text-sm text-gray-600">Certified Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-100 border-2 border-black flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">
                {new Set(certificates.map(c => c.course.id)).size}
              </p>
              <p className="text-sm text-gray-600">Courses with Certificates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCertificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mb-4 shadow-brutal-sm">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">No certificates found</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchQuery
                ? 'No certificates match your search.'
                : 'No certificates have been issued yet. Students will receive certificates when they complete courses.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <div className="h-12 w-12 rounded-full bg-brand/20 border-2 border-black flex items-center justify-center shrink-0">
                    {certificate.user.avatar ? (
                      <img
                        src={certificate.user.avatar}
                        alt={certificate.user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-black">
                        {certificate.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Certificate Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-black truncate">{certificate.user.name}</h3>
                      <Badge variant={getLevelBadgeVariant(certificate.course.level)} className="shrink-0">
                        {certificate.course.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{certificate.user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <BookOpen className="h-3.5 w-3.5" />
                        {certificate.course.title}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(certificate.issuedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Certificate Code */}
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-500 mb-1">Certificate ID</p>
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {certificate.uniqueCode}
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/dashboard/certificates/${certificate.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {certificate.pdfUrl && (
                      <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <a
                      href={`/verify/${certificate.uniqueCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="primary">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

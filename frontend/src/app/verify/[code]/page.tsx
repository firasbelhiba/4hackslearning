'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, Award, Calendar, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Mock verification - replace with API call
const mockVerify = async (code: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (code.startsWith('4H')) {
    return {
      valid: true,
      certificate: {
        uniqueCode: code,
        recipientName: 'Alice Johnson',
        courseName: 'Hedera Certification - Intermediate',
        courseLevel: 'INTERMEDIATE',
        issuedAt: '2024-01-15T10:00:00Z',
        instructorName: 'Dhaker',
      },
    };
  }

  return { valid: false, certificate: null };
};

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<{
    valid: boolean;
    certificate: any;
  } | null>(null);

  useEffect(() => {
    const verify = async () => {
      setIsLoading(true);
      const res = await mockVerify(code);
      setResult(res);
      setIsLoading(false);
    };

    verify();
  }, [code]);

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold">4</span>
          <span className="text-3xl font-bold text-purple-600">HACKS</span>
        </Link>

        <Card className="shadow-brutal-lg">
          <CardContent className="p-8">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Verifying certificate...</p>
              </div>
            ) : result?.valid ? (
              <div>
                {/* Success Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-brand-dark" />
                  </div>
                  <h1 className="text-2xl font-bold text-brand-dark">Certificate Verified</h1>
                  <p className="text-gray-600 mt-2">This certificate is authentic and valid</p>
                </div>

                {/* Certificate Details */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Recipient</p>
                      <p className="font-medium">{result.certificate.recipientName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium">{result.certificate.courseName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Certificate ID</p>
                      <p className="font-mono font-medium">{result.certificate.uniqueCode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium">
                        {new Date(result.certificate.issuedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                  <Link href="/courses" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Browse Courses
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button variant="primary" className="w-full">
                      Go Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {/* Error Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-red-700">Certificate Not Found</h1>
                  <p className="text-gray-600 mt-2">
                    We couldn&apos;t verify this certificate code
                  </p>
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-500 mb-1">Searched Code</p>
                  <p className="font-mono font-medium">{code}</p>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  This could mean the certificate doesn&apos;t exist, or the code was entered
                  incorrectly. Please double-check the code and try again.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Go Home
                    </Button>
                  </Link>
                  <Link href="/courses" className="flex-1">
                    <Button variant="primary" className="w-full">
                      Explore Courses
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verify Another */}
        <div className="mt-6 text-center">
          <p className="text-sm text-black/60">
            Need to verify another certificate?{' '}
            <Link href="/verify" className="font-medium underline">
              Enter code manually
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

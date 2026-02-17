'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, Award, Calendar, User, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { certificatesApi } from '@/lib/api';

interface VerificationResult {
  valid: boolean;
  certificate: {
    uniqueCode: string;
    recipientName: string;
    courseName: string;
    courseLevel: string;
    issuedAt: string;
    instructorName: string;
  } | null;
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await certificatesApi.verify(code);
        setResult(response.data);
      } catch (err: any) {
        // If API returns 404 or other error, treat as invalid certificate
        setResult({ valid: false, certificate: null });
        if (err.response?.status !== 404) {
          setError('Failed to verify certificate. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
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
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-brand-dark" />
                <p className="text-gray-600">Verifying certificate...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-red-700">Verification Error</h1>
                <p className="text-gray-600 mt-2">{error}</p>
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
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
                      <p className="font-medium">{result.certificate!.recipientName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium">{result.certificate!.courseName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Certificate ID</p>
                      <p className="font-mono font-medium">{result.certificate!.uniqueCode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium">
                        {new Date(result.certificate!.issuedAt).toLocaleDateString('en-US', {
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

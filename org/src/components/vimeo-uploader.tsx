'use client';

import { useState, useRef, useCallback } from 'react';
import * as tus from 'tus-js-client';
import { vimeoApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface VimeoUploaderProps {
  onUploadComplete: (videoData: {
    videoId: string;
    videoUri: string;
    embedUrl: string;
  }) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function VimeoUploader({
  onUploadComplete,
  onError,
  accept = 'video/mp4,video/webm,video/ogg,video/quicktime',
  maxSizeMB = 500,
}: VimeoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<tus.Upload | null>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      // Validate file type
      const validTypes = accept.split(',');
      if (!validTypes.some((type) => selectedFile.type === type.trim())) {
        setErrorMessage('Invalid file type. Please select a valid video file.');
        setStatus('error');
        return;
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        setErrorMessage(`File too large. Maximum size is ${maxSizeMB}MB.`);
        setStatus('error');
        return;
      }

      setFile(selectedFile);
      setStatus('idle');
      setErrorMessage('');
      setProgress(0);
    },
    [accept, maxSizeMB]
  );

  const startUpload = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setStatus('uploading');
    setProgress(0);

    try {
      // Get upload ticket from backend
      const response = await vimeoApi.createUploadTicket(
        file.size,
        file.name,
        `Uploaded from 4hacks Learning`
      );

      const { uploadLink, videoUri, videoId } = response.data;

      // Create tus upload
      const upload = new tus.Upload(file, {
        uploadUrl: uploadLink,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.error('Upload error:', error);
          setStatus('error');
          setErrorMessage('Upload failed. Please try again.');
          setUploading(false);
          onError?.('Upload failed');
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          setProgress(percentage);
        },
        onSuccess: async () => {
          setStatus('processing');

          // Poll for video ready status
          let attempts = 0;
          const maxAttempts = 60; // 5 minutes with 5-second intervals
          const pollInterval = 5000;

          const checkStatus = async () => {
            try {
              const statusResponse = await vimeoApi.checkVideoStatus(videoId);
              if (statusResponse.data.ready) {
                setStatus('complete');
                setUploading(false);
                onUploadComplete({
                  videoId,
                  videoUri,
                  embedUrl: `https://player.vimeo.com/video/${videoId}`,
                });
                return;
              }
            } catch {
              // Continue polling
            }

            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, pollInterval);
            } else {
              // Video uploaded but still processing - return anyway
              setStatus('complete');
              setUploading(false);
              onUploadComplete({
                videoId,
                videoUri,
                embedUrl: `https://player.vimeo.com/video/${videoId}`,
              });
            }
          };

          checkStatus();
        },
      });

      uploadRef.current = upload;
      upload.start();
    } catch (error: any) {
      console.error('Failed to create upload ticket:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to start upload');
      setUploading(false);
      onError?.(error.response?.data?.message || 'Failed to start upload');
    }
  }, [file, onUploadComplete, onError]);

  const cancelUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    setUploading(false);
    setStatus('idle');
    setProgress(0);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Upload Area */}
      {!file && status !== 'complete' && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-8 border-2 border-dashed border-black rounded-lg hover:border-brand hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-3"
        >
          <div className="p-3 bg-gray-100 rounded-lg border-2 border-black">
            <Upload className="h-6 w-6 text-black" />
          </div>
          <div className="text-center">
            <p className="text-black font-bold">Click to upload video</p>
            <p className="text-gray-600 text-sm mt-1">
              MP4, WebM, OGG, or QuickTime up to {maxSizeMB}MB
            </p>
          </div>
        </button>
      )}

      {/* Selected File Preview */}
      {file && status !== 'complete' && (
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-black">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand rounded-lg border-2 border-black">
                <Upload className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-black font-bold truncate max-w-[200px]">{file.name}</p>
                <p className="text-gray-600 text-sm">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={reset}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black overflow-hidden">
                <div
                  className="bg-brand h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  {status === 'uploading' ? 'Uploading...' : 'Processing video...'}
                </span>
                <span className="text-black font-bold">{progress}%</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {status === 'idle' && (
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                onClick={startUpload}
                variant="primary"
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload to Vimeo
              </Button>
            </div>
          )}

          {status === 'uploading' && (
            <Button
              type="button"
              onClick={cancelUpload}
              variant="outline"
              className="w-full mt-3"
            >
              Cancel Upload
            </Button>
          )}

          {status === 'processing' && (
            <div className="flex items-center justify-center gap-2 mt-3 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Processing on Vimeo, please wait...</span>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-red-600 font-bold">{errorMessage}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={reset}
              className="border-red-500 text-red-600 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === 'complete' && (
        <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-green-700 font-bold">Video uploaded successfully!</p>
              <p className="text-green-600 text-sm">Your video is now ready for playback.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={reset}
              className="border-green-500 text-green-600 hover:bg-green-100"
            >
              Upload Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

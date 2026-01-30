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
          className="w-full p-8 border-2 border-dashed border-zinc-700 rounded-lg hover:border-[#D6FF25] hover:bg-zinc-800/50 transition-colors flex flex-col items-center justify-center gap-3"
        >
          <Upload className="h-8 w-8 text-zinc-500" />
          <div className="text-center">
            <p className="text-white font-medium">Click to upload video</p>
            <p className="text-zinc-500 text-sm mt-1">
              MP4, WebM, OGG, or QuickTime up to {maxSizeMB}MB
            </p>
          </div>
        </button>
      )}

      {/* Selected File Preview */}
      {file && status !== 'complete' && (
        <div className="p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-700 rounded">
                <Upload className="h-5 w-5 text-[#D6FF25]" />
              </div>
              <div>
                <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-zinc-500 text-sm">
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
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="space-y-2">
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-[#D6FF25] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">
                  {status === 'uploading' ? 'Uploading...' : 'Processing video...'}
                </span>
                <span className="text-[#D6FF25]">{progress}%</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {status === 'idle' && (
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                onClick={startUpload}
                className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f] flex-1"
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
              className="w-full mt-3 bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
            >
              Cancel Upload
            </Button>
          )}

          {status === 'processing' && (
            <div className="flex items-center justify-center gap-2 mt-3 text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing on Vimeo, please wait...</span>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="flex-1">
              <p className="text-red-400">{errorMessage}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={reset}
              className="text-red-400 hover:text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === 'complete' && (
        <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Video uploaded successfully!</p>
              <p className="text-green-400/70 text-sm">Your video is now ready for playback.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={reset}
              className="text-green-400 hover:text-white"
            >
              Upload Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

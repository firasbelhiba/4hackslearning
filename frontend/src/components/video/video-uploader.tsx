'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Video, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadApi, CloudinarySignature } from '@/lib/api';

interface VideoUploaderProps {
  onUploadComplete: (data: {
    cloudinaryPublicId: string;
    cloudinaryUrl: string;
    duration?: number;
  }) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  maxSizeMB?: number;
  existingVideo?: {
    cloudinaryPublicId?: string;
    cloudinaryUrl?: string;
  };
}

export function VideoUploader({
  onUploadComplete,
  onUploadError,
  folder = 'course-videos',
  maxSizeMB = 500,
  existingVideo,
}: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(existingVideo?.cloudinaryUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(!!existingVideo?.cloudinaryPublicId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid video format. Please use MP4, WebM, OGG, or MOV.';
    }
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Video size must be less than ${maxSizeMB}MB`;
    }
    return null;
  }, [maxSizeMB]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploaded(false);

    // Create video preview
    const videoUrl = URL.createObjectURL(selectedFile);
    setPreview(videoUrl);
  }, [validateFile, onUploadError]);

  const uploadToCloudinary = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get signed upload params from backend
      const signatureResponse = await uploadApi.getCloudinaryVideoSignature(folder);
      const signature: CloudinarySignature = signatureResponse.data;

      // Build FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature.signature);
      formData.append('timestamp', signature.timestamp.toString());
      formData.append('api_key', signature.apiKey);
      formData.append('folder', signature.folder);
      formData.append('public_id', signature.publicId);

      // Upload directly to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/video/upload`;

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploaded(true);
          setUploading(false);
          setProgress(100);

          onUploadComplete({
            cloudinaryPublicId: response.public_id,
            cloudinaryUrl: response.secure_url,
            duration: Math.round(response.duration || 0),
          });
        } else {
          const errorMsg = 'Upload failed. Please try again.';
          setError(errorMsg);
          setUploading(false);
          onUploadError?.(errorMsg);
        }
      });

      xhr.addEventListener('error', () => {
        const errorMsg = 'Network error. Please check your connection.';
        setError(errorMsg);
        setUploading(false);
        onUploadError?.(errorMsg);
      });

      xhr.open('POST', cloudinaryUrl);
      xhr.send(formData);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to get upload signature';
      setError(errorMsg);
      setUploading(false);
      onUploadError?.(errorMsg);
    }
  }, [file, folder, onUploadComplete, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        onUploadError?.(validationError);
        return;
      }
      setFile(droppedFile);
      setError(null);
      setUploaded(false);
      setPreview(URL.createObjectURL(droppedFile));
    }
  }, [validateFile, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setUploaded(false);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Cloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">Drop your video here</p>
          <p className="text-sm text-gray-500 mb-4">or click to browse</p>
          <p className="text-xs text-gray-400">
            MP4, WebM, OGG, or MOV up to {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative rounded-lg overflow-hidden border-2 border-black bg-black aspect-video">
            <video
              src={preview}
              className="w-full h-full object-contain"
              controls={!uploading}
            />
            {!uploading && !uploaded && (
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* File Info */}
          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              {uploaded && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading to Cloudinary...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          {!uploaded && !uploading && (
            <Button
              type="button"
              variant="primary"
              onClick={uploadToCloudinary}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          )}

          {/* Success Message */}
          {uploaded && (
            <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Video uploaded successfully!</span>
            </div>
          )}

          {/* Change Video Button */}
          {uploaded && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFile}
              className="w-full"
            >
              Change Video
            </Button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

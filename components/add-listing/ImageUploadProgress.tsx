"use client"

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  X, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { BatchUploadProgress, UploadProgress } from '@/lib/uploadManager';

interface ImageUploadProgressProps {
  batchProgress: BatchUploadProgress;
  onPauseUpload: (id: string) => void;
  onResumeUpload: (id: string) => void;
  onRemoveUpload: (id: string) => void;
  onRetryUpload: (id: string) => void;
  onPauseAll: () => void;
  onResumeAll: () => void;
  onRetryFailed: () => void;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

const getStatusIcon = (status: UploadProgress['status']) => {
  switch (status) {
    case 'completed':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'paused':
      return <Pause className="h-4 w-4 text-yellow-500" />;
    case 'compressing':
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'uploading':
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: UploadProgress['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    case 'compressing':
    case 'uploading':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const UploadItem: React.FC<{
  upload: UploadProgress;
  onPause: () => void;
  onResume: () => void;
  onRemove: () => void;
  onRetry: () => void;
}> = ({ upload, onPause, onResume, onRemove, onRetry }) => {
  const canPause = upload.status === 'uploading';
  const canResume = upload.status === 'paused';
  const canRetry = upload.status === 'error';
  const showProgress = upload.status !== 'pending' && upload.status !== 'error';

  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {upload.file.name}
            </span>
            <Badge variant="secondary" className={getStatusColor(upload.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(upload.status)}
                <span className="text-xs">{upload.status}</span>
              </div>
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            {canPause && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPause}
                className="h-8 w-8 p-0"
              >
                <Pause className="h-3 w-3" />
              </Button>
            )}
            
            {canResume && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResume}
                className="h-8 w-8 p-0"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
            
            {canRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {upload.status === 'compressing' ? 'Compressing...' : 
                 upload.status === 'uploading' ? 'Uploading...' : 
                 'Completed'}
              </span>
              <span>{Math.round(upload.progress)}%</span>
            </div>
            <Progress value={upload.progress} className="h-2" />
            
            {upload.originalSize && upload.compressedSize && upload.status === 'completed' && (
              <div className="text-xs text-gray-500">
                Size: {formatFileSize(upload.originalSize)} → {formatFileSize(upload.compressedSize)}
                {' '}({Math.round((1 - upload.compressedSize / upload.originalSize) * 100)}% smaller)
              </div>
            )}
          </div>
        )}
        
        {upload.error && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            {upload.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ImageUploadProgress: React.FC<ImageUploadProgressProps> = ({
  batchProgress,
  onPauseUpload,
  onResumeUpload,
  onRemoveUpload,
  onRetryUpload,
  onPauseAll,
  onResumeAll,
  onRetryFailed,
  className = "",
}) => {
  const uploads = Object.values(batchProgress.uploads);
  const hasActiveUploads = uploads.some(u => 
    u.status === 'uploading' || u.status === 'compressing'
  );
  const hasPausedUploads = uploads.some(u => u.status === 'paused');
  const hasFailedUploads = uploads.some(u => u.status === 'error');

  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Upload Progress</h3>
            <div className="flex items-center space-x-2">
              {hasActiveUploads && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPauseAll}
                  className="h-8"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause All
                </Button>
              )}
              
              {hasPausedUploads && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResumeAll}
                  className="h-8"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Resume All
                </Button>
              )}
              
              {hasFailedUploads && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetryFailed}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Failed
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {batchProgress.completedUploads} of {batchProgress.totalUploads} images uploaded
              </span>
              <span>{Math.round(batchProgress.overallProgress)}%</span>
            </div>
            
            <Progress value={batchProgress.overallProgress} className="h-3" />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {batchProgress.activeUploads > 0 && 
                  `${batchProgress.activeUploads} active • Processing in batches of 4`
                }
                {batchProgress.activeUploads === 0 && batchProgress.completedUploads === 0 &&
                  'Preparing uploads...'
                }
                {batchProgress.activeUploads === 0 && batchProgress.completedUploads > 0 && batchProgress.completedUploads < batchProgress.totalUploads &&
                  'Starting next batch...'
                }
              </span>
              {batchProgress.estimatedTimeRemaining && (
                <span>
                  ~{formatTime(batchProgress.estimatedTimeRemaining)} remaining
                </span>
              )}
            </div>
            
            {/* Batch processing stats */}
            {batchProgress.totalUploads > 4 && (
              <div className="text-xs text-blue-600 bg-blue-50 rounded p-2">
                <div className="flex items-center space-x-1">
                  <ImageIcon className="h-3 w-3" />
                  <span>
                    Parallel processing: Processing up to 4 images simultaneously for faster uploads
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Upload Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {uploads.map((upload) => (
          <UploadItem
            key={upload.id}
            upload={upload}
            onPause={() => onPauseUpload(upload.id)}
            onResume={() => onResumeUpload(upload.id)}
            onRemove={() => onRemoveUpload(upload.id)}
            onRetry={() => onRetryUpload(upload.id)}
          />
        ))}
      </div>
    </div>
  );
};

"use client"

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { BatchUploadProgress, UploadProgress } from '@/lib/uploadManager';

interface ImageUploadProgressProps {
  batchProgress: BatchUploadProgress;
  onRetryUpload: (id: string) => void;
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
    case 'compressing':
    case 'uploading':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusDisplayText = (status: UploadProgress['status']) => {
  switch (status) {
    case 'compressing':
      return 'processing';
    case 'uploading':
      return 'uploading';
    case 'completed':
      return 'completed';
    case 'error':
      return 'error';
    case 'pending':
      return 'pending';
    default:
      return status;
  }
};

const UploadItem: React.FC<{
  upload: UploadProgress;
  onRetry: () => void;
}> = ({ upload, onRetry }) => {
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
                <span className="text-xs">{getStatusDisplayText(upload.status)}</span>
              </div>
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
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
          </div>
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {upload.status === 'compressing' ? 'Processing...' : 
                 upload.status === 'uploading' ? 'Uploading...' : 
                 'Completed'}
              </span>
              <span>{Math.round(upload.progress)}%</span>
            </div>
            <Progress value={upload.progress} className="h-2" />
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
  onRetryUpload,
  onRetryFailed,
  className = "",
}) => {
  const uploads = Object.values(batchProgress.uploads);
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
              {batchProgress.estimatedTimeRemaining && (
                <span>
                  ~{formatTime(batchProgress.estimatedTimeRemaining)} remaining
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Upload Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {uploads.map((upload) => (
          <UploadItem
            key={upload.id}
            upload={upload}
            onRetry={() => onRetryUpload(upload.id)}
          />
        ))}
      </div>
    </div>
  );
};

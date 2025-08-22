// lib/uploadPerformanceMonitor.ts
export interface UploadPerformanceMetrics {
  totalFiles: number;
  totalSizeBytes: number;
  totalUploadTime: number;
  averageUploadTime: number;
  throughputMBps: number;
  compressionRatio: number;
  peakConcurrentUploads: number;
  batchSize: number;
}

export class UploadPerformanceMonitor {
  private startTime: number = 0;
  private endTime: number = 0;
  private filesProcessed: number = 0;
  private totalOriginalSize: number = 0;
  private totalCompressedSize: number = 0;
  private peakConcurrentUploads: number = 0;
  private batchSize: number = 4;
  private uploadTimes: number[] = [];

  start(): void {
    this.startTime = Date.now();
    this.reset();
  }

  end(): void {
    this.endTime = Date.now();
  }

  reset(): void {
    this.filesProcessed = 0;
    this.totalOriginalSize = 0;
    this.totalCompressedSize = 0;
    this.peakConcurrentUploads = 0;
    this.uploadTimes = [];
  }

  recordFileProcessed(originalSize: number, compressedSize: number, uploadTime: number): void {
    this.filesProcessed++;
    this.totalOriginalSize += originalSize;
    this.totalCompressedSize += compressedSize;
    this.uploadTimes.push(uploadTime);
  }

  recordConcurrentUploads(count: number): void {
    this.peakConcurrentUploads = Math.max(this.peakConcurrentUploads, count);
  }

  setBatchSize(size: number): void {
    this.batchSize = size;
  }

  getMetrics(): UploadPerformanceMetrics {
    const totalTime = this.endTime - this.startTime;
    const totalSizeMB = this.totalCompressedSize / (1024 * 1024);
    const totalTimeSeconds = totalTime / 1000;

    return {
      totalFiles: this.filesProcessed,
      totalSizeBytes: this.totalCompressedSize,
      totalUploadTime: totalTime,
      averageUploadTime: this.uploadTimes.length > 0 
        ? this.uploadTimes.reduce((a, b) => a + b, 0) / this.uploadTimes.length 
        : 0,
      throughputMBps: totalTimeSeconds > 0 ? totalSizeMB / totalTimeSeconds : 0,
      compressionRatio: this.totalOriginalSize > 0 
        ? this.totalCompressedSize / this.totalOriginalSize 
        : 1,
      peakConcurrentUploads: this.peakConcurrentUploads,
      batchSize: this.batchSize,
    };
  }

  logPerformanceReport(): void {
    const metrics = this.getMetrics();
    
    console.log('📊 Upload Performance Report:');
    console.log(`   Files processed: ${metrics.totalFiles}`);
    console.log(`   Total size: ${(metrics.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Total time: ${(metrics.totalUploadTime / 1000).toFixed(2)} seconds`);
    console.log(`   Average upload time: ${(metrics.averageUploadTime / 1000).toFixed(2)} seconds/file`);
    console.log(`   Throughput: ${metrics.throughputMBps.toFixed(2)} MB/s`);
    console.log(`   Compression ratio: ${(metrics.compressionRatio * 100).toFixed(1)}%`);
    console.log(`   Peak concurrent uploads: ${metrics.peakConcurrentUploads}`);
    console.log(`   Batch size: ${metrics.batchSize}`);
    console.log(`   Efficiency: ${((metrics.peakConcurrentUploads / metrics.batchSize) * 100).toFixed(1)}% of max parallelism utilized`);
  }


}

// Global instance for easy access
export const uploadPerformanceMonitor = new UploadPerformanceMonitor();

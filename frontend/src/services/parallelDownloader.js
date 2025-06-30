// 🚀 초고속 병렬 다운로더 - Range 요청으로 동시 다운로드
export class ParallelVideoDownloader {
  constructor(url, options = {}) {
    this.url = url;
    this.chunkCount = options.chunkCount || 8; // 8개 스레드로 병렬 다운로드
    this.onProgress = options.onProgress || (() => {});
    this.signal = options.signal;
  }

  async download() {
    console.log('🚀 Starting parallel download with', this.chunkCount, 'chunks');
    
    try {
      // 1. 파일 크기 먼저 확인 (HEAD 요청)
      const headResponse = await fetch(this.url, { 
        method: 'HEAD',
        signal: this.signal
      });
      
      if (!headResponse.ok) {
        throw new Error(`HEAD request failed: ${headResponse.status}`);
      }
      
      const contentLength = headResponse.headers.get('content-length');
      const acceptRanges = headResponse.headers.get('accept-ranges');
      
      console.log('🔍 HEAD response headers:', {
        'content-length': contentLength,
        'accept-ranges': acceptRanges,
        'content-type': headResponse.headers.get('content-type'),
        'cache-control': headResponse.headers.get('cache-control')
      });
      
      if (!contentLength) {
        console.log('⚠️ No content-length header, falling back to sequential download');
        return this.fallbackDownload();
      }
      
      if (acceptRanges !== 'bytes') {
        console.log(`⚠️ Server accept-ranges: "${acceptRanges}" (not "bytes"), falling back to sequential download`);
        return this.fallbackDownload();
      }
      
      const totalSize = parseInt(contentLength);
      console.log(`📊 File size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      
      // 2. 청크 크기 계산
      const chunkSize = Math.ceil(totalSize / this.chunkCount);
      const chunks = [];
      
      for (let i = 0; i < this.chunkCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize - 1, totalSize - 1);
        chunks.push({ start, end, index: i });
      }
      
      console.log(`🔥 Downloading ${chunks.length} chunks in parallel:`, 
        chunks.map(c => `${c.index}: ${c.start}-${c.end}`));
      
      // 3. 병렬 다운로드 시작
      const startTime = Date.now();
      const results = new Array(chunks.length);
      let completedChunks = 0;
      let totalReceived = 0;
      
      const downloadPromises = chunks.map(async (chunk) => {
        const response = await fetch(this.url, {
          headers: {
            'Range': `bytes=${chunk.start}-${chunk.end}`,
            'Accept': 'video/mp4,video/*,*/*'
          },
          signal: this.signal
        });
        
        if (!response.ok) {
          throw new Error(`Chunk ${chunk.index} failed: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        results[chunk.index] = new Uint8Array(arrayBuffer);
        
        completedChunks++;
        totalReceived += arrayBuffer.byteLength;
        
        const progress = (totalReceived / totalSize * 100).toFixed(1);
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = (totalReceived / 1024 / 1024) / elapsed;
        
        console.log(`⚡ Chunk ${chunk.index} complete! Progress: ${progress}% (${speed.toFixed(2)} MB/s)`);
        
        if (this.onProgress) {
          this.onProgress({
            progress: parseFloat(progress),
            loaded: totalReceived,
            total: totalSize,
            speed: speed
          });
        }
        
        return arrayBuffer;
      });
      
      // 4. 모든 청크 완료 대기
      await Promise.all(downloadPromises);
      
      // 5. 청크들을 하나로 합치기
      console.log('🔧 Combining chunks...');
      const totalLength = results.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      
      let offset = 0;
      for (const chunk of results) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      
      // 6. Blob 생성
      const blob = new Blob([combined], { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);
      
      const totalTime = (Date.now() - startTime) / 1000;
      const avgSpeed = (blob.size / 1024 / 1024) / totalTime;
      
      console.log(`🎉 Parallel download completed! ${(blob.size / 1024 / 1024).toFixed(2)}MB in ${totalTime.toFixed(1)}s (${avgSpeed.toFixed(2)} MB/s)`);
      
      return {
        blob,
        blobUrl,
        size: blob.size,
        downloadTime: totalTime,
        avgSpeed
      };
      
    } catch (error) {
      console.error('💥 Parallel download failed:', error);
      return this.fallbackDownload();
    }
  }
  
  async fallbackDownload() {
    console.log('📥 Falling back to optimized sequential download...');
    
    const startTime = Date.now();
    
    const response = await fetch(this.url, {
      signal: this.signal,
      headers: {
        'Accept': 'video/mp4,video/*,*/*',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Fallback download failed: ${response.status}`);
    }
    
    const contentLength = response.headers.get('content-length');
    const totalSize = contentLength ? parseInt(contentLength) : 0;
    
    console.log(`📊 Fallback download size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Stream으로 진행률 모니터링
    const reader = response.body.getReader();
    const chunks = [];
    let receivedLength = 0;
    let lastProgressTime = Date.now();
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      // 진행률 로깅
      const now = Date.now();
      if (now - lastProgressTime > 1000) { // 1초마다
        const progress = totalSize ? (receivedLength / totalSize * 100).toFixed(1) : 'Unknown';
        const elapsed = (now - startTime) / 1000;
        const speed = (receivedLength / 1024 / 1024) / elapsed;
        
        console.log(`📥 Fallback progress: ${progress}% (${speed.toFixed(2)} MB/s)`);
        
        if (this.onProgress) {
          this.onProgress({
            progress: parseFloat(progress),
            loaded: receivedLength,
            total: totalSize,
            speed: speed
          });
        }
        
        lastProgressTime = now;
      }
    }
    
    const blob = new Blob(chunks, { type: 'video/mp4' });
    const blobUrl = URL.createObjectURL(blob);
    
    const downloadTime = (Date.now() - startTime) / 1000;
    const avgSpeed = (blob.size / 1024 / 1024) / downloadTime;
    
    console.log(`✅ Fallback download completed! ${(blob.size / 1024 / 1024).toFixed(2)}MB in ${downloadTime.toFixed(1)}s (${avgSpeed.toFixed(2)} MB/s)`);
    
    return {
      blob,
      blobUrl,
      size: blob.size,
      downloadTime: downloadTime,
      avgSpeed: avgSpeed
    };
  }
}

// 헬퍼 함수
export async function downloadVideoFast(url, options = {}) {
  const downloader = new ParallelVideoDownloader(url, options);
  return await downloader.download();
} 
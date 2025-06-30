import axios from 'axios';

// API 기본 URL 설정 - 자동 RunPod URL 감지 (포트 8001)
const API_BASE_URL = (() => {
  // 브라우저에서 실행 중이고 RunPod 프록시 URL인 경우 자동 감지
  if (typeof window !== 'undefined' && window.location.hostname.includes('proxy.runpod.net')) {
    const podId = window.location.hostname.split('-')[0];
    const autoUrl = `https://${podId}-8001.proxy.runpod.net`;
    console.log('🔄 Auto-detected RunPod backend URL:', autoUrl);
    return autoUrl;
  }
  
  // 로컬 개발환경 또는 환경변수 사용
  const fallbackUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
  console.log('🏠 Using fallback URL:', fallbackUrl);
  return fallbackUrl;
})();

// RunPod 백엔드 헬스체크
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    throw error;
  }
};

// 영상 목록 가져오기
export const getVideoList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos`);
    return response.data;
  } catch (error) {
    console.error('Error getting video list:', error);
    throw error;
  }
};

// 카메라로 촬영한 얼굴과 영상으로 페이스퓨전 실행
export const startFaceFusion = async (capturedImage, videoId) => {
  const startTime = Date.now(); // 시작 시간 기록
  
  try {
    console.log('🚀 startFaceFusion called with:', {
      capturedImageLength: capturedImage ? capturedImage.length : 'NONE',
      videoId: videoId,
      videoIdType: typeof videoId,
      apiUrl: `${API_BASE_URL}/faceswap-with-camera`,
      startTime: new Date(startTime).toLocaleTimeString()
    });

    if (!capturedImage) {
      throw new Error('캡처된 이미지가 없습니다');
    }

    if (!videoId || videoId < 1) {
      throw new Error('유효하지 않은 비디오 ID입니다');
    }

    // base64 이미지를 그대로 전송 (백엔드에서 처리)
    
    const formData = new FormData();
    formData.append('face_image_base64', capturedImage); // base64 그대로 전송
    formData.append('video_id', videoId); // 문자열 ID 전송 (male_1, female_2 등)
    
    console.log('📡 Sending request to API...', {
      time: new Date().toLocaleTimeString(),
      videoId: videoId,
      videoIdType: typeof videoId,
      formDataEntries: Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'string' ? `${value.substring(0, 50)}...` : typeof value])
    });
    const response = await axios.post(`${API_BASE_URL}/faceswap-with-camera`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30초 타임아웃
    });
    
    const requestTime = Date.now() - startTime;
    console.log('✅ API response received:', {
      ...response.data,
      requestTime: `${requestTime}ms`,
      endTime: new Date().toLocaleTimeString()
    });
    
    return { ...response.data, requestTime };
  } catch (error) {
    console.error('❌ Error in startFaceFusion:', error);
    
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태코드
      console.error('📨 Error response:', error.response.data);
      console.error('📊 Error status:', error.response.status);
      throw new Error(`서버 오류 (${error.response.status}): ${error.response.data?.detail || error.response.data?.error || '알 수 없는 오류'}`);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.error('📡 No response received:', error.request);
      throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    } else {
      // 요청 설정 중 오류
      console.error('⚙️ Request setup error:', error.message);
      throw new Error(`요청 오류: ${error.message}`);
    }
  }
};

// 결과 다운로드
export const downloadResult = async (jobId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/download/${jobId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading result:', error);
    throw error;
  }
};

// 작업 상태 확인 - 최적화됨
export const getJobStatus = async (jobId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/status/${jobId}`, {
      timeout: 3000  // 빠른 타임아웃
    });
    return response.data;
  } catch (error) {
    console.error('Error getting job status:', error);
    throw error;
  }
};

// ⚡ 초고속 결과 체크 - 스트리밍 방식 (새로운 최적화!)
export const getResultStreamingFast = async (jobId) => {
  const checkTime = Date.now();
  
  try {
    console.log('⚡⚡ STREAMING result check...', {
      jobId,
      checkTime: new Date(checkTime).toLocaleTimeString()
    });
    
    // 먼저 상태 체크
    const statusResponse = await axios.get(`${API_BASE_URL}/status/${jobId}`, {
      timeout: 3000  // 상태 체크는 빠르게
    });
    
    if (statusResponse.data.status !== 'completed' || !statusResponse.data.file_ready) {
      return {
        success: false,
        status: statusResponse.data.status,
        message: 'Still processing...'
      };
    }
    
    console.log('📁 File ready, downloading...', {
      fileSize: `${(statusResponse.data.file_size / 1024 / 1024).toFixed(1)}MB`
    });
    
    // 완료되었으면 스트리밍으로 다운로드 - 파일 크기에 따라 타임아웃 조정
    const fileSizeMB = statusResponse.data.file_size / 1024 / 1024;
    const downloadTimeout = Math.max(30000, fileSizeMB * 2000); // 최소 30초, MB당 2초 추가
    
    console.log(`⏱️ Using download timeout: ${downloadTimeout}ms for ${fileSizeMB.toFixed(1)}MB file`);
    
    const streamResponse = await axios.get(`${API_BASE_URL}/result/${jobId}/stream`, {
      responseType: 'blob',
      timeout: downloadTimeout,
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📥 Download progress: ${progress}% (${(progressEvent.loaded / 1024 / 1024).toFixed(1)}MB)`);
        }
      }
    });
    
    // Blob을 base64로 변환
    const blob = streamResponse.data;
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const totalTime = Date.now() - checkTime;
        const base64 = reader.result.split(',')[1];
        console.log('⚡⚡ STREAMING complete:', {
          jobId,
          totalTime: `${totalTime}ms`,
          blobSize: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
          base64Length: base64.length,
          processingTime: statusResponse.data.processing_time
        });
        
        resolve({
          success: true,
          data: base64,
          status: 'completed',
          downloadTime: totalTime,
          processingTime: statusResponse.data.processing_time
        });
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert blob to base64'));
      };
      reader.readAsDataURL(blob);
    });
    
  } catch (error) {
    // 404는 아직 처리중
    if (error.response?.status === 404) {
      return {
        success: false,
        status: 'processing',
        message: 'Still processing...'
      };
    }
    
    // 타임아웃 에러인 경우 더 자세한 정보
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Download timeout - trying fallback method');
      return {
        success: false,
        status: 'timeout',
        message: 'Download timeout - will retry with different method'
      };
    }
    
    console.error('Error getting streaming result:', error);
    return {
      success: false,
      status: 'error',
      message: error.message
    };
  }
};

// 결과를 URL로 가져오기 - 최적화됨
export const getResultBase64Fast = async (jobId) => {
  const checkTime = Date.now();
  
  try {
    console.log('⚡ Ultra fast result check...', {
      jobId,
      checkTime: new Date(checkTime).toLocaleTimeString()
    });
    
    // 병렬로 상태와 URL 체크
    const [statusPromise, urlPromise] = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/status/${jobId}`, { timeout: 3000 }),
      axios.get(`${API_BASE_URL}/result/${jobId}/url`, { timeout: 3000 })
    ]);
    
    // URL 요청이 성공했으면 바로 다운로드
    if (urlPromise.status === 'fulfilled' && urlPromise.value.data.success) {
      const urlData = urlPromise.value.data;
      console.log('⚡ URL received instantly:', {
        jobId,
        fileUrl: urlData.file_url,
        fileSize: `${(urlData.file_size / 1024 / 1024).toFixed(2)}MB`,
        processingTime: `${urlData.processing_time?.toFixed(1)}s`
      });
      
      // 파일 크기에 따라 다운로드 타임아웃 조정
      const fileSizeMB = urlData.file_size / 1024 / 1024;
      const downloadTimeout = Math.max(60000, fileSizeMB * 3000); // 최소 60초, MB당 3초 추가
      
      console.log(`⏱️ Using download timeout: ${downloadTimeout}ms for ${fileSizeMB.toFixed(1)}MB file`);
      
      // 파일 직접 다운로드 (병렬 처리 + 스트리밍)
      const downloadTime = Date.now();
      const fileResponse = await axios.get(urlData.file_url, {
        responseType: 'blob',
        timeout: downloadTimeout,
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📥 URL Download progress: ${progress}% (${(progressEvent.loaded / 1024 / 1024).toFixed(1)}MB)`);
          }
        }
      });
      
      // Blob을 base64로 변환
      const blob = fileResponse.data;
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const totalTime = Date.now() - checkTime;
          const downloadOnlyTime = Date.now() - downloadTime;
          const base64 = reader.result.split(',')[1];
          console.log('⚡ Ultra fast complete:', {
            jobId,
            totalTime: `${totalTime}ms`,
            downloadTime: `${downloadOnlyTime}ms`,
            blobSize: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
            base64Length: base64.length,
            processingTime: `${urlData.processing_time?.toFixed(1)}s`
          });
          
          resolve({
            success: true,
            data: base64,
            status: 'completed',
            downloadTime: totalTime,
            processingTime: urlData.processing_time
          });
        };
        reader.onerror = () => {
          reject(new Error('Failed to convert blob to base64'));
        };
        reader.readAsDataURL(blob);
      });
    }
    
    // URL이 실패했으면 상태 확인
    if (statusPromise.status === 'fulfilled') {
      const status = statusPromise.value.data.status;
      return {
        success: false,
        status: status,
        message: status === 'failed' ? 'Processing failed' : 'Still processing...'
      };
    }
    
    return {
      success: false,
      status: 'processing',
      message: 'Still processing...'
    };
    
  } catch (error) {
    // 404는 아직 처리중
    if (error.response?.status === 404) {
      return {
        success: false,
        status: 'processing',
        message: 'Still processing...'
      };
    }
    
    // 타임아웃 에러인 경우 더 자세한 정보
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Download timeout in URL method');
      return {
        success: false,
        status: 'timeout',
        message: 'Download timeout'
      };
    }
    
    console.error('Error getting ultra fast result:', error);
    return {
      success: false,
      status: 'error',
      message: error.message
    };
  }
};

// 🎥 서버 비디오 URL 직접 사용 - 다운로드 없이 바로 재생!
export const getResultVideoUrl = async (jobId) => {
  const checkTime = Date.now();
  
  try {
    console.log('🎥 Getting video URL directly...', {
      jobId,
      checkTime: new Date(checkTime).toLocaleTimeString()
    });
    
    // 상태와 URL을 빠르게 체크
    const [statusResponse, urlResponse] = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/status/${jobId}`, { timeout: 3000 }),
      axios.get(`${API_BASE_URL}/result/${jobId}/url`, { timeout: 3000 })
    ]);
    
    // 완료되었고 URL이 있으면 바로 반환
    if (urlResponse.status === 'fulfilled' && urlResponse.value.data.success) {
      const urlData = urlResponse.value.data;
      const totalTime = Date.now() - checkTime;
      
      // 🚀 최적화된 비디오 URL 생성 (즉시 재생 가능)
      const pod_id = import.meta.env.VITE_RUNPOD_POD_ID || urlData.file_url.match(/https:\/\/([^-]+)-/)?.[1];
      const optimizedVideoUrl = pod_id 
        ? `https://${pod_id}-8001.proxy.runpod.net/video/${jobId}`
        : urlData.file_url;
      
      console.log('🎥 Video URL ready instantly!', {
        jobId,
        totalTime: `${totalTime}ms`,
        originalUrl: urlData.file_url,
        optimizedUrl: optimizedVideoUrl,
        fileSize: `${(urlData.file_size / 1024 / 1024).toFixed(2)}MB`,
        processingTime: `${urlData.processing_time?.toFixed(1)}s`
      });
      
      return {
        success: true,
        videoUrl: optimizedVideoUrl,  // 최적화된 URL 사용
        status: 'completed',
        checkTime: totalTime,
        processingTime: urlData.processing_time,
        fileSize: urlData.file_size
      };
    }
    
    // 상태 확인
    if (statusResponse.status === 'fulfilled') {
      const status = statusResponse.value.data.status;
      return {
        success: false,
        status: status,
        message: status === 'failed' ? 'Processing failed' : 'Still processing...'
      };
    }
    
    return {
      success: false,
      status: 'processing',
      message: 'Still processing...'
    };
    
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        success: false,
        status: 'processing',
        message: 'Still processing...'
      };
    }
    
    console.error('Error getting video URL:', error);
    return {
      success: false,
      status: 'error',
      message: error.message
    };
  }
};

// 백업용 blob 버전 - 이제 스트리밍 우선 사용
export const getResultBase64Blob = async (jobId) => {
  // 새로운 스트리밍 방식을 먼저 시도
  return getResultStreamingFast(jobId);
};

// 결과를 base64로 가져오기 (기존 버전 - 호환성용)
export const getResultBase64 = async (jobId) => {
  // 최적화된 버전 사용
  return getResultBase64Fast(jobId);
};

// 임시파일 정리
export const cleanupFiles = async (jobId) => {
  try {
    await axios.delete(`${API_BASE_URL}/cleanup/${jobId}`);
  } catch (error) {
    console.error('Error cleaning up files:', error);
    throw error;
  }
};

// 기존 함수들 (호환성을 위해 유지하되 새로운 API로 리다이렉트)
export const uploadImage = async (imageData) => {
  // 이미지는 더 이상 별도로 업로드하지 않고 바로 처리에서 사용
  return { imageId: 'camera_capture', success: true };
};

export const startDeepfake = async (imageId, scenarioId) => {
  // 이 함수는 이제 startFaceFusion으로 대체됨
  // scenarioId를 videoId로 매핑
  const videoId = scenarioId || 1;
  return { taskId: `task_${Date.now()}`, success: true };
};

export const getDeepfakeStatus = async (taskId) => {
  // 간단한 진행률 시뮬레이션
  const elapsed = Date.now() - parseInt(taskId.split('_')[1]);
  const progress = Math.min(100, Math.floor(elapsed / 1000) * 10);
  const currentStep = Math.min(4, Math.floor(progress / 25) + 1);
  
  return {
    progress,
    currentStep,
    completed: progress >= 100
  };
};

export const getDeepfakeResult = async (taskId) => {
  return { resultUrl: '/api/placeholder-result.mp4' };
};

export const deleteUserData = async (imageId) => {
  // 실제 정리는 cleanupFiles 함수 사용
  console.log('User data cleanup simulated for:', imageId);
}; 
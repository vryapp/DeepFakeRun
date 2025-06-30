import React, { createContext, useContext, useState, useEffect } from 'react';
import { deleteUserData } from '../services/api';

const DeepfakeContext = createContext();

export const useDeepfake = () => {
  const context = useContext(DeepfakeContext);
  if (!context) {
    throw new Error('useDeepfake must be used within a DeepfakeProvider');
  }
  return context;
};

export const DeepfakeProvider = ({ children }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [resultData, setResultData] = useState(null);
  
  // 전역 처리 상태 추가 (중복 API 호출 방지)
  const [processedJobs, setProcessedJobs] = useState(new Set());
  const [currentlyProcessing, setCurrentlyProcessing] = useState(null);
  
  // 팝업 상태 관리 (컴포넌트 리마운트와 무관하게 유지)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completionCountdown, setCompletionCountdown] = useState(10);
  
  // 🚀 전역 비디오 캐시 (컴포넌트 재마운트에도 유지)
  const [videoCache, setVideoCache] = useState(new Map());

  // 컴포넌트가 언마운트될 때 사용자 데이터 삭제
  useEffect(() => {
    return () => {
      if (imageId) {
        deleteUserData(imageId).catch(console.error);
      }
    };
  }, [imageId]);

  const value = {
    capturedImage,
    setCapturedImage,
    imageId,
    setImageId,
    selectedGender,
    setSelectedGender,
    selectedScenario,
    setSelectedScenario,
    selectedVideoId,
    setSelectedVideoId,
    taskId,
    setTaskId,
    jobId,
    setJobId,
    videoList,
    setVideoList,
    processingStatus,
    setProcessingStatus,
    resultData,
    setResultData,
    // 처리 상태 관리 함수들
    processedJobs,
    setProcessedJobs,
    currentlyProcessing,
    setCurrentlyProcessing,
    // 팝업 상태 관리
    showCompletionPopup,
    setShowCompletionPopup,
    completionCountdown,
    setCompletionCountdown,
    // 전역 비디오 캐시
    videoCache,
    setVideoCache,
  };

  return (
    <DeepfakeContext.Provider value={value}>
      {children}
    </DeepfakeContext.Provider>
  );
}; 
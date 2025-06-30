import React, { useState, useEffect } from 'react';
import electronApi from '../services/electronApi';
import { checkBackendHealth } from '../services/api';

const RunPodManager = ({ onRunPodReady }) => {
  const [pods, setPods] = useState([]);
  const [selectedPod, setSelectedPod] = useState(null);
  const [podStatus, setPodStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [podUrl, setPodUrl] = useState('');
  const [backendStatus, setBackendStatus] = useState(null); // 백엔드 상태

  useEffect(() => {
    // 컴포넌트 마운트 시 기존 팟 목록 로드
    loadPods();
    
    // 팟 상태 변경 이벤트 리스너 등록
    electronApi.onPodStatusChange((status) => {
      setPodStatus(status);
      setStatusMessage(status.message || '');
    });

    return () => {
      // 컴포넌트 언마운트 시 클린업
    };
  }, []);

  const loadPods = async () => {
    try {
      setIsLoading(true);
      const podList = await electronApi.listPods();
      setPods(podList);
      
      // H200 딥페이크 팟이 있으면 자동 선택
      const deepfakePod = podList.find(pod => 
        pod.name.includes('deepfake') && pod.name.includes('h200')
      );
      if (deepfakePod) {
        setSelectedPod(deepfakePod);
        
        // 팟 상태 확인
        const status = await electronApi.getPodStatus();
        if (status) {
          setPodStatus(status);
          if (status.desiredStatus === 'RUNNING') {
            const url = await electronApi.getPodUrl();
            setPodUrl(url);
          }
        }
      }
    } catch (error) {
      console.error('팟 목록 로드 실패:', error);
      await electronApi.showErrorDialog('오류', `팟 목록을 불러올 수 없습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const findExistingPod = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('기존 H200 팟 찾는 중...');
      
      const result = await electronApi.findPod();
      
      // 결과가 객체인 경우 (상태 정보 포함)
      if (typeof result === 'object' && result.podId) {
        const { podId, status, url, message } = result;
        
        if (status === 'RUNNING') {
          setPodUrl(url);
          setStatusMessage(`실행 중인 팟에 연결됨: ${url}`);
          await electronApi.showInfoDialog('팟 연결 완료', 
            `이미 실행 중인 H200 팟에 연결했습니다!\n\n` +
            `팟 ID: ${podId}\n` +
            `상태: 실행 중\n` +
            `URL: ${url}\n\n` +
            `바로 딥페이크 처리를 시작할 수 있습니다!`
          );
        } else if (status === 'STOPPED') {
          setStatusMessage('중지된 팟을 찾았습니다. 시작할 수 있습니다.');
          await electronApi.showInfoDialog('팟 발견', 
            `중지된 H200 팟을 찾았습니다!\n\n` +
            `팟 ID: ${podId}\n` +
            `상태: 중지됨\n\n` +
            `'팟 시작' 버튼을 클릭하여 팟을 시작하세요.`
          );
        } else {
          setStatusMessage(`팟을 찾았습니다 (상태: ${status})`);
          await electronApi.showInfoDialog('팟 발견', 
            `H200 팟을 찾았습니다!\n\n` +
            `팟 ID: ${podId}\n` +
            `상태: ${status}\n\n` +
            `${message}`
          );
        }
      } else {
        // 기존 방식 (단순 podId 반환)
        setStatusMessage('팟 찾기 완료! 목록을 새로고침합니다...');
        await electronApi.showInfoDialog('성공', `기존 H200 팟을 찾았습니다! ID: ${result}`);
      }
      
      // 팟 목록 새로고침
      await loadPods();
      
    } catch (error) {
      console.error('팟 찾기 실패:', error);
      await electronApi.showErrorDialog('오류', `H200 팟을 찾을 수 없습니다: ${error.message}\n\n웹에서 H200 SXM 팟을 먼저 생성해주세요.`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 5000); // 5초 후 메시지 클리어
    }
  };

  const startSelectedPod = async () => {
    if (!selectedPod) {
      await electronApi.showErrorDialog('오류', '시작할 팟을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage('팟 시작 중...');
      
      const result = await electronApi.startPod(selectedPod.id);
      setPodUrl(result.podUrl);
      setStatusMessage('팟이 성공적으로 시작되었습니다!');
      
      // 상태 새로고침
      const status = await electronApi.getPodStatus();
      setPodStatus(status);
      
    } catch (error) {
      console.error('팟 시작 실패:', error);
      await electronApi.showErrorDialog('오류', `팟 시작에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSelectedPod = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('팟 중지 중...');
      
      await electronApi.stopPod();
      setPodUrl('');
      setStatusMessage('팟이 중지되었습니다.');
      
      // 상태 새로고침
      const status = await electronApi.getPodStatus();
      setPodStatus(status);
      
    } catch (error) {
      console.error('팟 중지 실패:', error);
      await electronApi.showErrorDialog('오류', `팟 중지에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('RunPod 연결 테스트 중...');
      
      const result = await electronApi.testConnection();
      
      if (result.success) {
        setStatusMessage(`연결 성공! 사용자: ${result.user.email}`);
        await electronApi.showInfoDialog('연결 성공', `RunPod에 성공적으로 연결되었습니다!\n사용자: ${result.user.email}`);
      } else {
        setStatusMessage(`연결 실패: ${result.error}`);
        await electronApi.showErrorDialog('연결 실패', `RunPod 연결에 실패했습니다:\n${result.error}`);
      }
    } catch (error) {
      console.error('연결 테스트 실패:', error);
      setStatusMessage(`연결 테스트 실패: ${error.message}`);
      await electronApi.showErrorDialog('오류', `연결 테스트 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const connectViaSSH = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('SSH로 기존 RunPod에 연결 중...');
      
      const result = await electronApi.connectSSH();
      
      if (result.status === 'CONNECTING') {
        setPodUrl(result.url);
        setStatusMessage(`SSH 연결 성공! FaceFusion 시작 중...`);
        
        // 연결 성공을 부모 컴포넌트에 알림
        if (onRunPodReady) {
          onRunPodReady();
        }
        
        await electronApi.showInfoDialog('SSH 연결 성공', 
          `SSH로 기존 RunPod에 연결했습니다!\n\n` +
          `URL: ${result.url}\n\n` +
          `FaceFusion이 시작되면 자동으로 알림을 받게 됩니다.`
        );
      }
    } catch (error) {
      console.error('SSH 연결 실패:', error);
      setStatusMessage(`SSH 연결 실패: ${error.message}`);
      await electronApi.showErrorDialog('SSH 연결 실패', 
        `SSH로 RunPod에 연결할 수 없습니다:\n${error.message}\n\n` +
        `다음을 확인해주세요:\n` +
        `1. SSH 키 파일이 ~/.ssh/id_ed25519 경로에 있는지\n` +
        `2. RunPod 인스턴스가 실행 중인지\n` +
        `3. 네트워크 연결이 정상인지`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const testBackendApi = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('RunPod 백엔드 API 테스트 중...');
      
      const health = await checkBackendHealth();
      setBackendStatus(health);
      setStatusMessage('백엔드 API 연결 성공!');
      
      await electronApi.showInfoDialog('백엔드 API 연결 성공', 
        `RunPod 백엔드 API가 정상적으로 작동 중입니다!\n\n` +
        `API URL: http://205.196.17.43:2999\n` +
        `상태: ${health.status}\n` +
        `메시지: ${health.message}\n\n` +
        `이제 딥페이크 처리를 시작할 수 있습니다!`
      );
    } catch (error) {
      console.error('백엔드 API 테스트 실패:', error);
      setBackendStatus({ status: 'error', message: error.message });
      setStatusMessage('백엔드 API 연결 실패');
      
      await electronApi.showErrorDialog('백엔드 API 연결 실패', 
        `RunPod 백엔드 API에 연결할 수 없습니다:\n${error.message}\n\n` +
        `API URL: http://205.196.17.43:2999\n\n` +
        `SSH 연결 후 백엔드 API가 시작되지 않았을 수 있습니다. 'SSH 연결' 버튼을 다시 클릭해주세요.`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const testFaceFusionApi = async () => {
    if (!podUrl) {
      await electronApi.showErrorDialog('오류', '실행 중인 팟의 URL이 필요합니다.');
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage('FaceFusion API 테스트 중...');
      
      // 팟 URL에서 FaceFusion API 테스트
      const apiUrl = podUrl.replace(':80', ':7860');
      const response = await fetch(`${apiUrl}/health`);
      
      if (response.ok) {
        setStatusMessage('FaceFusion API 연결 성공!');
        await electronApi.showInfoDialog('API 연결 성공', 
          `FaceFusion API가 정상적으로 작동 중입니다!\n\n` +
          `API URL: ${apiUrl}\n` +
          `상태: 정상\n\n` +
          `이제 딥페이크 처리를 시작할 수 있습니다!`
        );
      } else {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
    } catch (error) {
      console.error('FaceFusion API 테스트 실패:', error);
      setStatusMessage('FaceFusion API 연결 실패');
      await electronApi.showErrorDialog('API 연결 실패', 
        `FaceFusion API에 연결할 수 없습니다:\n${error.message}\n\n` +
        `API URL: ${podUrl?.replace(':80', ':7860')}\n\n` +
        `팟이 완전히 시작되지 않았거나 API 서버가 준비되지 않았을 수 있습니다. 잠시 후 다시 시도해주세요.`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const isRunning = podStatus?.desiredStatus === 'RUNNING';
  const isPending = podStatus?.desiredStatus === 'PENDING' || podStatus?.desiredStatus === 'STARTING';

  return (
    <div className="runpod-manager" style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      borderRadius: '10px',
      margin: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      <h2 style={{ 
        color: '#00ff88', 
        textAlign: 'center',
        marginBottom: '30px',
        textShadow: '0 0 10px rgba(0,255,136,0.5)'
      }}>
        🚀 RunPod H200 GPU 관리
      </h2>

      {/* 상태 표시 */}
      {statusMessage && (
        <div style={{
          background: 'rgba(0,255,136,0.1)',
          border: '1px solid #00ff88',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {statusMessage}
        </div>
      )}

      {/* 백엔드 상태 표시 */}
      {backendStatus && (
        <div style={{
          background: backendStatus.status === 'healthy' ? 'rgba(0,255,136,0.1)' : 'rgba(255,107,107,0.1)',
          border: `1px solid ${backendStatus.status === 'healthy' ? '#00ff88' : '#ff6b6b'}`,
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>백엔드 API 상태:</strong> {backendStatus.status} - {backendStatus.message}
        </div>
      )}

      {/* 팟 목록 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>기존 팟 목록:</h3>
        {pods.length === 0 ? (
          <p style={{ color: '#888' }}>H200 팟이 없습니다. 웹에서 H200 SXM 팟을 생성한 후 '팟 찾기'를 클릭해주세요.</p>
        ) : (
          <div>
            {pods.map(pod => (
              <div 
                key={pod.id}
                onClick={() => setSelectedPod(pod)}
                style={{
                  padding: '10px',
                  margin: '5px 0',
                  background: selectedPod?.id === pod.id ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)',
                  border: selectedPod?.id === pod.id ? '2px solid #00ff88' : '1px solid #666',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <strong>{pod.name}</strong> - {pod.desiredStatus}
                <br />
                <small style={{ color: '#888' }}>ID: {pod.id}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 버튼들 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={testConnection}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
          }}
        >
          🔌 연결 테스트
        </button>

        <button 
          onClick={findExistingPod}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(45deg, #00ff88, #00cc6a)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,255,136,0.3)'
          }}
        >
          🔍 H200 팟 찾기
        </button>

        <button 
          onClick={connectViaSSH}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
          }}
        >
          🔐 SSH 연결
        </button>

        <button 
          onClick={testBackendApi}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(45deg, #9c88ff, #8c7ae6)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(156,136,255,0.3)'
          }}
        >
          🧪 백엔드 API 테스트
        </button>

        <button 
          onClick={loadPods}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(78,205,196,0.3)'
          }}
        >
          🔄 새로고침
        </button>

        <button 
          onClick={startSelectedPod}
          disabled={isLoading || !selectedPod || isRunning}
          style={{
            padding: '12px 24px',
            background: isRunning ? '#888' : 'linear-gradient(45deg, #00ff88, #00cc6a)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: (isLoading || !selectedPod || isRunning) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: isRunning ? 'none' : '0 4px 15px rgba(0,255,136,0.3)'
          }}
        >
          {isRunning ? '✅ 실행중' : '▶️ 팟 시작'}
        </button>

        <button 
          onClick={stopSelectedPod}
          disabled={isLoading || !selectedPod || !isRunning}
          style={{
            padding: '12px 24px',
            background: (!isRunning || !selectedPod) ? '#888' : 'linear-gradient(45deg, #ff4757, #ff3742)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: (isLoading || !selectedPod || !isRunning) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: (!isRunning || !selectedPod) ? 'none' : '0 4px 15px rgba(255,71,87,0.3)'
          }}
        >
          ⏹️ 팟 중지
        </button>
      </div>

      {/* 팟 정보 */}
      {selectedPod && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '10px',
          border: '1px solid #444'
        }}>
          <h4 style={{ color: '#00ff88', marginBottom: '10px' }}>선택된 팟 정보:</h4>
          <p><strong>이름:</strong> {selectedPod.name}</p>
          <p><strong>상태:</strong> {podStatus?.desiredStatus || '확인 중...'}</p>
          {podUrl && (
            <div>
              <p><strong>URL:</strong> <a href={podUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88' }}>{podUrl}</a></p>
              <p><strong>API URL:</strong> <span style={{ color: '#00ff88' }}>{podUrl.replace(':80', ':7860')}</span></p>
              
              {isRunning && (
                <button
                  onClick={testFaceFusionApi}
                  disabled={isLoading}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    marginTop: '10px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 10px rgba(255,152,0,0.3)'
                  }}
                >
                  🧪 FaceFusion API 테스트
                </button>
              )}
            </div>
          )}
          
          {isRunning && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              background: 'rgba(0,255,136,0.1)',
              border: '1px solid #00ff88',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#00ff88', fontWeight: 'bold', margin: 0 }}>
                🎉 FaceFusion이 준비되었습니다! 이제 딥페이크 체험을 시작할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            padding: '30px',
            background: '#1a1a2e',
            borderRadius: '15px',
            textAlign: 'center',
            border: '2px solid #00ff88'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #444',
              borderTop: '4px solid #00ff88',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#00ff88', fontWeight: 'bold' }}>처리 중...</p>
            {statusMessage && <p style={{ color: '#fff', fontSize: '14px' }}>{statusMessage}</p>}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default RunPodManager; 